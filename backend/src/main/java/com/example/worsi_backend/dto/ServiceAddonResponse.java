package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.ServiceAddon;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class ServiceAddonResponse {

    private final Long id;
    private final String name;
    private final BigDecimal price;
    private final String description;

    public ServiceAddonResponse(ServiceAddon addon) {
        this.id = addon.getId();
        this.name = addon.getName();
        this.price = addon.getPrice();
        this.description = addon.getDescription();
    }
}