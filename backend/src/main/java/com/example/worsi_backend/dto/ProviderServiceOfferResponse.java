package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.ProviderServicePrice;
import lombok.Getter;

import java.math.BigDecimal;

/** One service a provider has priced: what customers see (and are charged) for that provider. */
@Getter
public class ProviderServiceOfferResponse {

    private final Long serviceId;
    private final String title;
    private final String duration;
    private final BigDecimal price;

    public ProviderServiceOfferResponse(ProviderServicePrice row) {
        this.serviceId = row.getService().getId();
        this.title = row.getService().getTitle();
        this.duration = row.getService().getDuration();
        this.price = row.getPrice();
    }
}
