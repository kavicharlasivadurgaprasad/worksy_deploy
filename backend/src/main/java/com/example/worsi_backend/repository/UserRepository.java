package com.example.worsi_backend.repository;

import com.example.worsi_backend.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByPhone(String phone);

    boolean existsByPhone(String phone);

    Optional<User> findByGoogleId(String googleId);

    /** Lightweight lookup used by the JWT filter; empty when the user has never reset a password. */
    @Query("select u.passwordChangedAt from User u where u.id = :id")
    Optional<LocalDateTime> findPasswordChangedAtById(@Param("id") Long id);
}
