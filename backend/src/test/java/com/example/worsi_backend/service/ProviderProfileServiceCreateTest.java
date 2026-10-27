package com.example.worsi_backend.service;

import com.example.worsi_backend.Entity.ProviderProfile;
import com.example.worsi_backend.Entity.User;
import com.example.worsi_backend.Exception.BadRequestException;
import com.example.worsi_backend.dto.ProviderProfileRequest;
import com.example.worsi_backend.dto.ProviderServicePriceEntry;
import com.example.worsi_backend.repository.ProviderProfileRepository;
import com.example.worsi_backend.repository.ServiceCategoryRepository;
import com.example.worsi_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Creating a provider profile with (and without) prices entered during onboarding. */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProviderProfileServiceCreateTest {

    @Mock ProviderProfileRepository providerProfileRepository;
    @Mock UserRepository userRepository;
    @Mock ServiceCategoryRepository serviceCategoryRepository;
    @Mock ProviderStatsService providerStatsService;
    @Mock ProviderPricingService providerPricingService;

    private ProviderProfileService service;

    @BeforeEach
    void setUp() {
        service = new ProviderProfileService(providerProfileRepository, userRepository,
                serviceCategoryRepository, providerStatsService, providerPricingService);

        User user = new User();
        user.setId(7L);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(providerProfileRepository.findByUserId(7L)).thenReturn(Optional.empty());
        when(providerProfileRepository.save(any(ProviderProfile.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private static ProviderProfileRequest request(List<ProviderServicePriceEntry> prices) {
        ProviderProfileRequest r = new ProviderProfileRequest();
        r.setBusinessName("Ravi Plumbing");
        r.setCategory("Plumbing");
        r.setServicePrices(prices);
        return r;
    }

    @Test
    void createProfile_savesTheEnteredPricesWithTheProfile() {
        ProviderServicePriceEntry e = new ProviderServicePriceEntry();
        e.setServiceId(100L);
        e.setPrice(new BigDecimal("350"));

        service.createProfile(7L, request(List.of(e)));

        verify(providerProfileRepository).save(any(ProviderProfile.class));
        verify(providerPricingService).setPrices(any(ProviderProfile.class), anyList());
    }

    @Test
    void createProfile_withoutPrices_savesNoPriceAtAll() {
        service.createProfile(7L, request(null));

        verify(providerProfileRepository).save(any(ProviderProfile.class));
        verify(providerPricingService, never()).setPrices(any(ProviderProfile.class), anyList());
    }

    @Test
    void createProfile_invalidPriceFailsTheWholeRequest() {
        when(providerPricingService.setPrices(any(ProviderProfile.class), anyList()))
                .thenThrow(new BadRequestException("Price must be greater than 0"));
        ProviderServicePriceEntry e = new ProviderServicePriceEntry();
        e.setServiceId(100L);
        e.setPrice(new BigDecimal("-1"));

        assertThrows(BadRequestException.class, () -> service.createProfile(7L, request(List.of(e))));
    }
}
