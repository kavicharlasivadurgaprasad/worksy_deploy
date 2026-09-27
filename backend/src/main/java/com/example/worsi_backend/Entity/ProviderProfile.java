package com.example.worsi_backend.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

    @Entity
    @Table(name = "provider_profiles")
    @Getter
    @Setter
    @NoArgsConstructor
    public class ProviderProfile {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @OneToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id", nullable = false, unique = true)
        private User user;

        @Column(name = "business_name", nullable = false)
        private String businessName;

        private String tagline;

        @Column(nullable = false)
        private String category;

        @Column(nullable = false)
        private double rating;

        @Column(name = "completed_jobs", nullable = false)
        private int completedJobs;

        @Column(name = "experience_years", nullable = false)
        private int experienceYears;

        @Column(name = "response_time")
        private String responseTime;

        @Column(name = "service_area")
        private String serviceArea;

        private String availability;

        @Column(nullable = false)
        private boolean verified;

        private String badge;
    }

