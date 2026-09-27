package com.example.worsi_backend.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * A single OTP challenge for phone login. The code itself is never stored in plain text - only
 * otpHash (BCrypt, via the same PasswordEncoder used for account passwords) is persisted, and the
 * code is never echoed back in any API response. See OtpService for generation/verification rules
 * (5 minute expiry, single use, rate limiting).
 */
@Entity
@Table(name = "phone_otps", indexes = {
        @Index(name = "idx_phone_otps_phone", columnList = "phone")
})
@Getter
@Setter
@NoArgsConstructor
public class PhoneOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String phone;

    @Column(name = "otp_hash", nullable = false)
    private String otpHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean consumed = false;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
