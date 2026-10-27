package com.example.worsi_backend.config;

import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;

/**
 * Makes Hibernate's entityManagerFactory wait for PasswordResetSchemaInitializer, so the
 * ddl-auto=validate check never runs before the password-reset table exists.
 */
@Configuration
public class PasswordResetSchemaConfig {

    @Bean
    public static BeanFactoryPostProcessor entityManagerFactoryDependsOnPasswordResetSchema() {
        return beanFactory -> {
            if (beanFactory.containsBeanDefinition("entityManagerFactory")) {
                BeanDefinition definition = beanFactory.getBeanDefinition("entityManagerFactory");
                String[] dependsOn = StringUtils.addStringToArray(definition.getDependsOn(), "passwordResetSchemaInitializer");
                dependsOn = StringUtils.addStringToArray(dependsOn, "bookingImageSchemaInitializer");
                dependsOn = StringUtils.addStringToArray(dependsOn, "providerLocationSchemaInitializer");
                dependsOn = StringUtils.addStringToArray(dependsOn, "profileSchemaInitializer");
                dependsOn = StringUtils.addStringToArray(dependsOn, "providerPricingSchemaInitializer");
                definition.setDependsOn(dependsOn);
            }
        };
    }

    /** Creates booking_images (photos on bookings) if Flyway has not. Must run before Hibernate validates. */
    @Bean
    public BookingImageSchemaInitializer bookingImageSchemaInitializer(DataSource dataSource) {
        return new BookingImageSchemaInitializer(dataSource);
    }

    /** Adds provider_profiles location/availability columns (nearby search) if Flyway has not. Must run before Hibernate validates. */
    @Bean
    public ProviderLocationSchemaInitializer providerLocationSchemaInitializer(DataSource dataSource) {
        return new ProviderLocationSchemaInitializer(dataSource);
    }

    /** Adds the Edit Profile columns (avatar key, address state, provider description) if Flyway has not. Must run before Hibernate validates. */
    @Bean
    public ProfileSchemaInitializer profileSchemaInitializer(DataSource dataSource) {
        return new ProfileSchemaInitializer(dataSource);
    }

    /** Creates provider_service_prices and bookings.completed_at if Flyway has not. Must run before Hibernate validates. */
    @Bean
    public ProviderPricingSchemaInitializer providerPricingSchemaInitializer(DataSource dataSource) {
        return new ProviderPricingSchemaInitializer(dataSource);
    }

    @Bean
    public PasswordResetSchemaInitializer passwordResetSchemaInitializer(DataSource dataSource) {
        return new PasswordResetSchemaInitializer(dataSource);
    }
}
