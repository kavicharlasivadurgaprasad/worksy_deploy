package com.example.worsi_backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ServiceRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "Title is required")
    private String title;

    // No price here: prices belong to providers (PUT /users/{id}/provider-profile/services/{serviceId}/price).

    @NotBlank(message = "Duration is required")
    private String duration;

    private String description;

    private String imageUrl;

    private String cancellationPolicy;

    @Valid
    private List<ServiceAddonRequest> addons = new ArrayList<>();
}