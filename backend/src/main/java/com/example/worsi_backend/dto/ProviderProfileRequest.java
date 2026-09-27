package com.example.worsi_backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProviderProfileRequest {

    @NotBlank(message = "Business name is required")
    private String businessName;

    private String tagline;

    @NotBlank(message = "Category is required")
    private String category;

    @Min(value = 0, message = "Experience years cannot be negative")
    private int experienceYears;

    private String responseTime;

    private String serviceArea;

    private String availability;
}