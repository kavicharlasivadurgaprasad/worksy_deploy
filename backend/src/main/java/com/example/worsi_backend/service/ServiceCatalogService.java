package com.example.worsi_backend.service;

import com.example.worsi_backend.dto.ServiceAddonRequest;
import com.example.worsi_backend.dto.ServiceRequest;
import com.example.worsi_backend.dto.ServiceResponse;
import com.example.worsi_backend.Entity.ServiceAddon;
import com.example.worsi_backend.Entity.ServiceCategory;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.repository.ProviderServicePriceRepository;
import com.example.worsi_backend.repository.ServiceCategoryRepository;
import com.example.worsi_backend.repository.ServiceRepository;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class ServiceCatalogService {

    private final ServiceRepository serviceRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final ProviderServicePriceRepository providerServicePriceRepository;

    public ServiceCatalogService(ServiceRepository serviceRepository,
                                 ServiceCategoryRepository serviceCategoryRepository,
                                 ProviderServicePriceRepository providerServicePriceRepository) {
        this.serviceRepository = serviceRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.providerServicePriceRepository = providerServicePriceRepository;
    }

    public ServiceResponse createService(ServiceRequest request) {
        ServiceCategory category = serviceCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        com.example.worsi_backend.Entity.Service service = new com.example.worsi_backend.Entity.Service();
        service.setCategory(category);
        service.setTitle(request.getTitle());
        service.setDuration(request.getDuration());
        service.setDescription(request.getDescription());
        service.setImageUrl(request.getImageUrl());
        service.setCancellationPolicy(request.getCancellationPolicy());

        for (ServiceAddonRequest addonRequest : request.getAddons()) {
            ServiceAddon addon = new ServiceAddon();
            addon.setName(addonRequest.getName());
            addon.setPrice(addonRequest.getPrice());
            addon.setDescription(addonRequest.getDescription());
            addon.setService(service);
            service.getAddons().add(addon);
        }

        com.example.worsi_backend.Entity.Service saved = serviceRepository.save(service);
        return new ServiceResponse(saved);
    }

    public List<ServiceResponse> getAllServices() {
        Map<Long, ProviderServicePriceRepository.ServicePriceSummaryRow> prices = priceSummaries();
        return serviceRepository.findAll().stream()
                .map(s -> toResponse(s, prices))
                .toList();
    }

    public List<ServiceResponse> getServicesByCategory(Long categoryId) {
        Map<Long, ProviderServicePriceRepository.ServicePriceSummaryRow> prices = priceSummaries();
        return serviceRepository.findByCategoryId(categoryId).stream()
                .map(s -> toResponse(s, prices))
                .toList();
    }

    public ServiceResponse getServiceById(Long id) {
        com.example.worsi_backend.Entity.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        return toResponse(service, priceSummaries());
    }

    /** The lowest provider price and provider count per service, from provider_service_prices (never a catalogue default). */
    private Map<Long, ProviderServicePriceRepository.ServicePriceSummaryRow> priceSummaries() {
        return providerServicePriceRepository.summarizeByService().stream()
                .collect(Collectors.toMap(ProviderServicePriceRepository.ServicePriceSummaryRow::getServiceId, Function.identity()));
    }

    private ServiceResponse toResponse(com.example.worsi_backend.Entity.Service service,
                                       Map<Long, ProviderServicePriceRepository.ServicePriceSummaryRow> prices) {
        ProviderServicePriceRepository.ServicePriceSummaryRow row = prices.get(service.getId());
        return row == null
                ? new ServiceResponse(service)
                : new ServiceResponse(service, row.getMinPrice(), row.getProviderCount() == null ? 0L : row.getProviderCount());
    }
}