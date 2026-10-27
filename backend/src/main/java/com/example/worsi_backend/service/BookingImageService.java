package com.example.worsi_backend.service;

import com.example.worsi_backend.Entity.Booking;
import com.example.worsi_backend.Entity.BookingImage;
import com.example.worsi_backend.Exception.ForbiddenException;
import com.example.worsi_backend.Exception.ImageStorageException;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.repository.BookingImageRepository;
import com.example.worsi_backend.repository.BookingRepository;
import com.example.worsi_backend.storage.ImageStorage;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileNotFoundException;
import java.io.IOException;

/** Serves private booking photos, but only to the booking's customer or its assigned provider. */
@Service
@Transactional(readOnly = true)
public class BookingImageService {

    /** The image bytes plus what the controller needs to send them. */
    public record LoadedImage(Resource resource, String contentType, String fileName) {}

    private final BookingRepository bookingRepository;
    private final BookingImageRepository bookingImageRepository;
    private final ImageStorage imageStorage;

    public BookingImageService(BookingRepository bookingRepository,
                               BookingImageRepository bookingImageRepository,
                               ImageStorage imageStorage) {
        this.bookingRepository = bookingRepository;
        this.bookingImageRepository = bookingImageRepository;
        this.imageStorage = imageStorage;
    }

    public LoadedImage load(Long bookingId, Long imageId, Long currentUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        boolean isCustomer = booking.getCustomer().getId().equals(currentUserId);
        boolean isAssignedProvider = booking.getProvider().getUser().getId().equals(currentUserId);
        if (!isCustomer && !isAssignedProvider) {
            throw new ForbiddenException("You can only view images of your own bookings");
        }

        // Looked up by (imageId, bookingId) so an image id from another booking can never be reached.
        BookingImage image = bookingImageRepository.findByIdAndBookingId(imageId, bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found"));

        try {
            return new LoadedImage(imageStorage.load(image.getStorageKey()),
                    image.getContentType(), image.getOriginalFilename());
        } catch (FileNotFoundException e) {
            throw new ResourceNotFoundException("Image file is no longer available");
        } catch (IOException e) {
            throw new ImageStorageException("Could not read the image. Please try again.", e);
        }
    }
}
