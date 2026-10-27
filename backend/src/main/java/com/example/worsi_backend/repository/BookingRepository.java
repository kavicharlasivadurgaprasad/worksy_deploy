package com.example.worsi_backend.repository;

import com.example.worsi_backend.Entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerId(Long customerId);

    List<Booking> findByProviderId(Long providerId);

    /** Is this saved address referenced by any booking (past or present)? */
    boolean existsByAddressId(Long addressId);

    /** Does this provider have a booking in any of the given statuses? */
    boolean existsByProviderIdAndStatusIn(Long providerId, java.util.Collection<com.example.worsi_backend.Entity.BookingStatus> statuses);

    /** Number of bookings per provider that are in the given status. A provider with none has no row. */
    interface StatusCountRow {
        Long getProviderId();
        Long getBookingCount();
    }

    @org.springframework.data.jpa.repository.Query("select b.provider.id as providerId, count(b) as bookingCount "
            + "from Booking b where b.provider.id in :providerIds and b.status = :status group by b.provider.id")
    List<StatusCountRow> countByProviderAndStatus(
            @org.springframework.data.repository.query.Param("providerIds") java.util.Collection<Long> providerIds,
            @org.springframework.data.repository.query.Param("status") com.example.worsi_backend.Entity.BookingStatus status);

    /** Sum of booking totals of one provider in one status. NULL (not zero) when there are no such bookings. */
    @org.springframework.data.jpa.repository.Query("select sum(b.totalAmount) from Booking b "
            + "where b.provider.id = :providerId and b.status = :status")
    java.math.BigDecimal sumTotalAmountByProviderAndStatus(
            @org.springframework.data.repository.query.Param("providerId") Long providerId,
            @org.springframework.data.repository.query.Param("status") com.example.worsi_backend.Entity.BookingStatus status);

    /**
     * Every booking of one provider that counts as a real customer relationship (anything except
     * CANCELLED, which also covers requests the provider declined), newest first. Customer, service
     * and address are fetched in the same query so building the customer list causes no extra queries.
     */
    @org.springframework.data.jpa.repository.Query("select b from Booking b "
            + "join fetch b.customer join fetch b.service join fetch b.address "
            + "where b.provider.id = :providerId and b.status <> com.example.worsi_backend.Entity.BookingStatus.CANCELLED "
            + "order by b.date desc, b.id desc")
    List<Booking> findCustomerBookingsForProvider(
            @org.springframework.data.repository.query.Param("providerId") Long providerId);
}
