package com.example.worsi_backend.Controller;

import com.example.worsi_backend.Exception.ForbiddenException;
import com.example.worsi_backend.dto.ProviderServicePriceRequest;
import com.example.worsi_backend.dto.ProviderServicePricesRequest;
import com.example.worsi_backend.dto.ProviderServicePriceResponse;
import com.example.worsi_backend.security.SecurityUtil;
import com.example.worsi_backend.service.ProviderPricingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * "Manage Services and Prices" for the signed-in provider. Every endpoint requires a JWT (see
 * SecurityConfig: anything not explicitly public is authenticated), the PROVIDER role, and that the
 * userId in the path is the authenticated user. A provider can therefore only ever read or change
 * their own prices; the provider is always resolved from that user, never from the request body.
 */
@RestController
@RequestMapping("/api/v1/users/{userId}/provider-profile/services")
public class ProviderPricingController {

    private final ProviderPricingService providerPricingService;
    private final SecurityUtil securityUtil;

    public ProviderPricingController(ProviderPricingService providerPricingService, SecurityUtil securityUtil) {
        this.providerPricingService = providerPricingService;
        this.securityUtil = securityUtil;
    }

    /** Services of the provider's category with the provider's price for each (null = not set). */
    @GetMapping
    public List<ProviderServicePriceResponse> list(@PathVariable Long userId) {
        requireOwnerProvider(userId, "You can only view your own service prices");
        return providerPricingService.listForOwner(userId);
    }

    /** Sets or updates the price for one service. */
    @PutMapping("/{serviceId}/price")
    public ProviderServicePriceResponse setPrice(@PathVariable Long userId,
                                                 @PathVariable Long serviceId,
                                                 @Valid @RequestBody ProviderServicePriceRequest request) {
        requireOwnerProvider(userId, "You can only change your own service prices");
        return providerPricingService.setPrice(userId, serviceId, request.getPrice());
    }

    /** Sets or updates several prices at once (all or nothing). Services not listed are left unchanged. */
    @PutMapping("/prices")
    public List<ProviderServicePriceResponse> setPrices(@PathVariable Long userId,
                                                        @Valid @RequestBody ProviderServicePricesRequest request) {
        requireOwnerProvider(userId, "You can only change your own service prices");
        return providerPricingService.setPrices(userId, request.getPrices());
    }

    /** Removes the price for one service (it returns to "Price not set"). Existing bookings are unaffected. */
    @DeleteMapping("/{serviceId}/price")
    public ProviderServicePriceResponse clearPrice(@PathVariable Long userId, @PathVariable Long serviceId) {
        requireOwnerProvider(userId, "You can only change your own service prices");
        return providerPricingService.clearPrice(userId, serviceId);
    }

    private void requireOwnerProvider(Long userId, String message) {
        if (!"PROVIDER".equals(securityUtil.getCurrentUserRole()) || !userId.equals(securityUtil.getCurrentUserId())) {
            throw new ForbiddenException(message);
        }
    }
}
