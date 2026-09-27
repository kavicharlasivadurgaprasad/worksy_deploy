package com.example.worsi_backend.service;

import com.example.worsi_backend.dto.ReviewRequest;
import com.example.worsi_backend.dto.ReviewResponse;
import com.example.worsi_backend.Entity.Booking;
import com.example.worsi_backend.Entity.BookingStatus;
import com.example.worsi_backend.Entity.ProviderProfile;
import com.example.worsi_backend.Entity.Review;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.repository.BookingRepository;
import com.example.worsi_backend.repository.ProviderProfileRepository;
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
    private final ProviderProfileRepository providerProfileRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         BookingRepository bookingRepository,
                         ProviderProfileRepository providerProfileRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.providerProfileRepository = providerProfileRepository;
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

        Review saved = reviewRepository.save(review);

        recalculateProviderRating(booking.getProvider().getId());

        return new ReviewResponse(saved);
    }

    public List<ReviewResponse> getReviewsForProvider(Long providerId) {
        return reviewRepository.findByBooking_ProviderId(providerId).stream()
                .map(ReviewResponse::new)
                .toList();
    }

    private void recalculateProviderRating(Long providerId) {
        List<Review> providerReviews = reviewRepository.findByBooking_ProviderId(providerId);

        double averageRating = providerReviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        ProviderProfile provider = providerProfileRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + providerId));

        provider.setRating(averageRating);
        providerProfileRepository.save(provider);
    }
}