package com.example.worsi_backend.service;

import com.example.worsi_backend.dto.ServiceAddonRequest;
import com.example.worsi_backend.dto.ServiceRequest;
import com.example.worsi_backend.dto.ServiceResponse;
import com.example.worsi_backend.Entity.ServiceAddon;
import com.example.worsi_backend.Entity.ServiceCategory;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.repository.ServiceCategoryRepository;
import com.example.worsi_backend.repository.ServiceRepository;

import java.util.List;

@org.springframework.stereotype.Service
public class ServiceCatalogService {

    private final ServiceRepository serviceRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;

    public ServiceCatalogService(ServiceRepository serviceRepository,
                                 ServiceCategoryRepository serviceCategoryRepository) {
        this.serviceRepository = serviceRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
    }

    public ServiceResponse createService(ServiceRequest request) {
        ServiceCategory category = serviceCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        com.example.worsi_backend.Entity.Service service = new com.example.worsi_backend.Entity.Service();
        service.setCategory(category);
        service.setTitle(request.getTitle());
        service.setPrice(request.getPrice());
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
        return serviceRepository.findAll().stream()
                .map(ServiceResponse::new)
                .toList();
    }

    public List<ServiceResponse> getServicesByCategory(Long categoryId) {
        return serviceRepository.findByCategoryId(categoryId).stream()
                .map(ServiceResponse::new)
                .toList();
    }

    public ServiceResponse getServiceById(Long id) {
        com.example.worsi_backend.Entity.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        return new ServiceResponse(service);
    }
}