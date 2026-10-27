package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.ProviderServicePrice;
import com.example.worsi_backend.Entity.Service;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * One row of the provider's "Manage Services and Prices" screen: a catalogue service in the provider's
 * category plus the provider's own price for it. price is null (and priceSet false) until the provider
 * sets one; no default is ever substituted.
 */
@Getter
public class ProviderServicePriceResponse {

    private final Long serviceId;
    private final String title;
    private final String categoryName;
    private final String duration;
    private final String description;
    private final BigDecimal price;
    private final boolean priceSet;
    private final Instant updatedAt;

    public ProviderServicePriceResponse(Service service, ProviderServicePrice priceRow) {
        this.serviceId = service.getId();
        this.title = service.getTitle();
        this.categoryName = service.getCategory().getName();
        this.duration = service.getDuration();
        this.description = service.getDescription();
        this.price = priceRow == null ? null : priceRow.getPrice();
        this.priceSet = priceRow != null;
        this.updatedAt = priceRow == null ? null : priceRow.getUpdatedAt();
    }
}
