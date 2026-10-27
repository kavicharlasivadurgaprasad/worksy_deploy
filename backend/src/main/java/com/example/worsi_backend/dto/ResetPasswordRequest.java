
package com.example.worsi_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank(message = "Reset token is required")
    private String token;

    // BCrypt's maximum input is 72 UTF-8 bytes.
    @NotBlank(message = "New password is required")
    @Size(
            min = 8,
            max = 72,
            message = "Password must be between 8 and 72 characters"
    )
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[^\\p{L}\\p{N}\\s]).+$",
            message = "Password must contain at least one uppercase letter and one special character"
    )
    private String newPassword;

    @NotBlank(message = "Please confirm your new password")
    private String confirmPassword;
}
