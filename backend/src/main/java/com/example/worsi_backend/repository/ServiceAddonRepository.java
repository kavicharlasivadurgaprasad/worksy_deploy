package com.example.worsi_backend.repository;

import com.example.worsi_backend.Entity.ServiceAddon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceAddonRepository extends JpaRepository<ServiceAddon, Long> {
}