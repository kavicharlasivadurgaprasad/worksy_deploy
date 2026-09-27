package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.ProviderProfile;
import lombok.Getter;

@Getter
public class ProviderProfileResponse {

    private final Long id;
    private final Long userId;
    private final String businessName;
    private final String tagline;
    private final String category;
    private final double rating;
    private final int completedJobs;
    private final int experienceYears;
    private final String responseTime;
    private final String serviceArea;
    private final String availability;
    private final boolean verified;
    private final String badge;

    public ProviderProfileResponse(ProviderProfile profile) {
        this.id = profile.getId();
        this.userId = profile.getUser().getId();
        this.businessName = profile.getBusinessName();
        this.tagline = profile.getTagline();
        this.category = profile.getCategory();
        this.rating = profile.getRating();
        this.completedJobs = profile.getCompletedJobs();
        this.experienceYears = profile.getExperienceYears();
        this.responseTime = profile.getResponseTime();
        this.serviceArea = profile.getServiceArea();
        this.availability = profile.getAvailability();
        this.verified = profile.isVerified();
        this.badge = profile.getBadge();
    }
}