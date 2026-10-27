package com.example.worsi_backend.service;

import com.example.worsi_backend.Entity.ProviderProfile;
import com.example.worsi_backend.Entity.ProviderServicePrice;
import com.example.worsi_backend.Entity.Service;
import com.example.worsi_backend.Entity.ServiceCategory;
import com.example.worsi_backend.Exception.BadRequestException;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.dto.ProviderServicePriceEntry;
import com.example.worsi_backend.dto.ProviderServicePriceResponse;
import com.example.worsi_backend.repository.ProviderProfileRepository;
import com.example.worsi_backend.repository.ProviderServicePriceRepository;
import com.example.worsi_backend.repository.ServiceCategoryRepository;
import com.example.worsi_backend.repository.ServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProviderPricingServiceTest {

    @Mock ProviderProfileRepository providerProfileRepository;
    @Mock ProviderServicePriceRepository priceRepository;
    @Mock ServiceRepository serviceRepository;
    @Mock ServiceCategoryRepository serviceCategoryRepository;

    private ProviderPricingService service;
    private ProviderProfile plumber;
    private Service tapRepair;
    private Service fanInstall;

    @BeforeEach
    void setUp() {
        service = new ProviderPricingService(providerProfileRepository, priceRepository,
                serviceRepository, serviceCategoryRepository);
        ReflectionTestUtils.setField(service, "maxPrice", new BigDecimal("100000"));

        ServiceCategory plumbing = new ServiceCategory();
        plumbing.setId(1L);
        plumbing.setName("Plumbing");
        ServiceCategory electrician = new ServiceCategory();
        electrician.setId(2L);
        electrician.setName("Electrician");

        plumber = new ProviderProfile();
        plumber.setId(10L);
        plumber.setBusinessName("Ravi Plumbing");
        plumber.setCategory("Plumbing");

        tapRepair = new Service();
        tapRepair.setId(100L);
        tapRepair.setTitle("Tap & Pipe Leakage Repair");
        tapRepair.setDuration("45 mins");
        tapRepair.setCategory(plumbing);

        fanInstall = new Service();
        fanInstall.setId(200L);
        fanInstall.setTitle("Fan / Light Installation");
        fanInstall.setDuration("30 mins");
        fanInstall.setCategory(electrician);

        when(providerProfileRepository.findByUserId(7L)).thenReturn(Optional.of(plumber));
        when(serviceRepository.findById(100L)).thenReturn(Optional.of(tapRepair));
        when(serviceRepository.findById(200L)).thenReturn(Optional.of(fanInstall));
        when(priceRepository.save(any(ProviderServicePrice.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    // ---- validation -------------------------------------------------

    @Test
    void rejectsMissingZeroAndNegativePrices() {
        assertThrows(BadRequestException.class, () -> service.setPrice(7L, 100L, null));
        assertThrows(BadRequestException.class, () -> service.setPrice(7L, 100L, BigDecimal.ZERO));
        assertThrows(BadRequestException.class, () -> service.setPrice(7L, 100L, new BigDecimal("-5")));
        verify(priceRepository, never()).save(any());
    }

    @Test
    void rejectsMoreThanTwoDecimalPlacesAndAboveMaximum() {
        assertThrows(BadRequestException.class, () -> service.setPrice(7L, 100L, new BigDecimal("10.999")));
        assertThrows(BadRequestException.class, () -> service.setPrice(7L, 100L, new BigDecimal("100000.01")));
        verify(priceRepository, never()).save(any());
    }

    @Test
    void acceptsWholeAndTwoDecimalPricesAtTheMaximum() {
        assertEquals(new BigDecimal("499.50"), service.setPrice(7L, 100L, new BigDecimal("499.5")).getPrice());
        assertEquals(new BigDecimal("100000.00"), service.setPrice(7L, 100L, new BigDecimal("100000")).getPrice());
    }

    // ---- ownership / category ---------------------------------------

    @Test
    void provider_canOnlyPriceServicesOfOwnCategory() {
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> service.setPrice(7L, 200L, new BigDecimal("300")));
        assertTrue(ex.getMessage().contains("own category"));
        verify(priceRepository, never()).save(any());
    }

    @Test
    void userWithoutProviderProfile_cannotSetPrices() {
        assertThrows(ResourceNotFoundException.class, () -> service.setPrice(99L, 100L, new BigDecimal("300")));
        assertThrows(ResourceNotFoundException.class, () -> service.listForOwner(99L));
        verify(priceRepository, never()).save(any());
    }

    @Test
    void unknownService_isNotFound() {
        assertThrows(ResourceNotFoundException.class, () -> service.setPrice(7L, 12345L, new BigDecimal("300")));
    }

    // ---- create / update --------------------------------------------

    @Test
    void setPrice_createsRowForTheCallersOwnProvider() {
        when(priceRepository.findByProviderIdAndServiceId(10L, 100L)).thenReturn(Optional.empty());

        ProviderServicePriceResponse response = service.setPrice(7L, 100L, new BigDecimal("350"));

        ArgumentCaptor<ProviderServicePrice> saved = ArgumentCaptor.forClass(ProviderServicePrice.class);
        verify(priceRepository).save(saved.capture());
        assertEquals(10L, saved.getValue().getProvider().getId());
        assertEquals(100L, saved.getValue().getService().getId());
        assertEquals(new BigDecimal("350.00"), saved.getValue().getPrice());
        assertTrue(response.isPriceSet());
    }

    @Test
    void setPrice_updatesTheExistingRowInsteadOfCreatingASecond() {
        ProviderServicePrice existing = new ProviderServicePrice();
        existing.setProvider(plumber);
        existing.setService(tapRepair);
        existing.setPrice(new BigDecimal("300.00"));
        existing.setCreatedAt(java.time.Instant.parse("2026-01-01T00:00:00Z"));
        existing.setUpdatedAt(existing.getCreatedAt());
        when(priceRepository.findByProviderIdAndServiceId(10L, 100L)).thenReturn(Optional.of(existing));

        service.setPrice(7L, 100L, new BigDecimal("450"));

        verify(priceRepository).save(existing);
        assertEquals(new BigDecimal("450.00"), existing.getPrice());
        assertEquals(java.time.Instant.parse("2026-01-01T00:00:00Z"), existing.getCreatedAt());
    }

    // ---- listing -----------------------------------------------------

    @Test
    void listForOwner_marksUnpricedServicesAsNotSet_withoutAnyDefault() {
        ServiceCategory plumbing = tapRepair.getCategory();
        when(serviceCategoryRepository.findByNameIgnoreCase("Plumbing")).thenReturn(Optional.of(plumbing));
        when(serviceRepository.findByCategoryId(1L)).thenReturn(List.of(tapRepair));
        when(priceRepository.findAllForProvider(10L)).thenReturn(List.of());

        List<ProviderServicePriceResponse> rows = service.listForOwner(7L);

        assertEquals(1, rows.size());
        assertFalse(rows.get(0).isPriceSet());
        assertNull(rows.get(0).getPrice());
    }

    // ---- bulk save (create profile / Edit Profile) -------------------

    private static ProviderServicePriceEntry entry(Long serviceId, String price) {
        ProviderServicePriceEntry e = new ProviderServicePriceEntry();
        e.setServiceId(serviceId);
        e.setPrice(price == null ? null : new BigDecimal(price));
        return e;
    }

    @Test
    void setPrices_savesEveryEntryForTheCallersProvider() {
        when(priceRepository.findByProviderIdAndServiceId(10L, 100L)).thenReturn(Optional.empty());

        List<ProviderServicePriceResponse> out = service.setPrices(7L, List.of(entry(100L, "250")));

        assertEquals(1, out.size());
        assertEquals(new BigDecimal("250.00"), out.get(0).getPrice());
        verify(priceRepository).save(any(ProviderServicePrice.class));
    }

    @Test
    void setPrices_isAllOrNothing_oneInvalidPriceWritesNothing() {
        assertThrows(BadRequestException.class,
                () -> service.setPrices(7L, List.of(entry(100L, "250"), entry(200L, "300"))));
        verify(priceRepository, never()).save(any());
    }

    @Test
    void setPrices_rejectsServiceFromAnotherCategoryAndNullPrice() {
        assertThrows(BadRequestException.class, () -> service.setPrices(7L, List.of(entry(200L, "300"))));
        assertThrows(BadRequestException.class, () -> service.setPrices(7L, List.of(entry(100L, null))));
        verify(priceRepository, never()).save(any());
    }

    @Test
    void setPrices_withNoEntriesChangesNothing() {
        assertTrue(service.setPrices(7L, List.of()).isEmpty());
        verify(priceRepository, never()).save(any());
    }

    @Test
    void setPrices_rejectsDuplicateServices() {
        assertThrows(BadRequestException.class,
                () -> service.setPrices(7L, List.of(entry(100L, "100"), entry(100L, "200"))));
        verify(priceRepository, never()).save(any());
    }
}
