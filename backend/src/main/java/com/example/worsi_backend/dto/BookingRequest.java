package com.example.worsi_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class BookingRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Provider ID is required")
    private Long providerId;

    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotNull(message = "Address ID is required")
    private Long addressId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Time slot is required")
    private String timeSlot;

    private String problemDescription;

    private String paymentMethod;

    private List<Long> addonIds = new ArrayList<>();
}