package com.example.worsi_backend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@CrossOrigin(origins = "http://localhost:3000")
public class DatabaseHealthController{

        @Autowired
        private JdbcTemplate jdbcTemplate;

        @GetMapping("/db")
        public Map<String, Object> checkDatabaseHealth() {
            Map<String, Object> response = new HashMap<>();
            try {
                Integer testQuery = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
                String dbVersion = jdbcTemplate.queryForObject("SELECT version()", String.class);
                String currentTime = jdbcTemplate.queryForObject("SELECT TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS')", String.class);

                response.put("status", "UP");
                response.put("database", "PostgreSQL");
                response.put("ping", testQuery != null && testQuery == 1 ? "SUCCESS" : "UNEXPECTED");
                response.put("serverTime", currentTime);
                response.put("version", dbVersion);
                response.put("message", "Spring Boot is successfully connected to the PostgreSQL database!");
            } catch (Exception ex) {
                response.put("status", "DOWN");
                response.put("database", "PostgreSQL");
                response.put("error", ex.getMessage());
                response.put("message", "Failed to connect to PostgreSQL. Please verify your database connection settings.");
            }
            return response;
        }
    }

