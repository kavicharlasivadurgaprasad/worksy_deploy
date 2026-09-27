package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.AddressLabel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressRequest {

    @NotNull(message = "Label is required")
    private AddressLabel label;

    @NotBlank(message = "Street is required")
    private String street;

    @NotBlank(message = "Area is required")
    private String area;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    private boolean defaultAddress;
}