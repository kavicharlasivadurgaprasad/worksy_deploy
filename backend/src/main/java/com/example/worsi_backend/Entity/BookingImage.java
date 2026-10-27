package com.example.worsi_backend.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Metadata for one problem photo attached to a booking. The bytes live in {@code ImageStorage}. */
@Entity
@Table(name = "booking_images")
@Getter
@Setter
@NoArgsConstructor
public class BookingImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    /** Server-generated key (never derived from the client filename), e.g. bookings/12/uuid.jpg */
    @Column(name = "storage_key", nullable = false, unique = true)
    private String storageKey;

    /** Sanitised display name only; never used to build a path. */
    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    /** Content type determined from the file's bytes, not from the client. */
    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
