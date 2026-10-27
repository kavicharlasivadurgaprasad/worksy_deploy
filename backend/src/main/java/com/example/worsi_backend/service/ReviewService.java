package com.example.worsi_backend.service;

import com.example.worsi_backend.dto.ReviewRequest;
import com.example.worsi_backend.dto.ReviewResponse;
import com.example.worsi_backend.Entity.Booking;
import com.example.worsi_backend.Entity.BookingStatus;
import com.example.worsi_backend.Entity.Review;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.repository.BookingRepository;
import com.example.worsi_backend.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         BookingRepository bookingRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
    }

    public ReviewResponse submitReview(ReviewRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with id: " + request.getBookingId()));

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalArgumentException(
                    "Cannot review a booking that is not completed. Current status: " + booking.getStatus());
        }

        if (reviewRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new IllegalArgumentException("This booking has already been reviewed");
        }

        Review review = new Review();
        review.setBooking(booking);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setCreatedAt(LocalDateTime.now());

        // The provider's rating and review count are computed from the reviews table when read
        // (ProviderStatsService), so there is no stored average to update here.
        Review saved = reviewRepository.save(review);

        return new ReviewResponse(saved);
    }

    public List<ReviewResponse> getReviewsForProvider(Long providerId) {
        return reviewRepository.findByBooking_ProviderId(providerId).stream()
                .map(ReviewResponse::new)
                .toList();
    }
}