
package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Pattern(
            regexp = "(?i)^[^\\s@]+@[^\\s@]+\\.com$",
            message = "Email must be a valid address ending with .com"
    )
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[^\\p{L}\\p{N}\\s]).+$",
            message = "Password must contain at least one uppercase letter and one special character"
    )
    private String password;

    @NotNull(message = "Role is required")
    private Role role;
}
