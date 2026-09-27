package com.example.worsi_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StartJobRequest {
    @NotBlank(message = "OTP is required")
    private String otp;
}
