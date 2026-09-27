package com.example.worsi_backend.Controller;

import com.example.worsi_backend.dto.BookingRequest;
import com.example.worsi_backend.dto.StartJobRequest;
import com.example.worsi_backend.dto.BookingResponse;
import com.example.worsi_backend.Entity.Booking;
import com.example.worsi_backend.Entity.ProviderProfile;
import com.example.worsi_backend.Exception.ForbiddenException;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.repository.BookingRepository;
import com.example.worsi_backend.repository.ProviderProfileRepository;
import com.example.worsi_backend.security.SecurityUtil;
import com.example.worsi_backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingService bookingService;
    private final SecurityUtil securityUtil;
    private final ProviderProfileRepository providerProfileRepository;
    private final BookingRepository bookingRepository;

    public BookingController(BookingService bookingService,
                             SecurityUtil securityUtil,
                             ProviderProfileRepository providerProfileRepository,
                             BookingRepository bookingRepository) {
        this.bookingService = bookingService;
        this.securityUtil = securityUtil;
        this.providerProfileRepository = providerProfileRepository;
        this.bookingRepository = bookingRepository;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingRequest request) {
        if (!request.getCustomerId().equals(securityUtil.getCurrentUserId())) {
            throw new ForbiddenException("You can only create bookings for yourself");
        }
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/customer/{customerId}")
    public List<BookingResponse> getForCustomer(@PathVariable Long customerId) {
        if (!customerId.equals(securityUtil.getCurrentUserId())) {
            throw new ForbiddenException("You can only view your own bookings");
        }
        return bookingService.getBookingsForCustomer(customerId);
    }

    @GetMapping("/provider/{providerId}")
    public List<BookingResponse> getForProvider(@PathVariable Long providerId) {
        requireOwnedProvider(providerId);
        return bookingService.getBookingsForProvider(providerId);
    }

    @PatchMapping("/{id}/accept")
    public BookingResponse accept(@PathVariable Long id) {
        requireOwnedBooking(id);
        return bookingService.acceptBooking(id);
    }

    @PatchMapping("/{id}/decline")
    public BookingResponse decline(@PathVariable Long id) {
        requireOwnedBooking(id);
        return bookingService.declineBooking(id);
    }

    @PatchMapping("/{id}/start")
    public BookingResponse start(@PathVariable Long id, @Valid @RequestBody StartJobRequest request) {
        requireOwnedBooking(id);
        return bookingService.startJob(id, request.getOtp());
    }

    @PatchMapping("/{id}/complete")
    public BookingResponse complete(@PathVariable Long id) {
        requireOwnedBooking(id);
        return bookingService.completeBooking(id);
    }

    private void requireOwnedProvider(Long providerId) {
        ProviderProfile provider = providerProfileRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + providerId));

        if (!provider.getUser().getId().equals(securityUtil.getCurrentUserId())) {
            throw new ForbiddenException("You can only access your own provider bookings");
        }
    }

    private void requireOwnedBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        Long providerUserId = booking.getProvider().getUser().getId();

        if (!providerUserId.equals(securityUtil.getCurrentUserId())) {
            throw new ForbiddenException("Only the assigned provider can perform this action");
        }
    }
    @PatchMapping("/{id}/cancel")
    public BookingResponse cancel(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (!booking.getCustomer().getId().equals(securityUtil.getCurrentUserId())) {
            throw new ForbiddenException("You can only cancel your own bookings");
        }

        return bookingService.cancelBooking(id);
    }
}