package com.example.worsi_backend.repository;

import com.example.worsi_backend.Entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByBookingId(Long bookingId);

    List<Review> findByBooking_ProviderId(Long providerId);

    /** Real rating statistics of one provider, computed from the reviews table. */
    interface RatingRow {
        Long getProviderId();
        Double getAverageRating();
        Long getReviewCount();
    }

    /** Average rating and number of reviews per provider. A provider with no reviews has no row. */
    @Query("select r.booking.provider.id as providerId, avg(r.rating) as averageRating, count(r) as reviewCount "
            + "from Review r where r.booking.provider.id in :providerIds group by r.booking.provider.id")
    List<RatingRow> ratingRows(@Param("providerIds") Collection<Long> providerIds);
}