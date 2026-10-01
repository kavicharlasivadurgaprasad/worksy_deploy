package com.example.worsi_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank(message = "Reset token is required")
    private String token;

    // 72 = BCrypt's hard input limit (PasswordResetService also checks the UTF-8 byte length).
    @NotBlank(message = "New password is required")
    @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
    private String newPassword;

    @NotBlank(message = "Please confirm your new password")
    private String confirmPassword;
}
