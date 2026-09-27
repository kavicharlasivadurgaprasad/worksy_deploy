package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.Booking;
import com.example.worsi_backend.Entity.BookingStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
public class BookingResponse {

    private final Long id;
    private final Long customerId;
    private final String customerName;
    private final Long providerId;
    private final Long providerUserId;
    private final String providerBusinessName;
    private final Long serviceId;
    private final String serviceTitle;
    private final Long addressId;
    private final String addressLabel;
    private final String street;
    private final String area;
    private final String city;
    private final String pincode;
    private final String customerPhone;
    private final String providerPhone;
    private final LocalDate date;
    private final String timeSlot;
    private final String problemDescription;
    private final BigDecimal basePrice;
    private final BigDecimal addonsTotal;
    private final BigDecimal totalAmount;
    private final String paymentMethod;
    private final BookingStatus status;
    @Setter private String otp;   // hidden (null) in provider-facing responses
    private final List<BookingAddonResponse> addons;

    // Populated by BookingService (needs a review lookup, not available from the Booking entity alone)
    @Setter private boolean reviewed;
    @Setter private Integer ratingGiven;
    @Setter private String reviewGiven;

    public BookingResponse(Booking booking) {
        this.id = booking.getId();
        this.customerId = booking.getCustomer().getId();
        this.customerName = booking.getCustomer().getName();
        this.providerId = booking.getProvider().getId();
        this.providerUserId = booking.getProvider().getUser().getId();
        this.providerBusinessName = booking.getProvider().getBusinessName();
        this.serviceId = booking.getService().getId();
        this.serviceTitle = booking.getService().getTitle();
        this.addressId = booking.getAddress().getId();
        this.addressLabel = booking.getAddress().getLabel().name();
        this.street = booking.getAddress().getStreet();
        this.area = booking.getAddress().getArea();
        this.city = booking.getAddress().getCity();
        this.pincode = booking.getAddress().getPincode();
        this.customerPhone = booking.getCustomer().getPhone();
        this.providerPhone = booking.getProvider().getUser().getPhone();
        this.date = booking.getDate();
        this.timeSlot = booking.getTimeSlot();
        this.problemDescription = booking.getProblemDescription();
        this.basePrice = booking.getBasePrice();
        this.addonsTotal = booking.getAddonsTotal();
        this.totalAmount = booking.getTotalAmount();
        this.paymentMethod = booking.getPaymentMethod();
        this.status = booking.getStatus();
        this.otp = booking.getOtp();
        this.addons = booking.getBookingAddons().stream()
                .map(BookingAddonResponse::new)
                .toList();
    }
}