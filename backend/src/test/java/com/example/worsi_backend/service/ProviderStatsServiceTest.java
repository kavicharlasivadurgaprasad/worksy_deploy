package com.example.worsi_backend.service;

import com.example.worsi_backend.Entity.BookingStatus;
import com.example.worsi_backend.dto.ProviderStats;
import com.example.worsi_backend.dto.ProviderSummaryResponse;
import com.example.worsi_backend.repository.BookingRepository;
import com.example.worsi_backend.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProviderStatsServiceTest {

    @Mock ReviewRepository reviewRepository;
    @Mock BookingRepository bookingRepository;

    private ProviderStatsService service;

    @BeforeEach
    void setUp() {
        service = new ProviderStatsService(reviewRepository, bookingRepository);
        ReflectionTestUtils.setField(service, "commissionRate", new BigDecimal("0.10"));
        when(reviewRepository.ratingRows(anyCollection())).thenReturn(List.of());
        when(bookingRepository.countByProviderAndStatus(anyCollection(), eq(BookingStatus.COMPLETED))).thenReturn(List.of());
    }

    @Test
    void providerWithNoReviewsAndNoCompletedJobs_hasNoRatingAndZeroCounts() {
        ProviderStats stats = service.statsFor(5L);

        assertNull(stats.averageRating());       // not 4.0, not 0.0: there is no rating
        assertEquals(0L, stats.reviewCount());
        assertEquals(0L, stats.completedJobs());
    }

    @Test
    void ratingAndCompletedJobsComeFromTheRealRows() {
        ReviewRepository.RatingRow rating = mock(ReviewRepository.RatingRow.class);
        when(rating.getProviderId()).thenReturn(5L);
        when(rating.getAverageRating()).thenReturn(4.5);
        when(rating.getReviewCount()).thenReturn(2L);
        when(reviewRepository.ratingRows(anyCollection())).thenReturn(List.of(rating));

        BookingRepository.StatusCountRow completed = mock(BookingRepository.StatusCountRow.class);
        when(completed.getProviderId()).thenReturn(5L);
        when(completed.getBookingCount()).thenReturn(3L);
        when(bookingRepository.countByProviderAndStatus(anyCollection(), eq(BookingStatus.COMPLETED)))
                .thenReturn(List.of(completed));

        Map<Long, ProviderStats> stats = service.statsFor(List.of(5L, 6L));

        assertEquals(4.5, stats.get(5L).averageRating());
        assertEquals(2L, stats.get(5L).reviewCount());
        assertEquals(3L, stats.get(5L).completedJobs());
        // the other provider has no rows at all
        assertNull(stats.get(6L).averageRating());
        assertEquals(0L, stats.get(6L).completedJobs());
    }

    @Test
    void summary_isZeroWhenNothingIsCompleted() {
        when(bookingRepository.sumTotalAmountByProviderAndStatus(5L, BookingStatus.COMPLETED)).thenReturn(null);

        ProviderSummaryResponse summary = service.summaryFor(5L);

        assertEquals(0L, summary.getCompletedJobs());
        assertEquals(new BigDecimal("0.00"), summary.getGrossEarnings());
        assertEquals(new BigDecimal("0.00"), summary.getNetEarnings());
        assertNull(summary.getAverageRating());
    }

    @Test
    void summary_appliesTheCommissionToCompletedBookingsOnly() {
        when(bookingRepository.sumTotalAmountByProviderAndStatus(5L, BookingStatus.COMPLETED))
                .thenReturn(new BigDecimal("1000"));

        ProviderSummaryResponse summary = service.summaryFor(5L);

        assertEquals(new BigDecimal("1000.00"), summary.getGrossEarnings());
        assertEquals(new BigDecimal("100.00"), summary.getPlatformFee());
        assertEquals(new BigDecimal("900.00"), summary.getNetEarnings());
    }
}
