package com.example.worsi_backend.Controller;

import com.example.worsi_backend.dto.BookingRequest;
import com.example.worsi_backend.dto.StartJobRequest;
import com.example.worsi_backend.dto.BookingResponse;
import com.example.worsi_backend.dto.ProviderSummaryResponse;
import com.example.worsi_backend.Entity.Booking;
import com.example.worsi_backend.Entity.ProviderProfile;
import com.example.worsi_backend.Exception.ForbiddenException;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.repository.BookingRepository;
import com.example.worsi_backend.repository.ProviderProfileRepository;
import com.example.worsi_backend.security.SecurityUtil;
import com.example.worsi_backend.service.BookingImageService;
import com.example.worsi_backend.service.BookingService;
import com.example.worsi_backend.service.ProviderStatsService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingService bookingService;
    private final SecurityUtil securityUtil;
    private final ProviderProfileRepository providerProfileRepository;
    private final BookingRepository bookingRepository;
    private final BookingImageService bookingImageService;
    private final ProviderStatsService providerStatsService;

    public BookingController(BookingService bookingService,
                             SecurityUtil securityUtil,
                             ProviderProfileRepository providerProfileRepository,
                             BookingRepository bookingRepository,
                             BookingImageService bookingImageService,
                             ProviderStatsService providerStatsService) {
        this.bookingService = bookingService;
        this.securityUtil = securityUtil;
        this.providerProfileRepository = providerProfileRepository;
        this.bookingRepository = bookingRepository;
        this.bookingImageService = bookingImageService;
        this.providerStatsService = providerStatsService;
    }

    /** Original JSON contract (no photos). Unchanged, so existing clients keep working. */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingRequest request) {
        if (!request.getCustomerId().equals(securityUtil.getCurrentUserId())) {
            throw new ForbiddenException("You can only create bookings for yourself");
        }
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Same booking, with optional photos. multipart/form-data parts:
     *   booking : application/json  - the same body as the JSON endpoint
     *   images  : 0..5 files (JPEG/PNG/WEBP, max 5 MB each), repeat the part name for each file
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookingResponse> createWithImages(
            @Valid @RequestPart("booking") BookingRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        if (!request.getCustomerId().equals(securityUtil.getCurrentUserId())) {
            throw new ForbiddenException("You can only create bookings for yourself");
        }
        BookingResponse response = bookingService.createBooking(request, images);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Private photo download: only the booking's customer or its assigned provider (JWT required). */
    @GetMapping("/{bookingId}/images/{imageId}")
    public ResponseEntity<Resource> getImage(@PathVariable Long bookingId, @PathVariable Long imageId) {
        BookingImageService.LoadedImage image =
                bookingImageService.load(bookingId, imageId, securityUtil.getCurrentUserId());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename("booking-" + bookingId + "-image-" + imageId).build().toString())
                .header("X-Content-Type-Options", "nosniff")
                .cacheControl(CacheControl.noStore())
                .body(image.resource());
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

    /**
     * Private dashboard numbers for the authenticated provider only: completed jobs, rating, review
     * count and earnings from completed bookings. Another provider's id is rejected with 403.
     */
    @GetMapping("/provider/{providerId}/summary")
    public ProviderSummaryResponse getProviderSummary(@PathVariable Long providerId) {
        requireOwnedProvider(providerId);
        return providerStatsService.summaryFor(providerId);
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