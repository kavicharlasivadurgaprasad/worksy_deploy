package com.example.worsi_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/** Body of PUT /users/{userId}/provider-profile/services/{serviceId}/price. Range and precision are checked in the service. */
@Getter
@Setter
public class ProviderServicePriceRequest {

    @NotNull(message = "Price is required")
    private BigDecimal price;
}
