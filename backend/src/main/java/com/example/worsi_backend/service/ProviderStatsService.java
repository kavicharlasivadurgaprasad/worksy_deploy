package com.example.worsi_backend.service;

import com.example.worsi_backend.Entity.BookingStatus;
import com.example.worsi_backend.dto.ProviderStats;
import com.example.worsi_backend.dto.ProviderSummaryResponse;
import com.example.worsi_backend.repository.BookingRepository;
import com.example.worsi_backend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Single source of truth for a provider's rating, review count, completed-job count and earnings.
 * Everything is computed from the reviews and bookings tables when asked. Nothing is stored in a
 * counter column, so there is no default (such as 4.0) and no number that can drift.
 */
@Service
@Transactional(readOnly = true)
public class ProviderStatsService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    /** Platform commission as a fraction (0.10 = 10%). This is the rate the app already displayed. */
    @Value("${app.commission.rate:0.10}")
    private BigDecimal commissionRate;

    public ProviderStatsService(ReviewRepository reviewRepository, BookingRepository bookingRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
    }

    public ProviderStats statsFor(Long providerId) {
        return statsFor(List.of(providerId)).getOrDefault(providerId, ProviderStats.NONE);
    }

    /** Stats for many providers with two grouped queries. Every requested id is present in the result. */
    public Map<Long, ProviderStats> statsFor(Collection<Long> providerIds) {
        Map<Long, ProviderStats> result = new HashMap<>();
        if (providerIds == null || providerIds.isEmpty()) {
            return result;
        }

        Map<Long, RatingAgg> ratings = new HashMap<>();
        reviewRepository.ratingRows(providerIds).forEach(r ->
                ratings.put(r.getProviderId(), new RatingAgg(r.getAverageRating(), r.getReviewCount())));

        Map<Long, Long> completed = new HashMap<>();
        bookingRepository.countByProviderAndStatus(providerIds, BookingStatus.COMPLETED)
                .forEach(r -> completed.put(r.getProviderId(), r.getBookingCount()));

        for (Long id : providerIds) {
            RatingAgg rating = ratings.get(id);
            long reviewCount = rating == null || rating.count() == null ? 0L : rating.count();
            // No review rows -> no rating at all (null), never 0 or a default.
            Double average = reviewCount == 0 || rating.average() == null ? null : rating.average();
            result.put(id, new ProviderStats(average, reviewCount, completed.getOrDefault(id, 0L)));
        }
        return result;
    }

    /** Private dashboard summary of one provider. Callers must already have verified ownership. */
    public ProviderSummaryResponse summaryFor(Long providerId) {
        ProviderStats stats = statsFor(providerId);
        BigDecimal gross = bookingRepository.sumTotalAmountByProviderAndStatus(providerId, BookingStatus.COMPLETED);
        if (gross == null) {
            gross = BigDecimal.ZERO;
        }
        gross = gross.setScale(2, RoundingMode.HALF_UP);
        BigDecimal fee = gross.multiply(commissionRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal net = gross.subtract(fee);
        return new ProviderSummaryResponse(stats, gross, commissionRate, fee, net);
    }

    private record RatingAgg(Double average, Long count) {}
}
