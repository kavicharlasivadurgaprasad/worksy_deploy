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

        /** Longer "about the business" text, shown on the provider profile. Optional. */
        @Column(length = 1000)
        private String description;

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

        /** Provider's own base location. NULL until the provider sets it; never guessed. */
        @Column(name = "latitude")
        private Double latitude;

        @Column(name = "longitude")
        private Double longitude;

        /** Max distance this provider is willing to travel. NULL = no provider-side limit. */
        @Column(name = "service_radius_km")
        private Double serviceRadiusKm;

        /** Explicit opt-in used by the nearby search. Defaults to false for every provider. */
        @Column(name = "accepting_bookings", nullable = false)
        private boolean acceptingBookings = false;

        public boolean hasLocation() {
            return latitude != null && longitude != null;
        }
    }

