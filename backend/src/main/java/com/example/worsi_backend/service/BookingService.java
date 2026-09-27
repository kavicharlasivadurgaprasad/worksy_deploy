package com.example.worsi_backend.service;

import com.example.worsi_backend.dto.BookingRequest;
import com.example.worsi_backend.dto.BookingResponse;
import com.example.worsi_backend.Entity.*;
import com.example.worsi_backend.Exception.BadRequestException;
import com.example.worsi_backend.Exception.ForbiddenException;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final ServiceRepository serviceRepository;
    private final AddressRepository addressRepository;
    private final ServiceAddonRepository serviceAddonRepository;
    private final ReviewRepository reviewRepository;

    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          ProviderProfileRepository providerProfileRepository,
                          ServiceRepository serviceRepository,
                          AddressRepository addressRepository,
                          ServiceAddonRepository serviceAddonRepository,
                          ReviewRepository reviewRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.serviceRepository = serviceRepository;
        this.addressRepository = addressRepository;
        this.serviceAddonRepository = serviceAddonRepository;
        this.reviewRepository = reviewRepository;
    }

    public BookingResponse createBooking(BookingRequest request) {
        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found with id: " + request.getCustomerId()));

        ProviderProfile provider = providerProfileRepository.findById(request.getProviderId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Provider not found with id: " + request.getProviderId()));

        com.example.worsi_backend.Entity.Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service not found with id: " + request.getServiceId()));

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Address not found with id: " + request.getAddressId()));

        if (!address.getUser().getId().equals(customer.getId())) {
            throw new ForbiddenException("Address does not belong to this customer");
        }

        if (request.getDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Booking date cannot be in the past");
        }

        // Service has no provider FK in the schema, so the only integrity rule available is that a
        // provider can only be booked for services in their own category.
        if (!provider.getCategory().equalsIgnoreCase(service.getCategory().getName())) {
            throw new IllegalArgumentException("Provider '" + provider.getBusinessName()
                    + "' does not offer services in category '" + service.getCategory().getName() + "'");
        }

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setProvider(provider);
        booking.setService(service);
        booking.setAddress(address);
        booking.setDate(request.getDate());
        booking.setTimeSlot(request.getTimeSlot());
        booking.setProblemDescription(request.getProblemDescription());
        booking.setPaymentMethod(request.getPaymentMethod());
        booking.setStatus(BookingStatus.PENDING);
        booking.setOtp(generateOtp());

        BigDecimal basePrice = service.getPrice();
        BigDecimal addonsTotal = BigDecimal.ZERO;

        List<Long> addonIds = request.getAddonIds() == null ? List.of() : request.getAddonIds();
        for (Long addonId : addonIds) {
            ServiceAddon addon = serviceAddonRepository.findById(addonId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Addon not found with id: " + addonId));

            if (!addon.getService().getId().equals(service.getId())) {
                throw new IllegalArgumentException(
                        "Addon " + addonId + " does not belong to service " + service.getId());
            }

            BookingAddon bookingAddon = new BookingAddon();
            bookingAddon.setBooking(booking);
            bookingAddon.setAddon(addon);
            bookingAddon.setPriceAtBooking(addon.getPrice());
            booking.getBookingAddons().add(bookingAddon);

            addonsTotal = addonsTotal.add(addon.getPrice());
        }

        booking.setBasePrice(basePrice);
        booking.setAddonsTotal(addonsTotal);
        booking.setTotalAmount(basePrice.add(addonsTotal));

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    public List<BookingResponse> getBookingsForCustomer(Long customerId) {
        return bookingRepository.findByCustomerId(customerId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<BookingResponse> getBookingsForProvider(Long providerId) {
        return bookingRepository.findByProviderId(providerId).stream()
                .map(this::toProviderResponse)
                .toList();
    }

    public BookingResponse acceptBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Booking cannot be accepted from status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        return toProviderResponse(bookingRepository.save(booking));
    }

    public BookingResponse declineBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Booking cannot be declined from status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return toProviderResponse(bookingRepository.save(booking));
    }

    public BookingResponse startJob(Long bookingId, String otp) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException(
                    "Booking cannot be started from status: " + booking.getStatus());
        }

        if (otp == null || !booking.getOtp().equals(otp.trim())) {
            throw new BadRequestException("Invalid start OTP. Please ask the customer for the code shown in their app.");
        }

        booking.setStatus(BookingStatus.IN_PROGRESS);
        return toProviderResponse(bookingRepository.save(booking));
    }

    public BookingResponse completeBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getStatus() != BookingStatus.IN_PROGRESS) {
            throw new IllegalArgumentException(
                    "Booking cannot be completed from status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.COMPLETED);

        ProviderProfile provider = booking.getProvider();
        provider.setCompletedJobs(provider.getCompletedJobs() + 1);
        providerProfileRepository.save(provider);

        return toProviderResponse(bookingRepository.save(booking));
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 1000 + random.nextInt(9000);
        return String.valueOf(otp);
    }
    public BookingResponse cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException(
                    "Booking cannot be cancelled from status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return toResponse(bookingRepository.save(booking));
    }

    private BookingResponse toResponse(Booking booking) {
        BookingResponse response = new BookingResponse(booking);
        if (booking.getId() != null) {
            reviewRepository.findByBookingId(booking.getId()).ifPresent(r -> {
                response.setReviewed(true);
                response.setRatingGiven(r.getRating());
                response.setReviewGiven(r.getComment());
            });
        }
        return response;
    }

    /** The start OTP is a secret shared with the customer only; never expose it to the provider. */
    private BookingResponse toProviderResponse(Booking booking) {
        BookingResponse response = toResponse(booking);
        response.setOtp(null);
        return response;
    }
}
