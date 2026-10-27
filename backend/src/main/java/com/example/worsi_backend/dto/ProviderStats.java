package com.example.worsi_backend.dto;

/**
 * Statistics of one provider derived from real records at request time.
 *
 * @param averageRating mean of the customer-submitted ratings, or null when the provider has no ratings
 * @param reviewCount   number of review rows for the provider's bookings (0 when none)
 * @param completedJobs number of the provider's bookings whose status is COMPLETED (each booking counted once)
 */
public record ProviderStats(Double averageRating, long reviewCount, long completedJobs) {

    /** A provider with no reviews and no completed jobs: no rating, zero counts. */
    public static final ProviderStats NONE = new ProviderStats(null, 0L, 0L);
}
