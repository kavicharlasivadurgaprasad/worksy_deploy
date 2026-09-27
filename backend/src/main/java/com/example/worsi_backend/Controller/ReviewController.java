package com.example.worsi_backend.Controller;

import com.example.worsi_backend.dto.ReviewRequest;
import com.example.worsi_backend.dto.ReviewResponse;
import com.example.worsi_backend.Entity.Booking;
import com.example.worsi_backend.Exception.ForbiddenException;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.repository.BookingRepository;
import com.example.worsi_backend.security.SecurityUtil;
import com.example.worsi_backend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    private final ReviewService reviewService;
    private final SecurityUtil securityUtil;
    private final BookingRepository bookingRepository;

    public ReviewController(ReviewService reviewService,
                            SecurityUtil securityUtil,
                            BookingRepository bookingRepository) {
        this.reviewService = reviewService;
        this.securityUtil = securityUtil;
        this.bookingRepository = bookingRepository;
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> submit(@Valid @RequestBody ReviewRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with id: " + request.getBookingId()));

        if (!booking.getCustomer().getId().equals(securityUtil.getCurrentUserId())) {
            throw new ForbiddenException("You can only review your own bookings");
        }

        ReviewResponse response = reviewService.submitReview(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/provider/{providerId}")
    public List<ReviewResponse> getForProvider(@PathVariable Long providerId) {
        return reviewService.getReviewsForProvider(providerId);
    }
}