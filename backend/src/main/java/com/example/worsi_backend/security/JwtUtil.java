package com.example.worsi_backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);
    private static final long EXPIRATION_MS = 1000 * 60 * 60 * 24; // 24 hours

    private final SecretKey secretKey;

    /**
     * The signing key comes from configuration (app.jwt.secret / JWT_SECRET env var) so that
     * tokens survive a backend restart. If it is missing we fall back to a random key and warn,
     * because every restart would then log all users out.
     */
    public JwtUtil(@Value("${app.jwt.secret:}") String secret) {
        if (secret == null || secret.isBlank()) {
            log.warn("app.jwt.secret is not set - using a random signing key; all tokens become invalid on restart");
            this.secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        } else {
            // HS256 needs >= 32 bytes; hmacShaKeyFor throws WeakKeyException otherwise (fail fast).
            this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        }
    }

    public String generateToken(Long userId, String email, String role) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(secretKey)
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Long extractUserId(String token) {
        return Long.valueOf(extractClaims(token).getSubject());
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
