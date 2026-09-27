package com.example.worsi_backend.Controller;

import com.example.worsi_backend.dto.ServiceRequest;
import com.example.worsi_backend.dto.ServiceResponse;
import com.example.worsi_backend.Exception.ForbiddenException;
import com.example.worsi_backend.security.SecurityUtil;
import com.example.worsi_backend.service.ServiceCatalogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/services")
@CrossOrigin(origins = "http://localhost:3000")
public class ServiceController {

    private final ServiceCatalogService serviceCatalogService;
    private final SecurityUtil securityUtil;

    public ServiceController(ServiceCatalogService serviceCatalogService, SecurityUtil securityUtil) {
        this.serviceCatalogService = serviceCatalogService;
        this.securityUtil = securityUtil;
    }

    @PostMapping
    public ResponseEntity<ServiceResponse> create(@Valid @RequestBody ServiceRequest request) {
        if (!"PROVIDER".equals(securityUtil.getCurrentUserRole())) {
            throw new ForbiddenException("Only providers can create services");
        }
        ServiceResponse response = serviceCatalogService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<ServiceResponse> getAll(@RequestParam(required = false) Long categoryId) {
        return categoryId != null
                ? serviceCatalogService.getServicesByCategory(categoryId)
                : serviceCatalogService.getAllServices();
    }

    @GetMapping("/{id}")
    public ServiceResponse getById(@PathVariable Long id) {
        return serviceCatalogService.getServiceById(id);
    }
}