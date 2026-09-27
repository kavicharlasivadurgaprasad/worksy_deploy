package com.example.worsi_backend.service;

import com.example.worsi_backend.dto.ProviderProfileRequest;
import com.example.worsi_backend.dto.ProviderProfileResponse;
import com.example.worsi_backend.Entity.ProviderProfile;
import com.example.worsi_backend.Entity.User;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.repository.ProviderProfileRepository;
import com.example.worsi_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProviderProfileService {

    private final ProviderProfileRepository providerProfileRepository;
    private final UserRepository userRepository;

    public ProviderProfileService(ProviderProfileRepository providerProfileRepository,
                                  UserRepository userRepository) {
        this.providerProfileRepository = providerProfileRepository;
        this.userRepository = userRepository;
    }

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
        profile.setCategory(request.getCategory());
        profile.setExperienceYears(request.getExperienceYears());
        profile.setResponseTime(request.getResponseTime());
        profile.setServiceArea(request.getServiceArea());
        profile.setAvailability(request.getAvailability());

        // System-controlled defaults for a brand-new provider
        profile.setRating(0.0);
        profile.setCompletedJobs(0);
        profile.setVerified(false);

        ProviderProfile saved = providerProfileRepository.save(profile);
        return new ProviderProfileResponse(saved);
    }

    public ProviderProfileResponse getProfile(Long userId) {
        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found for user id: " + userId));
        return new ProviderProfileResponse(profile);
    }

    public List<ProviderProfileResponse> getAllProfiles(String category) {
        List<ProviderProfile> profiles = (category == null || category.isBlank())
                ? providerProfileRepository.findAll()
                : providerProfileRepository.findByCategoryIgnoreCase(category);
        return profiles.stream().map(ProviderProfileResponse::new).toList();
    }

    public ProviderProfileResponse getProfileById(Long providerId) {
        ProviderProfile profile = providerProfileRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + providerId));
        return new ProviderProfileResponse(profile);
    }
}
