package com.example.worsi_backend.service;

import com.example.worsi_backend.Entity.Address;
import com.example.worsi_backend.Entity.Booking;
import com.example.worsi_backend.Entity.BookingStatus;
import com.example.worsi_backend.Entity.ProviderProfile;
import com.example.worsi_backend.Entity.User;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.dto.ProviderCustomerResponse;
import com.example.worsi_backend.repository.BookingRepository;
import com.example.worsi_backend.repository.ProviderProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProviderCustomerServiceTest {

    @Mock ProviderProfileRepository providerProfileRepository;
    @Mock BookingRepository bookingRepository;

    private ProviderCustomerService service;
    private ProviderProfile provider;

    @BeforeEach
    void setUp() {
        service = new ProviderCustomerService(providerProfileRepository, bookingRepository);
        provider = new ProviderProfile();
        setId(provider, 5L);
        when(providerProfileRepository.findByUserId(50L)).thenReturn(Optional.of(provider));
    }

    private static void setId(Object target, Long id) {
        org.springframework.test.util.ReflectionTestUtils.setField(target, "id", id);
    }

    private static User customer(long id, String name) {
        User u = new User();
        setId(u, id);
        u.setName(name);
        u.setPhone("+91900000000" + id);
        return u;
    }

    private static Booking booking(User customer, BookingStatus status, String date, String total, String title) {
        Booking b = new Booking();
        b.setCustomer(customer);
        b.setStatus(status);
        b.setDate(LocalDate.parse(date));
        b.setTotalAmount(new BigDecimal(total));
        com.example.worsi_backend.Entity.Service svc = new com.example.worsi_backend.Entity.Service();
        svc.setTitle(title);
        b.setService(svc);
        Address a = new Address();
        a.setArea("Indiranagar");
        a.setCity("Bengaluru");
        a.setStreet("12 Secret Street");
        b.setAddress(a);
        return b;
    }

    @Test
    void providerWithNoBookings_getsAnEmptyList_notDummyCustomers() {
        when(bookingRepository.findCustomerBookingsForProvider(5L)).thenReturn(List.of());

        assertTrue(service.getCustomersForProviderUser(50L).isEmpty());
    }

    @Test
    void customersAreGroupedFromRealBookings_withCompletedSpendOnly() {
        User asha = customer(1L, "Asha");
        User ravi = customer(2L, "Ravi");
        // Query order is newest first.
        when(bookingRepository.findCustomerBookingsForProvider(5L)).thenReturn(List.of(
                booking(asha, BookingStatus.CONFIRMED, "2026-10-20", "700", "AC Service"),
                booking(ravi, BookingStatus.COMPLETED, "2026-10-10", "300", "Cleaning"),
                booking(asha, BookingStatus.COMPLETED, "2026-09-01", "500", "AC Repair"),
                booking(asha, BookingStatus.COMPLETED, "2026-08-01", "250", "AC Repair")));

        List<ProviderCustomerResponse> result = service.getCustomersForProviderUser(50L);

        assertEquals(2, result.size());

        ProviderCustomerResponse first = result.get(0);          // most recent booking first
        assertEquals("Asha", first.getName());
        assertEquals(3, first.getTotalBookings());
        assertEquals(2, first.getCompletedBookings());
        assertEquals(0, new BigDecimal("750").compareTo(first.getTotalSpent())); // the CONFIRMED 700 is not counted
        assertEquals("AC Service", first.getLastServiceTitle());
        assertEquals(BookingStatus.CONFIRMED, first.getLastStatus());
        assertEquals(LocalDate.parse("2026-10-20"), first.getLastBookingDate());
        assertEquals("Indiranagar, Bengaluru", first.getLastLocation());   // never the street

        ProviderCustomerResponse second = result.get(1);
        assertEquals("Ravi", second.getName());
        assertEquals(1, second.getTotalBookings());
        assertEquals(0, new BigDecimal("300").compareTo(second.getTotalSpent()));
        assertNull(second.getAvatarUrl());                       // no picture uploaded: null, not a fake one
    }

    @Test
    void providerIsLookedUpFromTheAuthenticatedUserId_andUnknownProviderIs404() {
        assertThrows(ResourceNotFoundException.class, () -> service.getCustomersForProviderUser(999L));
        verify(bookingRepository, never()).findCustomerBookingsForProvider(org.mockito.ArgumentMatchers.anyLong());
    }
}
