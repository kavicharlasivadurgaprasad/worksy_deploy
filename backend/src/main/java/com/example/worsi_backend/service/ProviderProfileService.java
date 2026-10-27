package com.example.worsi_backend.service;

import com.example.worsi_backend.dto.NearbyProviderResponse;
import com.example.worsi_backend.dto.ProviderLocationRequest;
import com.example.worsi_backend.dto.ProviderProfileRequest;
import com.example.worsi_backend.dto.ProviderProfileResponse;
import com.example.worsi_backend.dto.ProviderServiceOfferResponse;
import com.example.worsi_backend.dto.ProviderStats;
import com.example.worsi_backend.Entity.ProviderProfile;
import com.example.worsi_backend.Entity.User;
import com.example.worsi_backend.Exception.BadRequestException;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.repository.ProviderProfileRepository;
import com.example.worsi_backend.repository.ServiceCategoryRepository;
import com.example.worsi_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

import java.util.List;
import java.util.Map;

@Service
public class ProviderProfileService {

    private final ProviderProfileRepository providerProfileRepository;
    private final UserRepository userRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final ProviderStatsService providerStatsService;
    private final ProviderPricingService providerPricingService;

    private static final double EARTH_RADIUS_KM = 6371.0088;
    private static final int MAX_NEARBY_RESULTS = 100;

    /** Search radius used when the caller does not send one. */
    @Value("${app.nearby.default-radius-km:10}")
    private double defaultRadiusKm;

    /** Hard upper bound on the search radius a caller may request. */
    @Value("${app.nearby.max-radius-km:50}")
    private double maxRadiusKm;

    public ProviderProfileService(ProviderProfileRepository providerProfileRepository,
                                  UserRepository userRepository,
                                  ServiceCategoryRepository serviceCategoryRepository,
                                  ProviderStatsService providerStatsService,
                                  ProviderPricingService providerPricingService) {
        this.providerProfileRepository = providerProfileRepository;
        this.userRepository = userRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.providerStatsService = providerStatsService;
        this.providerPricingService = providerPricingService;
    }

    /** Builds the response for one provider with its real rating / completed-job stats and priced services. */
    private ProviderProfileResponse toResponse(ProviderProfile profile) {
        return new ProviderProfileResponse(profile,
                providerStatsService.statsFor(profile.getId()),
                providerPricingService.offersFor(profile.getId()));
    }

    @Transactional
    public ProviderProfileResponse createProfile(Long userId, ProviderProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (providerProfileRepository.findByUserId(userId).isPresent()) {
            throw new IllegalArgumentException("Provider profile already exists for this user");
        }

        ProviderProfile profile = new ProviderProfile();
        profile.setUser(user);
        profile.setBusinessName(request.getBusinessName());
        profile.setTagline(request.getTagline());
        profile.setDescription(request.getDescription());
        profile.setCategory(request.getCategory());
        profile.setExperienceYears(request.getExperienceYears());
        profile.setResponseTime(request.getResponseTime());
        profile.setServiceArea(request.getServiceArea());
        profile.setAvailability(request.getAvailability());

        // System-controlled defaults for a brand-new provider. rating / completed_jobs are legacy NOT NULL
        // columns that are no longer read: the real values are always computed from reviews and bookings.
        profile.setRating(0.0);
        profile.setCompletedJobs(0);
        profile.setVerified(false);

        ProviderProfile saved = providerProfileRepository.save(profile);

        // Prices entered during onboarding are saved in this same transaction: an invalid price rolls the
        // whole profile back, so the provider never ends up with a profile and silently missing prices.
        if (request.getServicePrices() != null && !request.getServicePrices().isEmpty()) {
            providerPricingService.setPrices(saved, request.getServicePrices());
        }
        return toResponse(saved);
    }

