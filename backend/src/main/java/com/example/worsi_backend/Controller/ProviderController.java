package com.example.worsi_backend.Controller;

import com.example.worsi_backend.dto.NearbyProviderResponse;
import com.example.worsi_backend.dto.ProviderProfileResponse;
import com.example.worsi_backend.dto.ProviderServiceOfferResponse;
import com.example.worsi_backend.service.ProviderPricingService;
import com.example.worsi_backend.service.ProviderProfileService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Public provider directory used by the customer Explore / Provider-profile screens. */
@RestController
@RequestMapping("/api/v1/providers")
public class ProviderController {

    private final ProviderProfileService providerProfileService;
    private final ProviderPricingService providerPricingService;

    public ProviderController(ProviderProfileService providerProfileService,
                              ProviderPricingService providerPricingService) {
        this.providerProfileService = providerProfileService;
        this.providerPricingService = providerPricingService;
    }

    @GetMapping
    public List<ProviderProfileResponse> getAll(@RequestParam(required = false) String category) {
        return providerProfileService.getAllProfiles(category);
    }

    /**
     * Available providers near the customer for one service category, nearest first.
     * Requires a JWT (see SecurityConfig). The customer's coordinates are used for this request only
     * and are not stored or logged.
     */
    @GetMapping("/nearby")
    public List<NearbyProviderResponse> getNearby(@RequestParam(required = false) Double latitude,
                                                  @RequestParam(required = false) Double longitude,
                                                  @RequestParam(required = false) Double radiusKm,
                                                  @RequestParam(required = false) String category,
                                                  @RequestParam(required = false) String date,
                                                  @RequestParam(required = false) String timeSlot) {
        return providerProfileService.findNearby(latitude, longitude, radiusKm, category, date, timeSlot);
    }

    @GetMapping("/{id}")
    public ProviderProfileResponse getById(@PathVariable Long id) {
        return providerProfileService.getProfileById(id);
    }

    /** Public: the services this provider has priced, with the provider's own prices. Unpriced services are not listed. */
    @GetMapping("/{id}/services")
    public List<ProviderServiceOfferResponse> getServices(@PathVariable Long id) {
        return providerPricingService.offersFor(id);
    }
}
