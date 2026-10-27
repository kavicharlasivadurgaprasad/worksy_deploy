package com.example.worsi_backend.repository;

import com.example.worsi_backend.Entity.BookingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookingImageRepository extends JpaRepository<BookingImage, Long> {

    Optional<BookingImage> findByIdAndBookingId(Long id, Long bookingId);
}
