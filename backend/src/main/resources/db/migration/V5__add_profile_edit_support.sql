-- Edit Profile support (customers + providers). Purely additive and idempotent: no rows are
-- deleted or rewritten, existing rows simply get NULL in the new columns.
--
--   users.avatar_storage_key     where the uploaded profile picture lives in ImageStorage
--                                (users.avatar_url, which already existed, holds the public URL path)
--   addresses.state              the address form already had street / area / city / pincode; state was missing
--   provider_profiles.description  longer "about the business" text (tagline is only a short headline)

ALTER TABLE users             ADD COLUMN IF NOT EXISTS avatar_storage_key VARCHAR(255);
ALTER TABLE addresses         ADD COLUMN IF NOT EXISTS state              VARCHAR(100);
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS description        VARCHAR(1000);
