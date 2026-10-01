package com.example.worsi_backend.repository;

import com.example.worsi_backend.Entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    /** Loads the token together with its user so no lazy proxy is touched later. */
    @Query("select t from PasswordResetToken t join fetch t.user where t.tokenHash = :hash")
    Optional<PasswordResetToken> findByTokenHashWithUser(@Param("hash") String hash);

    /** Most recent reset request for this user - used for the resend cooldown. */
    Optional<PasswordResetToken> findTopByUserIdOrderByCreatedAtDesc(Long userId);

    /** How many reset emails were issued for this user in the current rate-limit window. */
    long countByUserIdAndCreatedAtAfter(Long userId, LocalDateTime since);

    /**
     * Atomically claims a token: succeeds (returns 1) only if it is still unused and unexpired.
     * Doing this as one conditional UPDATE - instead of read-then-write - means two simultaneous
     * requests with the same link can never both succeed.
     */
    @Modifying
    @Query("update PasswordResetToken t set t.used = true "
            + "where t.id = :id and t.used = false and t.expiresAt > :now")
    int claimIfValid(@Param("id") Long id, @Param("now") LocalDateTime now);

    /** Kills every still-usable link for a user (older links die when a new one is issued / after a reset). */
    @Modifying
    @Query("update PasswordResetToken t set t.used = true where t.user.id = :userId and t.used = false")
    int invalidateAllForUser(@Param("userId") Long userId);

    /** Housekeeping: expired rows are useless. */
    @Modifying
    @Query("delete from PasswordResetToken t where t.expiresAt < :cutoff")
    int deleteExpiredBefore(@Param("cutoff") LocalDateTime cutoff);
}
