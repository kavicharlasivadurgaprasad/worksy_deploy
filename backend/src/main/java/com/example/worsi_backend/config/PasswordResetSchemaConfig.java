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
                definition.setDependsOn(
                        StringUtils.addStringToArray(definition.getDependsOn(), "passwordResetSchemaInitializer"));
            }
        };
    }

    @Bean
    public PasswordResetSchemaInitializer passwordResetSchemaInitializer(DataSource dataSource) {
        return new PasswordResetSchemaInitializer(dataSource);
    }
}
