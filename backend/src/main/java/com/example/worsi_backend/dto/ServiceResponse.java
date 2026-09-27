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
    private final BigDecimal price;
    private final String duration;
    private final String description;
    private final String imageUrl;
    private final String badge;
    private final String cancellationPolicy;
    private final List<ServiceAddonResponse> addons;

    public ServiceResponse(Service service) {
        this.id = service.getId();
        this.categoryId = service.getCategory().getId();
        this.categoryName = service.getCategory().getName();
        this.title = service.getTitle();
        this.price = service.getPrice();
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