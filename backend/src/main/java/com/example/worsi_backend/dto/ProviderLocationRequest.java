package com.example.worsi_backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Provider updates their own base location (coordinates + service area text) and/or availability. Every field is optional, but
 * latitude and longitude must be supplied together.
 */
@Getter
@Setter
public class ProviderLocationRequest {

    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    @DecimalMin(value = "0.5", message = "Service radius must be at least 0.5 km")
    @DecimalMax(value = "200.0", message = "Service radius cannot exceed 200 km")
    private Double serviceRadiusKm;

    private Boolean acceptingBookings;

    /** Human-readable service area / address that matches the coordinates, e.g. "Madanapalle, Andhra Pradesh". */
    @Size(max = 255, message = "Service area cannot exceed 255 characters")
    private String serviceArea;
}