    public ProviderProfileResponse getProfile(Long userId) {
        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found for user id: " + userId));
        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public List<ProviderProfileResponse> getAllProfiles(String category) {
        List<ProviderProfile> profiles = (category == null || category.isBlank())
                ? providerProfileRepository.findAll()
                : providerProfileRepository.findByCategoryIgnoreCase(category);

        List<Long> ids = profiles.stream().map(ProviderProfile::getId).toList();
        Map<Long, ProviderStats> stats = providerStatsService.statsFor(ids);
        Map<Long, List<ProviderServiceOfferResponse>> offers = providerPricingService.offersFor(ids);
        return profiles.stream()
                .map(p -> new ProviderProfileResponse(p, stats.get(p.getId()), offers.get(p.getId())))
                .toList();
    }

    public ProviderProfileResponse getProfileById(Long providerId) {
        ProviderProfile profile = providerProfileRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + providerId));
        return toResponse(profile);
    }

    /**
     * Updates the calling provider's own location / availability. Callers must already have verified
     * that userId is the authenticated user. Accepting bookings requires a location, so the nearby
     * search never lists a provider it cannot place.
     */
    @Transactional
    public ProviderProfileResponse updateLocation(Long userId, ProviderLocationRequest request) {
        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found for user id: " + userId));

        if ((request.getLatitude() == null) != (request.getLongitude() == null)) {
            throw new BadRequestException("Latitude and longitude must be provided together");
        }
        if (request.getLatitude() != null) {
            if (!Double.isFinite(request.getLatitude()) || !Double.isFinite(request.getLongitude())) {
                throw new BadRequestException("Invalid coordinates");
            }
            profile.setLatitude(request.getLatitude());
            profile.setLongitude(request.getLongitude());
        }
        // Keeps the readable service area in step with the coordinates the provider just chose.
        if (request.getServiceArea() != null && !request.getServiceArea().isBlank()) {
            profile.setServiceArea(request.getServiceArea().trim());
        }
        if (request.getServiceRadiusKm() != null) {
            profile.setServiceRadiusKm(request.getServiceRadiusKm());
        }
        if (request.getAcceptingBookings() != null) {
            if (request.getAcceptingBookings() && !profile.hasLocation()) {
                throw new BadRequestException("Set your service location before accepting bookings");
            }
            profile.setAcceptingBookings(request.getAcceptingBookings());
        }
        return toResponse(providerProfileRepository.save(profile));
    }

    /**
     * Available providers of a category within radiusKm of the customer, nearest first.
     * dateIso/timeSlot are optional (both or neither): when given, providers already booked
     * (CONFIRMED / IN_PROGRESS) at that date and slot are left out.
     */
    @Transactional(readOnly = true)
    public List<NearbyProviderResponse> findNearby(Double latitude, Double longitude, Double radiusKm,
                                                   String category, String dateIso, String timeSlot) {
        if (latitude == null || longitude == null || !Double.isFinite(latitude) || !Double.isFinite(longitude)) {
            throw new BadRequestException("latitude and longitude are required numbers");
        }
        if (latitude < -90 || latitude > 90) {
            throw new BadRequestException("latitude must be between -90 and 90");
        }
        if (longitude < -180 || longitude > 180) {
            throw new BadRequestException("longitude must be between -180 and 180");
        }
        double radius = radiusKm == null ? defaultRadiusKm : radiusKm;
        if (!Double.isFinite(radius) || radius <= 0) {
            throw new BadRequestException("radiusKm must be greater than 0");
        }
        if (radius > maxRadiusKm) {
            throw new BadRequestException("radiusKm cannot exceed " + (long) maxRadiusKm + " km");
        }
        if (category == null || category.isBlank()) {
            throw new BadRequestException("category is required");
        }
        String cat = category.trim();
        if (!serviceCategoryRepository.existsByNameIgnoreCase(cat)) {
            throw new BadRequestException("Unknown service category: " + cat);
        }

        String date = dateIso == null ? "" : dateIso.trim();
        String slot = timeSlot == null ? "" : timeSlot.trim();
        if (date.isEmpty() != slot.isEmpty()) {
            throw new BadRequestException("date and timeSlot must be provided together");
        }
        if (!date.isEmpty()) {
            try {
                LocalDate.parse(date);
            } catch (DateTimeParseException e) {
                throw new BadRequestException("date must be in yyyy-MM-dd format");
            }
        }

        // Bounding box (degrees) that fully contains the search circle.
        double latDelta = Math.toDegrees(radius / EARTH_RADIUS_KM);
        double minLat = Math.max(-90.0, latitude - latDelta);
        double maxLat = Math.min(90.0, latitude + latDelta);
        boolean useLngBox = false;
        double minLng = -180.0;
        double maxLng = 180.0;
        double cosLat = Math.cos(Math.toRadians(latitude));
        // Near the poles, or when the box would wrap the antimeridian, skip the longitude prefilter
        // (the exact Haversine filter in SQL still guarantees correct results).
        if (cosLat > 0.01 && maxLat < 89.0 && minLat > -89.0) {
            double lngDelta = Math.toDegrees(radius / (EARTH_RADIUS_KM * cosLat));
            minLng = longitude - lngDelta;
            maxLng = longitude + lngDelta;
            useLngBox = minLng >= -180.0 && maxLng <= 180.0;
        }

        List<ProviderProfileRepository.NearbyRow> rows = providerProfileRepository
                .findNearby(latitude, longitude, radius, cat, minLat, maxLat, minLng, maxLng,
                        useLngBox, date, slot, MAX_NEARBY_RESULTS);
        Map<Long, List<ProviderServiceOfferResponse>> offers =
                providerPricingService.offersFor(rows.stream().map(ProviderProfileRepository.NearbyRow::getId).toList());
        return rows.stream()
                .map(row -> new NearbyProviderResponse(row, offers.get(row.getId())))
                .toList();
    }
}
