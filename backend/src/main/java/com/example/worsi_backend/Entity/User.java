package com.example.worsi_backend.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

    @Entity
    @Table(name = "users")
    @Getter
    @Setter
    @NoArgsConstructor
    public class User {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false)
        private String name;

        // Nullable: a user who signs up with Phone/Google/Apple may not have an email yet
        // (Apple in particular may withhold it). Still unique when present.
        @Column(unique = true)
        private String email;

        // Nullable: users created via Phone/Google/Apple have no local password at all.
        @Column(name = "password_hash")
        private String passwordHash;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private Role role;

        // Doubles as the verified phone-login number (see AuthService#loginOrRegisterWithPhone).
        // Kept as a plain nullable column (not a DB-level unique constraint) because it predates
        // phone login and existing rows may share blank/duplicate values; uniqueness for phone
        // login is instead enforced in AuthService before a new account is created.
        private String phone;

        @Column(name = "avatar_url")
        private String avatarUrl;

        // --- Added for social/phone login (Google, Apple, Phone OTP) ---

        /** How this account was first created. Purely informational - see AuthProvider. */
        @Enumerated(EnumType.STRING)
        @Column(name = "auth_provider", nullable = false)
        private AuthProvider authProvider = AuthProvider.LOCAL;

        /** Google's stable "sub" claim for this user, once linked. */
        @Column(name = "google_id", unique = true)
        private String googleId;

        /** Apple's stable "sub" claim for this user, once linked. */
        @Column(name = "apple_id", unique = true)
        private String appleId;

        @Column(name = "email_verified", nullable = false)
        private boolean emailVerified = false;

        @Column(name = "phone_verified", nullable = false)
        private boolean phoneVerified = false;

        /**
         * Set when the password is reset via the forgot-password flow. JWTs issued before this
         * instant are rejected (see TokenRevocationService). NULL = never reset, nothing revoked.
         */
        @Column(name = "password_changed_at")
        private LocalDateTime passwordChangedAt;
    }
