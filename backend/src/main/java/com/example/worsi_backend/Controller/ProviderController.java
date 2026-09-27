package com.example.worsi_backend.Controller;

import com.example.worsi_backend.dto.ProviderProfileResponse;
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

    public ProviderController(ProviderProfileService providerProfileService) {
        this.providerProfileService = providerProfileService;
    }

    @GetMapping
    public List<ProviderProfileResponse> getAll(@RequestParam(required = false) String category) {
        return providerProfileService.getAllProfiles(category);
    }

    @GetMapping("/{id}")
    public ProviderProfileResponse getById(@PathVariable Long id) {
        return providerProfileService.getProfileById(id);
    }
}
