package com.example.worsi_backend.service;

import com.example.worsi_backend.Entity.PhoneOtp;
import com.example.worsi_backend.Exception.BadRequestException;
import com.example.worsi_backend.Exception.TooManyRequestsException;
import com.example.worsi_backend.Exception.UnauthorizedException;
import com.example.worsi_backend.repository.PhoneOtpRepository;
import com.example.worsi_backend.service.sms.SmsSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

/**
 * Phone-login OTP lifecycle: generate, send (via SmsSender), verify. The code is generated with
 * SecureRandom, hashed with the app's normal PasswordEncoder (BCrypt) before it is persisted, is
 * never included in any API response, expires after app.otp.expiry-minutes, can only be consumed
 * once, and is rate-limited both on request (resend cooldown + max requests per window) and on
 * verification (max attempts per code).
 */
@Service
public class OtpService {

    private final PhoneOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final SmsSender smsSender;
    private final SecureRandom random = new SecureRandom();

    private final int expiryMinutes;
    private final int maxRequestsPerWindow;
    private final int requestWindowMinutes;
    private final int resendCooldownSeconds;
    private final int maxVerifyAttempts;

    public OtpService(PhoneOtpRepository otpRepository,
                       PasswordEncoder passwordEncoder,
                       SmsSender smsSender,
                       @Value("${app.otp.expiry-minutes:5}") int expiryMinutes,
                       @Value("${app.otp.max-requests-per-window:5}") int maxRequestsPerWindow,
                       @Value("${app.otp.request-window-minutes:15}") int requestWindowMinutes,
                       @Value("${app.otp.resend-cooldown-seconds:30}") int resendCooldownSeconds,
                       @Value("${app.otp.max-verify-attempts:5}") int maxVerifyAttempts) {
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.smsSender = smsSender;
        this.expiryMinutes = expiryMinutes;
        this.maxRequestsPerWindow = maxRequestsPerWindow;
        this.requestWindowMinutes = requestWindowMinutes;
        this.resendCooldownSeconds = resendCooldownSeconds;
        this.maxVerifyAttempts = maxVerifyAttempts;
    }

    public int getExpiryMinutes() {
        return expiryMinutes;
    }

    public int getResendCooldownSeconds() {
        return resendCooldownSeconds;
    }

    @Transactional
    public void sendOtp(String phone) {
        LocalDateTime now = LocalDateTime.now();

        otpRepository.findTopByPhoneOrderByCreatedAtDesc(phone).ifPresent(latest -> {
            LocalDateTime canResendAt = latest.getCreatedAt().plusSeconds(resendCooldownSeconds);
            if (canResendAt.isAfter(now)) {
                throw new TooManyRequestsException("Please wait before requesting another OTP.");
            }
        });

        long recentRequests = otpRepository.countByPhoneAndCreatedAtAfter(phone, now.minusMinutes(requestWindowMinutes));
        if (recentRequests >= maxRequestsPerWindow) {
            throw new TooManyRequestsException("Too many OTP requests for this number. Please try again later.");
        }

        String code = generateCode();

        PhoneOtp otp = new PhoneOtp();
        otp.setPhone(phone);
        otp.setOtpHash(passwordEncoder.encode(code));
        otp.setCreatedAt(now);
        otp.setExpiresAt(now.plusMinutes(expiryMinutes));
        otpRepository.save(otp);

        smsSender.send(phone, "Your Worksy verification code is " + code + ". It expires in " + expiryMinutes + " minutes.");
    }

    /** Throws if the code is missing/expired/wrong/over-attempted; returns normally on success. */
    @Transactional
    public void verifyOtp(String phone, String code) {
        PhoneOtp otp = otpRepository.findTopByPhoneOrderByCreatedAtDesc(phone)
                .orElseThrow(() -> new BadRequestException("No OTP was requested for this phone number."));

        if (otp.isConsumed()) {
            throw new BadRequestException("This OTP has already been used. Please request a new one.");
        }
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            otp.setConsumed(true);
            otpRepository.save(otp);
            throw new BadRequestException("This OTP has expired. Please request a new one.");
        }
        if (otp.getAttemptCount() >= maxVerifyAttempts) {
            otp.setConsumed(true);
            otpRepository.save(otp);
            throw new TooManyRequestsException("Too many incorrect attempts. Please request a new OTP.");
        }

        boolean matches = passwordEncoder.matches(code, otp.getOtpHash());
        otp.setAttemptCount(otp.getAttemptCount() + 1);

        if (!matches) {
            otpRepository.save(otp);
            throw new UnauthorizedException("Invalid OTP.");
        }

        otp.setConsumed(true);
        otpRepository.save(otp);
    }

    private String generateCode() {
        int value = 100000 + random.nextInt(900000); // always 6 digits
        return String.valueOf(value);
    }
}
