package com.example.worsi_backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.util.List;

/**
 * Safety net for the nearby-provider columns, same idea as PasswordResetSchemaInitializer. It runs
 * BEFORE Hibernate validates the schema (see PasswordResetSchemaConfig) and idempotently adds the
 * location / availability columns to provider_profiles if they are missing. The statements mirror
 * db/migration/V4__add_provider_location.sql and are all idempotent, so they are harmless when
 * Flyway has applied (or later applies) that migration.
 *
 * Purely additive: no rows are touched and NO coordinates are invented. Existing providers get
 * NULL coordinates and accepting_bookings = FALSE.
 */
public class ProviderLocationSchemaInitializer implements InitializingBean {

    private static final Logger log = LoggerFactory.getLogger(ProviderLocationSchemaInitializer.class);

    private static final List<String> STATEMENTS = List.of(
            "ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION",
            "ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION",
            "ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS service_radius_km DOUBLE PRECISION",
            "ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS accepting_bookings BOOLEAN NOT NULL DEFAULT FALSE",
            "DO $$ BEGIN "
                    + "IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_provider_latitude_range') THEN "
                    + "ALTER TABLE provider_profiles ADD CONSTRAINT chk_provider_latitude_range "
                    + "CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90)); END IF; "
                    + "IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_provider_longitude_range') THEN "
                    + "ALTER TABLE provider_profiles ADD CONSTRAINT chk_provider_longitude_range "
                    + "CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180)); END IF; "
                    + "IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_provider_location_pair') THEN "
                    + "ALTER TABLE provider_profiles ADD CONSTRAINT chk_provider_location_pair "
                    + "CHECK ((latitude IS NULL) = (longitude IS NULL)); END IF; "
                    + "IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_provider_service_radius') THEN "
                    + "ALTER TABLE provider_profiles ADD CONSTRAINT chk_provider_service_radius "
                    + "CHECK (service_radius_km IS NULL OR (service_radius_km > 0 AND service_radius_km <= 200)); END IF; "
                    + "END $$",
            "CREATE INDEX IF NOT EXISTS idx_provider_profiles_geo ON provider_profiles (latitude, longitude) "
                    + "WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND accepting_bookings = TRUE",
            "CREATE INDEX IF NOT EXISTS idx_bookings_provider_date ON bookings (provider_id, date)"
    );

    private final JdbcTemplate jdbc;

    public ProviderLocationSchemaInitializer(DataSource dataSource) {
        this.jdbc = new JdbcTemplate(dataSource);
    }

    @Override
    public void afterPropertiesSet() {
        for (String sql : STATEMENTS) {
            try {
                jdbc.execute(sql);
            } catch (Exception e) {
                log.warn("Provider-location schema step skipped: {}", e.getMessage());
            }
        }
        log.info("Provider-location schema check completed.");
    }
}
