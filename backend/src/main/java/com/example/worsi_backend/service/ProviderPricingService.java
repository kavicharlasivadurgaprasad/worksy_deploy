package com.example.worsi_backend.service;

import com.example.worsi_backend.Entity.ProviderProfile;
import com.example.worsi_backend.Entity.ProviderServicePrice;
import com.example.worsi_backend.Entity.ServiceCategory;
import com.example.worsi_backend.Exception.BadRequestException;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.dto.ProviderServiceOfferResponse;
import com.example.worsi_backend.dto.ProviderServicePriceEntry;
import com.example.worsi_backend.dto.ProviderServicePriceResponse;
import com.example.worsi_backend.repository.ProviderProfileRepository;
import com.example.worsi_backend.repository.ProviderServicePriceRepository;
import com.example.worsi_backend.repository.ServiceCategoryRepository;
import com.example.worsi_backend.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Provider-specific service prices. A provider can price only the services of their own category
 * (the same rule the booking flow enforces) and only their own prices: callers pass the authenticated
 * user's id, never an id taken from the request body.
 */
@Service
@Transactional
public class ProviderPricingService {

    private final ProviderProfileRepository providerProfileRepository;
    private final ProviderServicePriceRepository priceRepository;
    private final ServiceRepository serviceRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;

    /** Upper bound that guards against typos such as an extra zero. Override with MAX_SERVICE_PRICE. */
    @Value("${app.pricing.max-price:100000}")
    private BigDecimal maxPrice;

    public ProviderPricingService(ProviderProfileRepository providerProfileRepository,
                                  ProviderServicePriceRepository priceRepository,
                                  ServiceRepository serviceRepository,
                                  ServiceCategoryRepository serviceCategoryRepository) {
        this.providerProfileRepository = providerProfileRepository;
        this.priceRepository = priceRepository;
        this.serviceRepository = serviceRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
    }

    /** Every service in the provider's category with the provider's price (null when not set yet). */
    @Transactional(readOnly = true)
    public List<ProviderServicePriceResponse> listForOwner(Long userId) {
        ProviderProfile provider = requireProvider(userId);
        Map<Long, ProviderServicePrice> priced = priceRepository.findAllForProvider(provider.getId()).stream()
                .collect(Collectors.toMap(p -> p.getService().getId(), Function.identity()));

        return servicesInCategory(provider).stream()
                .map(s -> new ProviderServicePriceResponse(s, priced.get(s.getId())))
                .toList();
    }

    /** Creates or updates the calling provider's price for one service. Returns the refreshed row. */
    public ProviderServicePriceResponse setPrice(Long userId, Long serviceId, BigDecimal requestedPrice) {
        ProviderProfile provider = requireProvider(userId);
        com.example.worsi_backend.Entity.Service service = requireServiceOfProvidersCategory(provider, serviceId);
        BigDecimal price = validatePrice(requestedPrice);

        return upsert(provider, service, price);
    }

    private ProviderServicePriceResponse upsert(ProviderProfile provider,
                                                com.example.worsi_backend.Entity.Service service, BigDecimal price) {
        Instant now = Instant.now();
        ProviderServicePrice row = priceRepository.findByProviderIdAndServiceId(provider.getId(), service.getId())
                .orElseGet(() -> {
                    ProviderServicePrice created = new ProviderServicePrice();
                    created.setProvider(provider);
                    created.setService(service);
                    created.setCreatedAt(now);
                    return created;
                });
        row.setPrice(price);
        row.setUpdatedAt(now);
        return new ProviderServicePriceResponse(service, priceRepository.save(row));
    }

    /**
     * Saves several prices for the calling provider in ONE transaction: if any entry is invalid nothing is
     * saved. Only the listed services are touched; prices of other services are left exactly as they are.
     */
    public List<ProviderServicePriceResponse> setPrices(Long userId, List<ProviderServicePriceEntry> entries) {
        return setPrices(requireProvider(userId), entries);
    }

