
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

@Service
public class PasswordResetService {

    static final String INVALID_LINK_MESSAGE =
            "This password reset link is invalid or has expired. Please request a new one.";

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

    public PasswordResetService(
            UserRepository userRepository,
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
     * Sends a reset email when an eligible account exists.
     * Unknown and rate-limited accounts receive the same public response.
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

        Optional<PasswordResetToken> latest =
                tokenRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId());

        if (latest.isPresent()
                && latest.get().getCreatedAt()
                .plusSeconds(cooldownSeconds).isAfter(now)) {
            return;
        }

        if (tokenRepository.countByUserIdAndCreatedAtAfter(
                user.getId(), now.minusMinutes(requestWindowMinutes))
                >= maxRequestsPerWindow) {
            return;
        }

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

        runAfterCommit(() ->
                emailService.sendPasswordResetEmail(to, name, link));
    }

    /**
     * Validates the new password, verifies the reset token,
     * updates the password and invalidates reset tokens.
     */
    @Transactional
    public void resetPassword(
            String rawToken,
            String newPassword,
            String confirmPassword) {

        if (newPassword == null || !newPassword.equals(confirmPassword)) {
            throw new BadRequestException("Passwords do not match.");
        }

        // Repeat important password checks in the service layer.
        if (newPassword.length() < 8) {
            throw new BadRequestException(
                    "Password must be between 8 and 72 characters.");
        }

        if (newPassword.getBytes(StandardCharsets.UTF_8).length
                > BCRYPT_MAX_BYTES) {
            throw new BadRequestException(
                    "Password is too long (maximum 72 bytes).");
        }

        boolean hasUppercase =
                newPassword.chars().anyMatch(Character::isUpperCase);

        boolean hasSpecialCharacter =
                newPassword.chars().anyMatch(
                        ch -> !Character.isLetterOrDigit(ch)
                                && !Character.isWhitespace(ch));

        if (!hasUppercase || !hasSpecialCharacter) {
            throw new BadRequestException(
                    "Password must contain at least one uppercase letter "
                            + "and one special character.");
        }

        if (rawToken == null || rawToken.isBlank()) {
            throw new BadRequestException(INVALID_LINK_MESSAGE);
        }

        PasswordResetToken token =
                tokenRepository.findByTokenHashWithUser(
                                hash(rawToken.trim()))
                        .orElseThrow(() ->
                                new BadRequestException(INVALID_LINK_MESSAGE));

        LocalDateTime now = LocalDateTime.now();

        // Atomically claim the token so it can only be used once.
        if (tokenRepository.claimIfValid(token.getId(), now) != 1) {
            throw new BadRequestException(INVALID_LINK_MESSAGE);
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(now);
        userRepository.save(user);

        tokenRepository.invalidateAllForUser(user.getId());

        String to = user.getEmail();
        String name = user.getName();

        runAfterCommit(() ->
                emailService.sendPasswordChangedEmail(to, name));
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    static String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(
                    digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(
                    "SHA-256 is not available", e);
        }
    }

    /**
     * Send email only after the database transaction commits.
     */
    private void runAfterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
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
