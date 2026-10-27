package com.example.worsi_backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProviderProfileRequest {

    @NotBlank(message = "Business name is required")
    private String businessName;

    private String tagline;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @Min(value = 0, message = "Experience years cannot be negative")
    private int experienceYears;

    private String responseTime;

    private String serviceArea;

    private String availability;

    /**
     * Optional prices the provider enters while creating the profile (one per service they want to offer).
     * Saved in the same transaction as the profile. No price is ever invented for a service left out.
     */
    @Valid
    private List<ProviderServicePriceEntry> servicePrices;
}