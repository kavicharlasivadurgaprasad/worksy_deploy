package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.ProviderProfile;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Getter
public class ProviderProfileResponse {

    private final Long id;
    private final Long userId;
    /** Provider's saved profile picture (path relative to the API base), or null when none was uploaded. */
    private final String avatarUrl;
    private final String businessName;
    private final String tagline;
    private final String description;
    private final String category;
    /** Average of real customer ratings, or null when the provider has none. Never a default value. */
    private final Double rating;
    /** Number of real reviews behind {@link #rating} (0 when there are none). */
    private final long reviewCount;
    /** Bookings of this provider that are genuinely COMPLETED, counted from the bookings table. */
    private final int completedJobs;
    private final int experienceYears;
    private final String responseTime;
    private final String serviceArea;
    private final String availability;
    private final boolean verified;
    private final String badge;
    private final boolean acceptingBookings;
    private final Double serviceRadiusKm;
    /** True once the provider has set a location. The coordinates themselves are never exposed. */
    private final boolean locationSet;
    /** Services this provider has priced (the only ones customers can book). Empty = nothing priced yet. */
    private final List<ProviderServiceOfferResponse> services;
    /** Lowest price among {@link #services}, or null when the provider has not set any price. */
    private final BigDecimal startingPrice;

    public ProviderProfileResponse(ProviderProfile profile, ProviderStats stats,
                                   List<ProviderServiceOfferResponse> services) {
        ProviderStats s = stats == null ? ProviderStats.NONE : stats;
        List<ProviderServiceOfferResponse> offers = services == null ? List.of() : services;

        this.id = profile.getId();
        this.userId = profile.getUser().getId();
        this.avatarUrl = profile.getUser().getAvatarUrl();
        this.businessName = profile.getBusinessName();
        this.tagline = profile.getTagline();
        this.description = profile.getDescription();
        this.category = profile.getCategory();
        this.rating = s.averageRating();
        this.reviewCount = s.reviewCount();
        this.completedJobs = (int) s.completedJobs();
        this.experienceYears = profile.getExperienceYears();
        this.responseTime = profile.getResponseTime();
        this.serviceArea = profile.getServiceArea();
        this.availability = profile.getAvailability();
        this.verified = profile.isVerified();
        this.badge = profile.getBadge();
        this.acceptingBookings = profile.isAcceptingBookings();
        this.serviceRadiusKm = profile.getServiceRadiusKm();
        this.locationSet = profile.hasLocation();
        this.services = offers;
        this.startingPrice = offers.stream()
                .map(ProviderServiceOfferResponse::getPrice)
                .min(Comparator.naturalOrder())
                .orElse(null);
    }
}
