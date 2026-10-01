package com.example.worsi_backend.security;

import com.example.worsi_backend.repository.UserRepository;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;

/**
 * Makes stateless JWTs revocable after a password reset. A token is rejected when it was issued
 * before the user's users.password_changed_at. Users who never reset (NULL) are unaffected.
 * Used by both the REST filter and the WebSocket handshake so an old token cannot keep a chat open.
 */
@Component
public class TokenRevocationService {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public TokenRevocationService(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    /** True if the (already signature-verified) token predates the user's last password reset. */
    public boolean isRevoked(String token) {
        Claims claims = jwtUtil.extractClaims(token);
        Date issuedAt = claims.getIssuedAt();
        if (issuedAt == null) {
            return false;
        }
        Long userId = Long.valueOf(claims.getSubject());
        Optional<LocalDateTime> changedAt = userRepository.findPasswordChangedAtById(userId);
        if (changedAt.isEmpty()) {
            return false;
        }
        // JWT "iat" has 1-second precision, so compare at 1-second precision too.
        Instant changed = changedAt.get().atZone(ZoneId.systemDefault()).toInstant().truncatedTo(ChronoUnit.SECONDS);
        return issuedAt.toInstant().isBefore(changed);
    }
}
