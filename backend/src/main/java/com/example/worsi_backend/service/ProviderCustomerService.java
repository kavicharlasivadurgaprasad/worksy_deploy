package com.example.worsi_backend.service;

import com.example.worsi_backend.Entity.Booking;
import com.example.worsi_backend.Entity.BookingStatus;
import com.example.worsi_backend.Entity.ProviderProfile;
import com.example.worsi_backend.Entity.User;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.dto.ProviderCustomerResponse;
import com.example.worsi_backend.repository.BookingRepository;
import com.example.worsi_backend.repository.ProviderProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * The customers of ONE provider, built only from that provider's real bookings. The provider is
 * identified from the authenticated user id passed in by the controller (taken from the JWT), never
 * from an id the client sends, so a provider can never list another provider's customers.
 */
@Service
@Transactional(readOnly = true)
public class ProviderCustomerService {

    private final ProviderProfileRepository providerProfileRepository;
    private final BookingRepository bookingRepository;

    public ProviderCustomerService(ProviderProfileRepository providerProfileRepository,
                                   BookingRepository bookingRepository) {
        this.providerProfileRepository = providerProfileRepository;
        this.bookingRepository = bookingRepository;
    }

    /** Running totals for one customer while the bookings are walked newest-first. */
    private static final class Acc {
        final User customer;
        final Booking latest;          // first booking seen = most recent (query is newest first)
        int total;
        int completed;
        BigDecimal spent = BigDecimal.ZERO;

        Acc(Booking latest) {
            this.customer = latest.getCustomer();
            this.latest = latest;
        }
    }

    public List<ProviderCustomerResponse> getCustomersForProviderUser(Long providerUserId) {
        ProviderProfile provider = providerProfileRepository.findByUserId(providerUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Provider profile not found. Finish setting up your provider profile first."));

        // LinkedHashMap keeps the "most recent customer first" order of the query.
        Map<Long, Acc> byCustomer = new LinkedHashMap<>();
        for (Booking b : bookingRepository.findCustomerBookingsForProvider(provider.getId())) {
            Acc acc = byCustomer.computeIfAbsent(b.getCustomer().getId(), id -> new Acc(b));
            acc.total++;
            if (b.getStatus() == BookingStatus.COMPLETED) {
                acc.completed++;
                if (b.getTotalAmount() != null) {
                    acc.spent = acc.spent.add(b.getTotalAmount());
                }
            }
        }

        List<ProviderCustomerResponse> result = new ArrayList<>(byCustomer.size());
        for (Acc a : byCustomer.values()) {
            Booking last = a.latest;
            String location = java.util.stream.Stream.of(last.getAddress().getArea(), last.getAddress().getCity())
                    .filter(part -> part != null && !part.isBlank())
                    .collect(Collectors.joining(", "));
            result.add(new ProviderCustomerResponse(
                    a.customer.getId(),
                    a.customer.getName(),
                    a.customer.getAvatarUrl(),
                    a.customer.getPhone(),
                    a.total,
                    a.completed,
                    a.spent,
                    last.getDate(),
                    last.getService().getTitle(),
                    last.getStatus(),
                    location.isEmpty() ? null : location));
        }
        return result;
    }
}
