-- Nearby-provider search support.
-- Adds an optional geographic location and an explicit availability flag to provider_profiles.
-- Purely additive: no rows are deleted or rewritten, and NO coordinates are invented.
--   * latitude / longitude / service_radius_km are NULL for every existing provider until the
--     provider sets their own location. Providers without coordinates are never returned by the
--     nearby search.
--   * accepting_bookings defaults to FALSE, so no existing provider is silently treated as
--     available for the nearby search; each provider opts in.

ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS latitude          DOUBLE PRECISION;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS longitude         DOUBLE PRECISION;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS service_radius_km DOUBLE PRECISION;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS accepting_bookings BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_provider_latitude_range') THEN
        ALTER TABLE provider_profiles
            ADD CONSTRAINT chk_provider_latitude_range CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_provider_longitude_range') THEN
        ALTER TABLE provider_profiles
            ADD CONSTRAINT chk_provider_longitude_range CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_provider_location_pair') THEN
        ALTER TABLE provider_profiles
            ADD CONSTRAINT chk_provider_location_pair CHECK ((latitude IS NULL) = (longitude IS NULL));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_provider_service_radius') THEN
        ALTER TABLE provider_profiles
            ADD CONSTRAINT chk_provider_service_radius CHECK (service_radius_km IS NULL OR (service_radius_km > 0 AND service_radius_km <= 200));
    END IF;
END $$;

-- Bounding-box prefilter used by the nearby query (only rows that can actually be searched).
CREATE INDEX IF NOT EXISTS idx_provider_profiles_geo
    ON provider_profiles (latitude, longitude)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND accepting_bookings = TRUE;

CREATE INDEX IF NOT EXISTS idx_bookings_provider_date
    ON bookings (provider_id, date);
