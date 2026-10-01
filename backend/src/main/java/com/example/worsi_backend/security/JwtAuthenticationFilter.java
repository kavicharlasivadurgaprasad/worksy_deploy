package com.example.worsi_backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final TokenRevocationService tokenRevocationService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, TokenRevocationService tokenRevocationService) {
        this.jwtUtil = jwtUtil;
        this.tokenRevocationService = tokenRevocationService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            // A token issued before the user's last password reset is treated as no token at all.
            if (jwtUtil.isTokenValid(token) && !tokenRevocationService.isRevoked(token)) {
                Long userId = jwtUtil.extractUserId(token);
                String role = jwtUtil.extractRole(token);

                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));

                var authentication = new UsernamePasswordAuthenticationToken(
                        userId, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}