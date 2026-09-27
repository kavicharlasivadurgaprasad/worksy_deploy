package com.example.worsi_backend.repository;

import com.example.worsi_backend.Entity.BookingAddon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingAddonRepository extends JpaRepository<BookingAddon, Long> {
}