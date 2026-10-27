package com.example.worsi_backend.Controller;

import com.example.worsi_backend.Exception.ForbiddenException;
import com.example.worsi_backend.dto.ProviderLocationRequest;
import com.example.worsi_backend.dto.ProviderProfileRequest;
import com.example.worsi_backend.dto.ProviderProfileResponse;
import com.example.worsi_backend.security.SecurityUtil;
import com.example.worsi_backend.service.ProviderProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users/{userId}/provider-profile")
@CrossOrigin(origins = "http://localhost:3000")
public class ProviderProfileController {

    private final ProviderProfileService providerProfileService;
    private final SecurityUtil securityUtil;

    public ProviderProfileController(ProviderProfileService providerProfileService, SecurityUtil securityUtil) {
        this.providerProfileService = providerProfileService;
        this.securityUtil = securityUtil;
    }

    @PostMapping
    public ResponseEntity<ProviderProfileResponse> create(@PathVariable Long userId,
                                                          @Valid @RequestBody ProviderProfileRequest request) {
        if (!userId.equals(securityUtil.getCurrentUserId())) {
            throw new ForbiddenException("You can only create your own provider profile");
        }
        ProviderProfileResponse response = providerProfileService.createProfile(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** A provider sets their own base location, service radius and availability. Owner only. */
    @PutMapping("/location")
    public ProviderProfileResponse updateLocation(@PathVariable Long userId,
                                                  @Valid @RequestBody ProviderLocationRequest request) {
        if (!userId.equals(securityUtil.getCurrentUserId())) {
            throw new ForbiddenException("You can only update your own location");
        }
        return providerProfileService.updateLocation(userId, request);
    }

    @GetMapping
    public ProviderProfileResponse get(@PathVariable Long userId) {
        return providerProfileService.getProfile(userId);
    }
}