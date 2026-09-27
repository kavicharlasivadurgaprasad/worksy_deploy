package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.Review;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ReviewResponse {

    private final Long id;
    private final Long bookingId;
    private final String customerName;
    private final int rating;
    private final String comment;
    private final LocalDateTime createdAt;

    public ReviewResponse(Review review) {
        this.id = review.getId();
        this.bookingId = review.getBooking().getId();
        this.customerName = review.getBooking().getCustomer().getName();
        this.rating = review.getRating();
        this.comment = review.getComment();
        this.createdAt = review.getCreatedAt();
    }
}