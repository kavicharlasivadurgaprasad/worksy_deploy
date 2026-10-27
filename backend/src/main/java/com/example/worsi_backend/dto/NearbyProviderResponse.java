package com.example.worsi_backend.dto;

import com.example.worsi_backend.repository.ProviderProfileRepository.NearbyRow;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

/**
 * Provider card for the nearby search. Same fields the customer provider cards already use, plus the
 * distance from the customer. The provider's coordinates are deliberately NOT included.
 */
@Getter
public class NearbyProviderResponse {

    private final Long id;
    private final Long userId;
    /** Saved profile picture (path relative to the API base), or null when none was uploaded. */
    private final String avatarUrl;
    private final String businessName;
    private final String tagline;
    private final String category;
    /** Average of real customer ratings, or null when the provider has none. Never a default value. */
    private final Double rating;
    private final long reviewCount;
    private final int completedJobs;
    private final int experienceYears;
    private final String responseTime;
    private final String serviceArea;
    private final String availability;
    private final boolean verified;
    private final String badge;
    private final double distanceKm;
    private final List<ProviderServiceOfferResponse> services;
    private final BigDecimal startingPrice;

    public NearbyProviderResponse(NearbyRow row, List<ProviderServiceOfferResponse> services) {
        List<ProviderServiceOfferResponse> offers = services == null ? List.of() : services;
        long reviews = row.getReviewCount() == null ? 0L : row.getReviewCount();

        this.id = row.getId();
        this.userId = row.getUserId();
        this.avatarUrl = row.getAvatarUrl();
        this.businessName = row.getBusinessName();
        this.tagline = row.getTagline();
        this.category = row.getCategory();
        // No reviews -> null (shown as "No ratings yet"), never 0.0 and never a default.
        this.rating = reviews == 0 ? null : row.getRating();
        this.reviewCount = reviews;
        this.completedJobs = row.getCompletedJobs() == null ? 0 : row.getCompletedJobs().intValue();
        this.experienceYears = row.getExperienceYears() == null ? 0 : row.getExperienceYears();
        this.responseTime = row.getResponseTime();
        this.serviceArea = row.getServiceArea();
        this.availability = row.getAvailability();
        this.verified = Boolean.TRUE.equals(row.getVerified());
        this.badge = row.getBadge();
        // One decimal place is plenty for a customer-facing distance (and avoids over-precise location data).
        this.distanceKm = Math.round((row.getDistanceKm() == null ? 0.0 : row.getDistanceKm()) * 10.0) / 10.0;
        this.services = offers;
        this.startingPrice = offers.stream()
                .map(ProviderServiceOfferResponse::getPrice)
                .min(Comparator.naturalOrder())
                .orElse(null);
    }
}
