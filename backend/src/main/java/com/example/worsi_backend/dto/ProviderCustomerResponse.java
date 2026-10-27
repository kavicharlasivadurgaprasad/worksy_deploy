package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.BookingStatus;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * One row of the provider's "My Customers" list: a customer who has a real, non-cancelled booking
 * with THIS provider. Everything is derived from the bookings table.
 *
 * Deliberately NOT included: email, password data, auth ids, the customer's full street address and
 * any customer-to-provider rating or "notes" (the system does not store those, so they are never invented).
 * The phone number is what the provider already receives on every booking they are assigned.
 */
@Getter
public class ProviderCustomerResponse {

    /** The customer's account (User) id; used to open a chat with them. */
    private final Long customerId;
    private final String name;
    /** Path relative to the API base, or null when the customer has not uploaded a picture. */
    private final String avatarUrl;
    private final String phone;
    /** Bookings with this provider that are not cancelled/declined. */
    private final int totalBookings;
    private final int completedBookings;
    /** Sum of totals of this customer's COMPLETED bookings with this provider (0 when none). */
    private final BigDecimal totalSpent;
    /** Date and title of the most recent non-cancelled booking, and its status. */
    private final LocalDate lastBookingDate;
    private final String lastServiceTitle;
    private final BookingStatus lastStatus;
    /** "Area, City" of the most recent booking only (no street / door number). */
    private final String lastLocation;

    public ProviderCustomerResponse(Long customerId, String name, String avatarUrl, String phone,
                                    int totalBookings, int completedBookings, BigDecimal totalSpent,
                                    LocalDate lastBookingDate, String lastServiceTitle,
                                    BookingStatus lastStatus, String lastLocation) {
        this.customerId = customerId;
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.phone = phone;
        this.totalBookings = totalBookings;
        this.completedBookings = completedBookings;
        this.totalSpent = totalSpent;
        this.lastBookingDate = lastBookingDate;
        this.lastServiceTitle = lastServiceTitle;
        this.lastStatus = lastStatus;
        this.lastLocation = lastLocation;
    }
}
