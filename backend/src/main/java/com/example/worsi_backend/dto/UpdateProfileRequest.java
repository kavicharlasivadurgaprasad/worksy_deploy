package com.example.worsi_backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Body of PUT /api/v1/profile/me. Only fields a user may change appear here; there is deliberately
 * no id, role, email, password, rating, verified flag or coordinates, so they cannot be set even if
 * a client sends them (Jackson ignores unknown properties).
 *
 * Text fields: null = leave unchanged, "" = clear (where clearing is allowed).
 */
@Getter
@Setter
public class UpdateProfileRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    /** E.164, e.g. +919876543210. null = unchanged, "" = remove. Changing it needs {@code phoneOtp}. */
    @Pattern(regexp = "^(\\+[1-9]\\d{7,14})?$", message = "Phone number must be in international format, e.g. +919876543210")
    private String phone;

    /** 6-digit code sent to the NEW phone number (via POST /auth/phone/send-otp). Required when phone changes. */
    @Pattern(regexp = "^(\\d{6})?$", message = "OTP must be 6 digits")
    private String phoneOtp;

    /** Customers only. */
    @Valid
    private AddressPart address;

    /** Providers only. */
    @Valid
    private ProviderPart provider;

    @Getter
    @Setter
    public static class AddressPart {

        @NotBlank(message = "Address is required")
        @Size(max = 255, message = "Address cannot exceed 255 characters")
        private String street;

        @NotBlank(message = "City / locality is required")
        @Size(max = 255, message = "City / locality cannot exceed 255 characters")
        private String area;

        @NotBlank(message = "City is required")
        @Size(max = 255, message = "City cannot exceed 255 characters")
        private String city;

        @Size(max = 100, message = "State cannot exceed 100 characters")
        private String state;

        @NotBlank(message = "PIN code is required")
        @Pattern(regexp = "^[1-9]\\d{5}$", message = "PIN code must be 6 digits")
        private String pincode;
    }

    @Getter
    @Setter
    public static class ProviderPart {

        @NotBlank(message = "Business name is required")
        @Size(max = 255, message = "Business name cannot exceed 255 characters")
        private String businessName;

        @Size(max = 255, message = "Tagline cannot exceed 255 characters")
        private String tagline;

        @Size(max = 1000, message = "Description cannot exceed 1000 characters")
        private String description;

        /** Optional. Changing it is refused while the provider has pending / upcoming / ongoing jobs. */
        @Size(max = 255, message = "Category cannot exceed 255 characters")
        private String category;

        @NotNull(message = "Years of experience is required")
        @Min(value = 0, message = "Experience cannot be negative")
        @Max(value = 60, message = "Experience cannot exceed 60 years")
        private Integer experienceYears;

        @Size(max = 255, message = "Response time cannot exceed 255 characters")
        private String responseTime;

        /** Only editable while no map location is saved; otherwise change it via PUT .../provider-profile/location. */
        @Size(max = 255, message = "Service area cannot exceed 255 characters")
        private String serviceArea;
    }
}
