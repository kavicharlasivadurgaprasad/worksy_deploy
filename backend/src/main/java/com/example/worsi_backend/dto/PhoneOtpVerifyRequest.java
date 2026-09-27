package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PhoneOtpVerifyRequest {

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+[1-9]\\d{7,14}$", message = "Phone number must be in international format, e.g. +919876543210")
    private String phone;

    @NotBlank(message = "OTP is required")
    @Pattern(regexp = "^\\d{6}$", message = "OTP must be 6 digits")
    private String otp;

    // Only used if this phone number has no existing account yet (registration). Defaults to
    // CUSTOMER when omitted so the field stays optional for returning users.
    private Role role;
}
