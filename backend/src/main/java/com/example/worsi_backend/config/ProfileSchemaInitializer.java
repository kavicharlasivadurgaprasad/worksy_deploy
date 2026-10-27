package com.example.worsi_backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.util.List;

/**
 * Safety net for the Edit Profile columns, same idea as ProviderLocationSchemaInitializer. It runs
 * BEFORE Hibernate validates the schema (see PasswordResetSchemaConfig) and idempotently adds the
 * new columns if Flyway has not. The statements mirror db/migration/V5__add_profile_edit_support.sql
 * and use IF NOT EXISTS, so they are harmless when Flyway has already applied (or later applies) it.
 * Purely additive: no rows are touched.
 */
public class ProfileSchemaInitializer implements InitializingBean {

    private static final Logger log = LoggerFactory.getLogger(ProfileSchemaInitializer.class);

    private static final List<String> STATEMENTS = List.of(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_storage_key VARCHAR(255)",
            "ALTER TABLE addresses ADD COLUMN IF NOT EXISTS state VARCHAR(100)",
            "ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS description VARCHAR(1000)"
    );

    private final JdbcTemplate jdbc;

    public ProfileSchemaInitializer(DataSource dataSource) {
        this.jdbc = new JdbcTemplate(dataSource);
    }

    @Override
    public void afterPropertiesSet() {
        for (String sql : STATEMENTS) {
            try {
                jdbc.execute(sql);
            } catch (Exception e) {
                log.warn("Profile schema step skipped: {}", e.getMessage());
            }
        }
        log.info("Profile schema check completed.");
    }
}
