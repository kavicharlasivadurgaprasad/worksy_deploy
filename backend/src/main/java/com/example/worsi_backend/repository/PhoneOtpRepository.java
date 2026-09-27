package com.example.worsi_backend.repository;

import com.example.worsi_backend.Entity.PhoneOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PhoneOtpRepository extends JpaRepository<PhoneOtp, Long> {

    /** Most recent OTP for this phone, used to check the resend cooldown and to verify against. */
    Optional<PhoneOtp> findTopByPhoneOrderByCreatedAtDesc(String phone);

    /** How many OTPs have been requested for this phone in the current rate-limit window. */
    long countByPhoneAndCreatedAtAfter(String phone, LocalDateTime since);
}
