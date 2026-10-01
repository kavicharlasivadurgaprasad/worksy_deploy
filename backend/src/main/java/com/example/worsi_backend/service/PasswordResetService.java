package com.example.worsi_backend.service;

import com.example.worsi_backend.Entity.PasswordResetToken;
import com.example.worsi_backend.Entity.User;
import com.example.worsi_backend.Exception.BadRequestException;
import com.example.worsi_backend.repository.PasswordResetTokenRepository;
import com.example.worsi_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

/**
 * Forgot-password / reset-password lifecycle.
 *
 * Token: 32 random bytes from SecureRandom (256 bits), URL-safe Base64. Only its SHA-256 hash is
 * stored. (SHA-256 rather than BCrypt on purpose: the token already has 256 bits of entropy so it
 * cannot be brute-forced, and we must look the row up by hash - BCrypt's per-hash salt would make
 * that impossible. The low-entropy 6-digit phone OTP is the case where BCrypt is needed.)
 *
 * requestReset() never reveals whether the email is registered and never throws for an unknown or
 * rate-limited email. resetPassword() consumes the token with one atomic conditional UPDATE.
 */
@Service
public class PasswordResetService {

    static final String INVALID_LINK_MESSAGE = "This password reset link is invalid or has expired. Please request a new one.";
    private static final int BCRYPT_MAX_BYTES = 72;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    private final int expiryMinutes;
    private final int cooldownSeconds;
    private final int maxRequestsPerWindow;
    private final int requestWindowMinutes;
    private final String frontendBaseUrl;

    public PasswordResetService(UserRepository userRepository,
                                 PasswordResetTokenRepository tokenRepository,
                                 PasswordEncoder passwordEncoder,
                                 EmailService emailService,
                                 @Value("${app.password-reset.expiry-minutes:30}") int expiryMinutes,
                                 @Value("${app.password-reset.cooldown-seconds:60}") int cooldownSeconds,
                                 @Value("${app.password-reset.max-requests-per-window:3}") int maxRequestsPerWindow,
                                 @Value("${app.password-reset.request-window-minutes:60}") int requestWindowMinutes,
                                 @Value("${app.frontend.base-url:http://localhost:3000}") String frontendBaseUrl) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.expiryMinutes = expiryMinutes;
        this.cooldownSeconds = cooldownSeconds;
        this.maxRequestsPerWindow = maxRequestsPerWindow;
        this.requestWindowMinutes = requestWindowMinutes;
        this.frontendBaseUrl = frontendBaseUrl.trim().replaceAll("/+$", "");
    }

    /**
     * Step 1. Silent no-op when the email is unknown or the account is rate limited, so the
     * controller can always return the same response.
     */
    @Transactional
    public void requestReset(String rawEmail) {
        String email = rawEmail == null ? "" : rawEmail.trim();
        Optional<User> found = userRepository.findByEmail(email);
        if (found.isEmpty()) {
            return;
        }
        User user = found.get();
        LocalDateTime now = LocalDateTime.now();

        // Per-account abuse limits (silently skipped, never an error - an error would reveal the account exists).
        Optional<PasswordResetToken> latest = tokenRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId());
        if (latest.isPresent() && latest.get().getCreatedAt().plusSeconds(cooldownSeconds).isAfter(now)) {
            return;
        }
        if (tokenRepository.countByUserIdAndCreatedAtAfter(user.getId(), now.minusMinutes(requestWindowMinutes))
                >= maxRequestsPerWindow) {
            return;
        }

        // Housekeeping + only the newest link may work.
        tokenRepository.deleteExpiredBefore(now.minusDays(1));
        tokenRepository.invalidateAllForUser(user.getId());

        String rawToken = generateToken();
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setTokenHash(hash(rawToken));
        token.setCreatedAt(now);
        token.setExpiresAt(now.plusMinutes(expiryMinutes));
        tokenRepository.save(token);

        String link = frontendBaseUrl + "/reset-password?token=" + rawToken;
        String to = user.getEmail();
        String name = user.getName();
        runAfterCommit(() -> emailService.sendPasswordResetEmail(to, name, link));
    }

    /** Step 2. Every failure to accept the token yields the same 400 message. */
    @Transactional
    public void resetPassword(String rawToken, String newPassword, String confirmPassword) {
        if (newPassword == null || !newPassword.equals(confirmPassword)) {
            throw new BadRequestException("Passwords do not match.");
        }
        if (newPassword.getBytes(StandardCharsets.UTF_8).length > BCRYPT_MAX_BYTES) {
            throw new BadRequestException("Password is too long (maximum 72 bytes).");
        }

        PasswordResetToken token = tokenRepository.findByTokenHashWithUser(hash(rawToken.trim()))
                .orElseThrow(() -> new BadRequestException(INVALID_LINK_MESSAGE));

        LocalDateTime now = LocalDateTime.now();
        // Atomic single-use claim: 0 rows = already used or expired (or a concurrent request won).
        if (tokenRepository.claimIfValid(token.getId(), now) != 1) {
            throw new BadRequestException(INVALID_LINK_MESSAGE);
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword)); // same BCrypt encoder login uses
        user.setPasswordChangedAt(now); // revokes every JWT issued before this moment
        userRepository.save(user);

        tokenRepository.invalidateAllForUser(user.getId()); // any other outstanding links die too

        String to = user.getEmail();
        String name = user.getName();
        runAfterCommit(() -> emailService.sendPasswordChangedEmail(to, name));
    }

    // ------------------------------------------------------------------

    private String generateToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    static String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }

    /** Sends only if the DB transaction actually committed (so no email for a rolled-back token). */
    private void runAfterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    action.run();
                }
            });
        } else {
            action.run();
        }
    }
}
