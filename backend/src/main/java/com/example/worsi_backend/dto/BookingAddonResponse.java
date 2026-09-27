package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.BookingAddon;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class BookingAddonResponse {

    private final Long addonId;
    private final String name;
    private final BigDecimal priceAtBooking;

    public BookingAddonResponse(BookingAddon bookingAddon) {
        this.addonId = bookingAddon.getAddon().getId();
        this.name = bookingAddon.getAddon().getName();
        this.priceAtBooking = bookingAddon.getPriceAtBooking();
    }
}