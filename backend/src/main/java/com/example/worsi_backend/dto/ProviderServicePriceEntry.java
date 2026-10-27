package com.example.worsi_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * One (service, price) pair sent by a provider, either inside the create-profile request or in the bulk
 * "save prices" request. Range / precision rules are enforced in ProviderPricingService.
 */
@Getter
@Setter
public class ProviderServicePriceEntry {

    @NotNull(message = "Service is required for every price")
    private Long serviceId;

    @NotNull(message = "Price is required")
    private BigDecimal price;
}