    /** Same as above for a provider that was just created in the current transaction. */
    public List<ProviderServicePriceResponse> setPrices(ProviderProfile provider, List<ProviderServicePriceEntry> entries) {
        if (entries == null || entries.isEmpty()) {
            return List.of();
        }
        // Pass 1: validate every entry, so one bad price means nothing at all is written.
        Set<Long> seen = new HashSet<>();
        List<com.example.worsi_backend.Entity.Service> services = new ArrayList<>();
        List<BigDecimal> prices = new ArrayList<>();
        for (ProviderServicePriceEntry entry : entries) {
            if (entry == null || entry.getServiceId() == null) {
                throw new BadRequestException("Service is required for every price");
            }
            if (!seen.add(entry.getServiceId())) {
                throw new BadRequestException("The same service was sent more than once");
            }
            services.add(requireServiceOfProvidersCategory(provider, entry.getServiceId()));
            prices.add(validatePrice(entry.getPrice()));
        }
        // Pass 2: write (still inside one transaction).
        List<ProviderServicePriceResponse> saved = new ArrayList<>();
        for (int i = 0; i < services.size(); i++) {
            saved.add(upsert(provider, services.get(i), prices.get(i)));
        }
        return saved;
    }

    /** Removes the calling provider's price for one service (it goes back to "Price not set"). */
    public ProviderServicePriceResponse clearPrice(Long userId, Long serviceId) {
        ProviderProfile provider = requireProvider(userId);
        com.example.worsi_backend.Entity.Service service = requireServiceOfProvidersCategory(provider, serviceId);
        priceRepository.findByProviderIdAndServiceId(provider.getId(), serviceId).ifPresent(priceRepository::delete);
        return new ProviderServicePriceResponse(service, null);
    }

    /** Public: the services one provider has priced, i.e. what customers can book and what it costs. */
    @Transactional(readOnly = true)
    public List<ProviderServiceOfferResponse> offersFor(Long providerId) {
        if (!providerProfileRepository.existsById(providerId)) {
            throw new ResourceNotFoundException("Provider not found with id: " + providerId);
        }
        return priceRepository.findAllForProvider(providerId).stream()
                .map(ProviderServiceOfferResponse::new)
                .toList();
    }

    /** Public: priced services of many providers with one query. Providers with none map to an empty list. */
    @Transactional(readOnly = true)
    public Map<Long, List<ProviderServiceOfferResponse>> offersFor(Collection<Long> providerIds) {
        Map<Long, List<ProviderServiceOfferResponse>> result = new HashMap<>();
        if (providerIds == null || providerIds.isEmpty()) {
            return result;
        }
        providerIds.forEach(id -> result.put(id, new ArrayList<>()));
        priceRepository.findAllForProviders(providerIds)
                .forEach(row -> result.get(row.getProvider().getId()).add(new ProviderServiceOfferResponse(row)));
        return result;
    }

    // ------------------------------------------------------------------

    /**
     * Price rules, enforced here regardless of what the frontend checked: present, greater than zero,
     * at most two decimal places and not above the configured maximum.
     */
    BigDecimal validatePrice(BigDecimal price) {
        if (price == null) {
            throw new BadRequestException("Price is required");
        }
        if (price.signum() <= 0) {
            throw new BadRequestException("Price must be greater than 0");
        }
        if (price.stripTrailingZeros().scale() > 2) {
            throw new BadRequestException("Price can have at most 2 decimal places");
        }
        if (price.compareTo(maxPrice) > 0) {
            throw new BadRequestException("Price cannot be more than " + maxPrice.stripTrailingZeros().toPlainString());
        }
        return price.setScale(2, java.math.RoundingMode.UNNECESSARY);
    }

    private ProviderProfile requireProvider(Long userId) {
        return providerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Provider profile not found for user id: " + userId));
    }

    private List<com.example.worsi_backend.Entity.Service> servicesInCategory(ProviderProfile provider) {
        return serviceCategoryRepository.findByNameIgnoreCase(provider.getCategory())
                .map(ServiceCategory::getId)
                .map(serviceRepository::findByCategoryId)
                .orElse(List.of());
    }

    private com.example.worsi_backend.Entity.Service requireServiceOfProvidersCategory(ProviderProfile provider, Long serviceId) {
        com.example.worsi_backend.Entity.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));
        if (!provider.getCategory().equalsIgnoreCase(service.getCategory().getName())) {
            throw new BadRequestException("You can only set prices for services in your own category ("
                    + provider.getCategory() + ")");
        }
        return service;
    }
}
