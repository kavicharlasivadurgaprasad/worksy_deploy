package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.Service;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
public class ServiceResponse {

    private final Long id;
    private final Long categoryId;
    private final String categoryName;
    private final String title;
    /**
     * Lowest price any provider currently charges for this service, or null when no provider has set a
     * price yet ("Price not set"). The exact price a customer pays is the chosen provider's own price.
     */
    private final BigDecimal startingPrice;
    /** How many providers have set a price for this service. */
    private final long providerCount;
    private final String duration;
    private final String description;
    private final String imageUrl;
    private final String badge;
    private final String cancellationPolicy;
    private final List<ServiceAddonResponse> addons;

    /** For a service with no provider prices known to the caller (e.g. just created). */
    public ServiceResponse(Service service) {
        this(service, null, 0L);
    }

    public ServiceResponse(Service service, BigDecimal startingPrice, long providerCount) {
        this.id = service.getId();
        this.categoryId = service.getCategory().getId();
        this.categoryName = service.getCategory().getName();
        this.title = service.getTitle();
        this.startingPrice = startingPrice;
        this.providerCount = providerCount;
        this.duration = service.getDuration();
        this.description = service.getDescription();
        this.imageUrl = service.getImageUrl();
        this.badge = service.getBadge();
        this.cancellationPolicy = service.getCancellationPolicy();
        this.addons = service.getAddons().stream()
                .map(ServiceAddonResponse::new)
                .toList();
    }
}