-- Adds multi-provider auth support (Google / Apple / Phone) to the pre-existing "users" table
-- without losing or touching any existing rows.
--
-- Root cause this fixes: the User entity was updated to require auth_provider (and to add
-- google_id / apple_id / email_verified / phone_verified), and Hibernate's ddl-auto=update tried
-- to add auth_provider straight as NOT NULL. Postgres rejects an ALTER COLUMN ... SET NOT NULL
-- while existing rows are NULL, and because that ALTER failed inside the same DDL transaction,
-- the column did not end up existing at all afterwards (hence "auth_provider does not exist" on
-- the very next query). This migration adds each column as nullable first, backfills every
-- existing row with the correct value, and only then applies the NOT NULL constraints - so it is
-- safe to run against a database that already has real users in it.

-- 1. Add the new columns as NULLABLE first (safe against existing rows).
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider   VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id       VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_id        VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified  BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified  BOOLEAN;

-- 2. Backfill auth_provider for every existing row using the best available signal:
--      - already has a google_id  -> GOOGLE
--      - already has an apple_id  -> APPLE
--      - has a password           -> LOCAL   (the normal email/password case)
--      - otherwise has a phone    -> PHONE
--      - no signal at all         -> LOCAL   (safe default; matches the entity's Java default)
UPDATE users
SET auth_provider = CASE
    WHEN google_id IS NOT NULL THEN 'GOOGLE'
    WHEN apple_id  IS NOT NULL THEN 'APPLE'
    WHEN password_hash IS NOT NULL THEN 'LOCAL'
    WHEN phone IS NOT NULL THEN 'PHONE'
    ELSE 'LOCAL'
END
WHERE auth_provider IS NULL;

-- 3. Backfill the new verification flags for existing rows to a safe default.
UPDATE users SET email_verified = FALSE WHERE email_verified IS NULL;
UPDATE users SET phone_verified = FALSE WHERE phone_verified IS NULL;

-- 4. Now that every row has a value, it's safe to enforce NOT NULL (matches the entity).
ALTER TABLE users ALTER COLUMN auth_provider  SET NOT NULL;
ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL;
ALTER TABLE users ALTER COLUMN phone_verified SET NOT NULL;
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT FALSE;
ALTER TABLE users ALTER COLUMN phone_verified SET DEFAULT FALSE;

-- 5. Restrict auth_provider to the four known values (mirrors the Java AuthProvider enum).
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_auth_provider;
ALTER TABLE users ADD CONSTRAINT chk_users_auth_provider
    CHECK (auth_provider IN ('LOCAL', 'GOOGLE', 'APPLE', 'PHONE'));

-- 6. Uniqueness for the provider ids, matching @Column(unique = true) on User.googleId/appleId.
--    (Postgres unique constraints already allow multiple NULLs, so unlinked users are unaffected.)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_users_google_id'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT uk_users_google_id UNIQUE (google_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_users_apple_id'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT uk_users_apple_id UNIQUE (apple_id);
    END IF;
END $$;
