package com.example.worsi_backend.repository;

import com.example.worsi_backend.Entity.ProviderProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {

    Optional<ProviderProfile> findByUserId(Long userId);
    List<ProviderProfile> findByCategoryIgnoreCase(String category);
}