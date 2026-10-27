package com.example.worsi_backend.repository;

import com.example.worsi_backend.Entity.ProviderProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {

    Optional<ProviderProfile> findByUserId(Long userId);
    List<ProviderProfile> findByCategoryIgnoreCase(String category);

    /** One row of the nearby search. Aliases are quoted in the SQL so they keep their camelCase. */
    interface NearbyRow {
        Long getId();
        Long getUserId();
        /** users.avatar_url of the provider (NULL when no picture). */
        String getAvatarUrl();
        String getBusinessName();
        String getTagline();
        String getCategory();
        /** Average of real review ratings; NULL when the provider has no reviews. */
        Double getRating();
        Long getReviewCount();
        /** Bookings in status COMPLETED, counted from the bookings table. */
        Long getCompletedJobs();
        Integer getExperienceYears();
        String getResponseTime();
        String getServiceArea();
        String getAvailability();
        Boolean getVerified();
        String getBadge();
        Double getDistanceKm();
    }

    /**
     * Nearby, available providers of one category, nearest first. All geography is done in PostgreSQL:
     * an indexed bounding box (minLat/maxLat, and minLng/maxLng unless useLngBox is false) cheaply
     * discards far-away rows, then the Haversine great-circle distance (Earth radius 6371.0088 km)
     * is computed for the survivors and filtered by radius.
     *
     * A provider is returned only if: category matches, accepting_bookings is true, it has coordinates,
     * it is within the customer's radius AND within its own service_radius_km (when set), and - if
     * dateIso is non-empty - it has no CONFIRMED / IN_PROGRESS booking at that date and time slot.
     */
    @Query(value = """
            SELECT * FROM (
                SELECT p.id                 AS "id",
                       p.user_id            AS "userId",
                       u.avatar_url         AS "avatarUrl",
                       p.business_name      AS "businessName",
                       p.tagline            AS "tagline",
                       p.category           AS "category",
                       (SELECT CAST(AVG(r.rating) AS DOUBLE PRECISION)
                          FROM reviews r JOIN bookings rb ON rb.id = r.booking_id
                         WHERE rb.provider_id = p.id)  AS "rating",
                       (SELECT COUNT(*)
                          FROM reviews r JOIN bookings rb ON rb.id = r.booking_id
                         WHERE rb.provider_id = p.id)  AS "reviewCount",
                       (SELECT COUNT(*)
                          FROM bookings cb
                         WHERE cb.provider_id = p.id AND cb.status = 'COMPLETED') AS "completedJobs",
                       p.experience_years   AS "experienceYears",
                       p.response_time      AS "responseTime",
                       p.service_area       AS "serviceArea",
                       p.availability       AS "availability",
                       p.verified           AS "verified",
                       p.badge              AS "badge",
                       p.service_radius_km  AS service_radius_km,
                       6371.0088 * 2 * ASIN(LEAST(1.0, SQRT(
                           POWER(SIN(RADIANS(p.latitude - :lat) / 2), 2)
                         + COS(RADIANS(:lat)) * COS(RADIANS(p.latitude))
                           * POWER(SIN(RADIANS(p.longitude - :lng) / 2), 2)
                       ))) AS "distanceKm"
                FROM provider_profiles p
                JOIN users u ON u.id = p.user_id
                WHERE LOWER(p.category) = LOWER(:category)
                  AND p.accepting_bookings = TRUE
                  AND p.latitude IS NOT NULL
                  AND p.longitude IS NOT NULL
                  AND p.latitude BETWEEN :minLat AND :maxLat
                  AND (CAST(:useLngBox AS boolean) = FALSE OR p.longitude BETWEEN :minLng AND :maxLng)
                  AND (CAST(NULLIF(:dateIso, '') AS date) IS NULL OR NOT EXISTS (
                        SELECT 1 FROM bookings b
                        WHERE b.provider_id = p.id
                          AND b.date = CAST(NULLIF(:dateIso, '') AS date)
                          AND b.time_slot = :timeSlot
                          AND b.status IN ('CONFIRMED', 'IN_PROGRESS')))
            ) t
            WHERE t."distanceKm" <= :radiusKm
              AND (t.service_radius_km IS NULL OR t."distanceKm" <= t.service_radius_km)
            ORDER BY t."distanceKm" ASC, t."id" ASC
            LIMIT :maxResults
            """, nativeQuery = true)
    List<NearbyRow> findNearby(@Param("lat") double lat,
                               @Param("lng") double lng,
                               @Param("radiusKm") double radiusKm,
                               @Param("category") String category,
                               @Param("minLat") double minLat,
                               @Param("maxLat") double maxLat,
                               @Param("minLng") double minLng,
                               @Param("maxLng") double maxLng,
                               @Param("useLngBox") boolean useLngBox,
                               @Param("dateIso") String dateIso,
                               @Param("timeSlot") String timeSlot,
                               @Param("maxResults") int maxResults);
}
