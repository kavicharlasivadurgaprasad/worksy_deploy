package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.BookingImage;
import lombok.Getter;

@Getter
public class BookingImageResponse {

    private final Long id;
    private final String fileName;
    private final String contentType;
    private final Long sizeBytes;
    /**
     * API-relative path (under /api/v1) of the protected download endpoint. The image is private,
     * so it must be fetched with the caller's JWT, not embedded as a public URL.
     */
    private final String url;

    public BookingImageResponse(BookingImage image) {
        this.id = image.getId();
        this.fileName = image.getOriginalFilename();
        this.contentType = image.getContentType();
        this.sizeBytes = image.getSizeBytes();
        this.url = "/bookings/" + image.getBooking().getId() + "/images/" + image.getId();
    }
}
