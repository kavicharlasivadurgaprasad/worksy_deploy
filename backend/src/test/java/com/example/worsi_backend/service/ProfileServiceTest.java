package com.example.worsi_backend.service;

import com.example.worsi_backend.Entity.Address;
import com.example.worsi_backend.Entity.AddressLabel;
import com.example.worsi_backend.Entity.AuthProvider;
import com.example.worsi_backend.Entity.ProviderProfile;
import com.example.worsi_backend.Entity.Role;
import com.example.worsi_backend.Entity.ServiceCategory;
import com.example.worsi_backend.Entity.User;
import com.example.worsi_backend.Exception.BadRequestException;
import com.example.worsi_backend.Exception.ForbiddenException;
import com.example.worsi_backend.Exception.ImageUploadException;
import com.example.worsi_backend.Exception.UnauthorizedException;
import com.example.worsi_backend.dto.ProfileResponse;
import com.example.worsi_backend.dto.UpdateProfileRequest;
import com.example.worsi_backend.repository.AddressRepository;
import com.example.worsi_backend.repository.BookingRepository;
import com.example.worsi_backend.repository.ProviderProfileRepository;
import com.example.worsi_backend.repository.ServiceCategoryRepository;
import com.example.worsi_backend.repository.UserRepository;
import com.example.worsi_backend.storage.ImageStorage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProfileServiceTest {

    @Mock UserRepository userRepository;
    @Mock ProviderProfileRepository providerProfileRepository;
    @Mock AddressRepository addressRepository;
    @Mock BookingRepository bookingRepository;
    @Mock ServiceCategoryRepository serviceCategoryRepository;
    @Mock ProviderStatsService providerStatsService;
    @Mock ProviderPricingService providerPricingService;
    @Mock OtpService otpService;
    @Mock ImageStorage imageStorage;

    private BookingImageValidator validator;
    private ProfileService service;

    private User customer;
    private User provider;
    private ProviderProfile profile;

    @BeforeEach
    void setUp() {
        validator = new BookingImageValidator();
        ReflectionTestUtils.setField(validator, "maxCount", 5);
        ReflectionTestUtils.setField(validator, "maxBytes", 5L * 1024 * 1024);

        service = new ProfileService(userRepository, providerProfileRepository, addressRepository,
                bookingRepository, serviceCategoryRepository, providerStatsService, providerPricingService, otpService, imageStorage, validator,
                mock(PlatformTransactionManager.class), 2L * 1024 * 1024);

        customer = new User();
        customer.setId(1L);
        customer.setName("Asha Rao");
        customer.setEmail("asha@example.com");
        customer.setPasswordHash("hash");
        customer.setRole(Role.CUSTOMER);
        customer.setAuthProvider(AuthProvider.LOCAL);

        provider = new User();
        provider.setId(2L);
        provider.setName("Ravi Kumar");
        provider.setEmail("ravi@example.com");
        provider.setPasswordHash("hash");
        provider.setRole(Role.PROVIDER);
        provider.setAuthProvider(AuthProvider.LOCAL);

        profile = new ProviderProfile();
        profile.setId(20L);
        profile.setUser(provider);
        profile.setBusinessName("Ravi Electricals");
        profile.setCategory("Electrician");
        profile.setRating(4.5);
        profile.setCompletedJobs(12);
        profile.setVerified(true);
        profile.setAcceptingBookings(true);
        profile.setLatitude(13.0827);
        profile.setLongitude(80.2707);
        profile.setServiceArea("Chennai");

        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(userRepository.findById(2L)).thenReturn(Optional.of(provider));
        when(providerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(profile));
    }

    private static UpdateProfileRequest request(String name) {
        UpdateProfileRequest r = new UpdateProfileRequest();
        r.setName(name);
        return r;
    }

    private static UpdateProfileRequest.AddressPart address(String street) {
        UpdateProfileRequest.AddressPart a = new UpdateProfileRequest.AddressPart();
        a.setStreet(street);
        a.setArea("Indiranagar");
        a.setCity("Bengaluru");
        a.setState("Karnataka");
        a.setPincode("560038");
        return a;
    }

    private UpdateProfileRequest.ProviderPart providerPart() {
        UpdateProfileRequest.ProviderPart p = new UpdateProfileRequest.ProviderPart();
        p.setBusinessName("Ravi Electricals & Co");
        p.setTagline("Fast fixes");
        p.setDescription("Licensed electrician");
        p.setCategory("Electrician");
        p.setExperienceYears(8);
        p.setResponseTime("30 mins");
        p.setServiceArea("Chennai");
        return p;
    }

    // ---------------- name / protected fields ----------------

    @Test
    void updatesNameTrimmedAndLeavesProtectedFieldsAlone() {
        ProfileResponse res = service.updateMyProfile(1L, request("  Asha R  "));

        assertEquals("Asha R", customer.getName());
        assertEquals("Asha R", res.getName());
        assertEquals(Role.CUSTOMER, customer.getRole());
        assertEquals("asha@example.com", customer.getEmail());
        assertEquals("hash", customer.getPasswordHash());
        verify(userRepository).save(customer);
    }

    @Test
    void customerCannotEditBusinessDetails() {
        UpdateProfileRequest r = request("Asha Rao");
        r.setProvider(providerPart());
        assertThrows(ForbiddenException.class, () -> service.updateMyProfile(1L, r));
        verify(providerProfileRepository, never()).save(any());
    }

    @Test
    void providerCannotEditCustomerAddress() {
        UpdateProfileRequest r = request("Ravi Kumar");
        r.setAddress(address("12 MG Road"));
        assertThrows(ForbiddenException.class, () -> service.updateMyProfile(2L, r));
        verify(addressRepository, never()).save(any());
    }

    // ---------------- phone ----------------

    @Test
    void phoneChangeWithoutOtpIsRejectedAndNothingIsSaved() {
        UpdateProfileRequest r = request("Asha Rao");
        r.setPhone("+919876543210");
        assertThrows(BadRequestException.class, () -> service.updateMyProfile(1L, r));
        assertNull(customer.getPhone());
        verify(userRepository, never()).save(any());
    }

    @Test
    void phoneChangeWithWrongOtpIsRejectedAndNothingIsSaved() {
        doThrow(new UnauthorizedException("Invalid OTP.")).when(otpService).verifyOtp("+919876543210", "111111");
        UpdateProfileRequest r = request("Asha Rao");
        r.setPhone("+919876543210");
        r.setPhoneOtp("111111");

        assertThrows(UnauthorizedException.class, () -> service.updateMyProfile(1L, r));
        assertNull(customer.getPhone());
        verify(userRepository, never()).save(any());
    }

    @Test
    void phoneChangeWithValidOtpSavesAndMarksVerified() {
        UpdateProfileRequest r = request("Asha Rao");
        r.setPhone("+919876543210");
        r.setPhoneOtp("123456");

        ProfileResponse res = service.updateMyProfile(1L, r);

        verify(otpService).verifyOtp("+919876543210", "123456");
        assertEquals("+919876543210", customer.getPhone());
        assertTrue(customer.isPhoneVerified());
        assertEquals("+919876543210", res.getPhone());
    }

    @Test
    void phoneAlreadyUsedByAnotherAccountIsAConflictAndNoOtpIsConsumed() {
        when(userRepository.existsByPhoneAndIdNot("+919876543210", 1L)).thenReturn(true);
        UpdateProfileRequest r = request("Asha Rao");
        r.setPhone("+919876543210");
        r.setPhoneOtp("123456");

        assertThrows(IllegalArgumentException.class, () -> service.updateMyProfile(1L, r));
        verify(otpService, never()).verifyOtp(anyString(), anyString());
    }

    @Test
    void unchangedOrOmittedPhoneNeedsNoOtp() {
        customer.setPhone("+919876543210");
        customer.setPhoneVerified(true);

        UpdateProfileRequest same = request("Asha Rao");
        same.setPhone("+919876543210");
        service.updateMyProfile(1L, same);
        service.updateMyProfile(1L, request("Asha Rao")); // phone omitted

        verify(otpService, never()).verifyOtp(anyString(), anyString());
        assertEquals("+919876543210", customer.getPhone());
    }

    @Test
    void phoneCannotBeRemovedWhenItIsTheOnlyLogin() {
        customer.setPasswordHash(null);
        customer.setPhone("+919876543210");
        customer.setPhoneVerified(true);
        UpdateProfileRequest r = request("Asha Rao");
        r.setPhone("");

        assertThrows(BadRequestException.class, () -> service.updateMyProfile(1L, r));
        assertEquals("+919876543210", customer.getPhone());
    }

    // ---------------- customer address ----------------

    @Test
    void addressWithNoExistingRowCreatesDefaultHomeAddress() {
        UpdateProfileRequest r = request("Asha Rao");
        r.setAddress(address("12 MG Road"));

        service.updateMyProfile(1L, r);

        ArgumentCaptor<Address> captor = ArgumentCaptor.forClass(Address.class);
        verify(addressRepository).save(captor.capture());
        Address saved = captor.getValue();
        assertEquals("12 MG Road", saved.getStreet());
        assertEquals("Karnataka", saved.getState());
        assertEquals(AddressLabel.HOME, saved.getLabel());
        assertTrue(saved.isDefaultAddress());
        assertEquals(customer, saved.getUser());
    }

    private Address existingAddress() {
        Address a = new Address();
        a.setId(5L);
        a.setUser(customer);
        a.setLabel(AddressLabel.OFFICE);
        a.setStreet("Old Street");
        a.setArea("Old Area");
        a.setCity("Old City");
        a.setPincode("560001");
        a.setDefaultAddress(true);
        when(addressRepository.findFirstByUserIdAndDefaultAddressTrueOrderByIdAsc(1L)).thenReturn(Optional.of(a));
        return a;
    }

    @Test
    void addressNotUsedByAnyBookingIsUpdatedInPlace() {
        Address existing = existingAddress();
        when(bookingRepository.existsByAddressId(5L)).thenReturn(false);
        UpdateProfileRequest r = request("Asha Rao");
        r.setAddress(address("12 MG Road"));

        service.updateMyProfile(1L, r);

        assertEquals("12 MG Road", existing.getStreet());
        assertEquals("560038", existing.getPincode());
        assertEquals(AddressLabel.OFFICE, existing.getLabel());
        verify(addressRepository).save(existing);
    }

    @Test
    void addressUsedByABookingIsCopiedSoBookingHistoryDoesNotChange() {
        Address existing = existingAddress();
        when(bookingRepository.existsByAddressId(5L)).thenReturn(true);
        UpdateProfileRequest r = request("Asha Rao");
        r.setAddress(address("12 MG Road"));

        service.updateMyProfile(1L, r);

        assertEquals("Old Street", existing.getStreet());   // original row untouched
        assertFalse(existing.isDefaultAddress());
        ArgumentCaptor<Address> captor = ArgumentCaptor.forClass(Address.class);
        verify(addressRepository, org.mockito.Mockito.times(2)).save(captor.capture());
        Address copy = captor.getAllValues().stream().filter(a -> a != existing).findFirst().orElseThrow();
        assertEquals("12 MG Road", copy.getStreet());
        assertTrue(copy.isDefaultAddress());
    }

    // ---------------- provider details ----------------

    @Test
    void providerDetailsUpdateDoesNotTouchRatingVerifiedAvailabilityOrLocation() {
        UpdateProfileRequest r = request("Ravi Kumar");
        r.setProvider(providerPart());

        service.updateMyProfile(2L, r);

        assertEquals("Ravi Electricals & Co", profile.getBusinessName());
        assertEquals("Licensed electrician", profile.getDescription());
        assertEquals(8, profile.getExperienceYears());
        assertEquals(4.5, profile.getRating());
        assertEquals(12, profile.getCompletedJobs());
        assertTrue(profile.isVerified());
        assertTrue(profile.isAcceptingBookings());
        assertEquals(13.0827, profile.getLatitude());
        assertEquals(80.2707, profile.getLongitude());
        assertEquals(Role.PROVIDER, provider.getRole());
    }

    @Test
    void categoryChangeIsBlockedWhileThereAreActiveJobs() {
        when(serviceCategoryRepository.findByNameIgnoreCase("Plumbing"))
                .thenReturn(Optional.of(category("Plumbing")));
        when(bookingRepository.existsByProviderIdAndStatusIn(eq(20L), anyCollection())).thenReturn(true);
        UpdateProfileRequest r = request("Ravi Kumar");
        UpdateProfileRequest.ProviderPart p = providerPart();
        p.setCategory("Plumbing");
        r.setProvider(p);

        assertThrows(BadRequestException.class, () -> service.updateMyProfile(2L, r));
        assertEquals("Electrician", profile.getCategory());
    }

    @Test
    void categoryChangeIsAllowedWithoutActiveJobsAndUsesTheCanonicalName() {
        when(serviceCategoryRepository.findByNameIgnoreCase("plumbing"))
                .thenReturn(Optional.of(category("Plumbing")));
        when(bookingRepository.existsByProviderIdAndStatusIn(eq(20L), anyCollection())).thenReturn(false);
        UpdateProfileRequest r = request("Ravi Kumar");
        UpdateProfileRequest.ProviderPart p = providerPart();
        p.setCategory("plumbing");
        r.setProvider(p);

        service.updateMyProfile(2L, r);

        assertEquals("Plumbing", profile.getCategory());
    }

    @Test
    void unknownCategoryIsRejected() {
        when(serviceCategoryRepository.findByNameIgnoreCase(anyString())).thenReturn(Optional.empty());
        UpdateProfileRequest r = request("Ravi Kumar");
        UpdateProfileRequest.ProviderPart p = providerPart();
        p.setCategory("Astrology");
        r.setProvider(p);

        assertThrows(BadRequestException.class, () -> service.updateMyProfile(2L, r));
    }

    @Test
    void serviceAreaIsLockedWhileAMapLocationIsSaved() {
        UpdateProfileRequest r = request("Ravi Kumar");
        UpdateProfileRequest.ProviderPart p = providerPart();
        p.setServiceArea("Somewhere else");
        r.setProvider(p);

        assertThrows(BadRequestException.class, () -> service.updateMyProfile(2L, r));
        assertEquals("Chennai", profile.getServiceArea());
    }

    @Test
    void serviceAreaIsEditableWhenNoLocationIsSaved() {
        profile.setLatitude(null);
        profile.setLongitude(null);
        UpdateProfileRequest r = request("Ravi Kumar");
        UpdateProfileRequest.ProviderPart p = providerPart();
        p.setServiceArea("Madanapalle");
        r.setProvider(p);

        service.updateMyProfile(2L, r);

        assertEquals("Madanapalle", profile.getServiceArea());
        assertNull(profile.getLatitude());
    }

    // ---------------- avatar ----------------

    private static byte[] pngBytes(int total) {
        byte[] data = new byte[total];
        byte[] sig = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};
        System.arraycopy(sig, 0, data, 0, sig.length);
        return data;
    }

    @Test
    void validPngIsStoredUnderAServerGeneratedKey() throws Exception {
        MockMultipartFile file = new MockMultipartFile("image", "me.png", "image/png", pngBytes(2048));

        service.uploadAvatar(1L, file);

        ArgumentCaptor<String> key = ArgumentCaptor.forClass(String.class);
        verify(imageStorage).store(key.capture(), any(byte[].class), eq("image/png"));
        assertTrue(key.getValue().startsWith("avatars/1/"));
        assertTrue(key.getValue().endsWith(".png"));
        assertEquals(key.getValue(), customer.getAvatarStorageKey());
        assertTrue(customer.getAvatarUrl().startsWith("/users/1/avatar?v="));
    }

    @Test
    void fileThatIsNotAnImageIsRejectedEvenWithAnImageName() throws Exception {
        MockMultipartFile file = new MockMultipartFile("image", "me.png", "image/png", "not an image at all".getBytes());

        ImageUploadException ex = assertThrows(ImageUploadException.class, () -> service.uploadAvatar(1L, file));
        assertEquals(HttpStatus.UNSUPPORTED_MEDIA_TYPE, ex.getStatus());
        verify(imageStorage, never()).store(anyString(), any(byte[].class), anyString());
    }

    @Test
    void avatarLargerThanTheAvatarLimitIsRejected() throws Exception {
        MockMultipartFile file = new MockMultipartFile("image", "big.png", "image/png", pngBytes(3 * 1024 * 1024));

        ImageUploadException ex = assertThrows(ImageUploadException.class, () -> service.uploadAvatar(1L, file));
        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE, ex.getStatus());
        verify(imageStorage, never()).store(anyString(), any(byte[].class), anyString());
    }

    @Test
    void replacingAnAvatarDeletesTheOldFile() throws Exception {
        customer.setAvatarStorageKey("avatars/1/old.png");
        MockMultipartFile file = new MockMultipartFile("image", "me.png", "image/png", pngBytes(2048));

        service.uploadAvatar(1L, file);

        verify(imageStorage).deleteQuietly("avatars/1/old.png");
    }

    @Test
    void removingAnAvatarClearsBothFieldsAndDeletesTheFile() {
        customer.setAvatarStorageKey("avatars/1/old.png");
        customer.setAvatarUrl("/users/1/avatar?v=1");

        service.removeAvatar(1L);

        assertNull(customer.getAvatarStorageKey());
        assertNull(customer.getAvatarUrl());
        verify(imageStorage).deleteQuietly("avatars/1/old.png");
    }

    private static ServiceCategory category(String name) {
        ServiceCategory c = new ServiceCategory();
        c.setName(name);
        return c;
    }
}
