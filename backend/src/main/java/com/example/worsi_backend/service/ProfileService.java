package com.example.worsi_backend.service;

import com.example.worsi_backend.Entity.Address;
import com.example.worsi_backend.Entity.AddressLabel;
import com.example.worsi_backend.Entity.BookingStatus;
import com.example.worsi_backend.Entity.ProviderProfile;
import com.example.worsi_backend.Entity.Role;
import com.example.worsi_backend.Entity.ServiceCategory;
import com.example.worsi_backend.Entity.User;
import com.example.worsi_backend.Exception.BadRequestException;
import com.example.worsi_backend.Exception.ForbiddenException;
import com.example.worsi_backend.Exception.ImageStorageException;
import com.example.worsi_backend.Exception.ImageUploadException;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.dto.AddressResponse;
import com.example.worsi_backend.dto.ProfileResponse;
import com.example.worsi_backend.dto.ProviderProfileResponse;
import com.example.worsi_backend.dto.UpdateProfileRequest;
import com.example.worsi_backend.repository.AddressRepository;
import com.example.worsi_backend.repository.BookingRepository;
import com.example.worsi_backend.repository.ProviderProfileRepository;
import com.example.worsi_backend.repository.ServiceCategoryRepository;
import com.example.worsi_backend.repository.UserRepository;
import com.example.worsi_backend.storage.ImageStorage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Edit Profile for the signed-in user (customer or provider).
 *
 * Who is being edited is ALWAYS the authenticated user id passed in by the controller, never an id
 * from the request body or URL, so nobody can edit anyone else's profile.
 *
 * Transactions are programmatic (TransactionTemplate) on purpose: a phone-number change must verify
 * the OTP OUTSIDE the database transaction that applies the update, so the OTP's attempt counter is
 * committed even when the code is wrong (see OtpService#verifyOtp).
 */
@Service
public class ProfileService {

    /** Jobs in these states block a category change: they were booked for the old category. */
    private static final List<BookingStatus> ACTIVE_BOOKING_STATUSES =
            List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS);

    /** What a phone update will do. {@code newPhone == null} with {@code changed} means "remove". */
    record PhoneChange(boolean changed, String newPhone, boolean otpRequired) {
        static final PhoneChange NONE = new PhoneChange(false, null, false);
    }

    /** A stored profile picture ready to be streamed. */
    public record AvatarImage(Resource resource, String contentType) {}

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final AddressRepository addressRepository;
    private final BookingRepository bookingRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final ProviderStatsService providerStatsService;
    private final ProviderPricingService providerPricingService;
    private final OtpService otpService;
    private final ImageStorage imageStorage;
    private final BookingImageValidator imageValidator;
    private final TransactionTemplate tx;
    private final TransactionTemplate readOnlyTx;
    private final long avatarMaxBytes;

    public ProfileService(UserRepository userRepository,
                          ProviderProfileRepository providerProfileRepository,
                          AddressRepository addressRepository,
                          BookingRepository bookingRepository,
                          ServiceCategoryRepository serviceCategoryRepository,
                          ProviderStatsService providerStatsService,
                          ProviderPricingService providerPricingService,
                          OtpService otpService,
                          ImageStorage imageStorage,
                          BookingImageValidator imageValidator,
                          PlatformTransactionManager transactionManager,
                          @Value("${app.profile.avatar.max-bytes:2097152}") long avatarMaxBytes) {
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.addressRepository = addressRepository;
        this.bookingRepository = bookingRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.providerStatsService = providerStatsService;
        this.providerPricingService = providerPricingService;
        this.otpService = otpService;
        this.imageStorage = imageStorage;
        this.imageValidator = imageValidator;
        this.tx = new TransactionTemplate(transactionManager);
        this.readOnlyTx = new TransactionTemplate(transactionManager);
        this.readOnlyTx.setReadOnly(true);
        this.avatarMaxBytes = avatarMaxBytes;
    }

    // ------------------------------------------------------------------
    // Read
    // ------------------------------------------------------------------

    public ProfileResponse getMyProfile(Long userId) {
        return readOnlyTx.execute(status -> buildResponse(findUser(userId)));
    }

    // ------------------------------------------------------------------
    // Update
    // ------------------------------------------------------------------

    /** Not @Transactional itself: see the class comment. */
    public ProfileResponse updateMyProfile(Long userId, UpdateProfileRequest request) {
        User current = findUser(userId);

        // 1. Pure validation, nothing is changed yet.
        PhoneChange phone = planPhoneChange(current, request);

        // 2. A new phone number must be proven with an OTP sent to THAT number. The phone number is
        //    a sign-in identifier, so a stolen session alone must not be able to repoint it.
        if (phone.otpRequired()) {
            String otp = request.getPhoneOtp();
            if (otp == null || otp.isBlank()) {
                throw new BadRequestException("Enter the OTP sent to your new phone number to change it.");
            }
            otpService.verifyOtp(phone.newPhone(), otp);
        }

        // 3. Apply everything atomically: either all fields are saved or none.
        return tx.execute(status -> applyUpdate(userId, request, phone));
    }

    private ProfileResponse applyUpdate(Long userId, UpdateProfileRequest request, PhoneChange phone) {
        User user = findUser(userId);

        user.setName(request.getName().trim());

        if (phone.changed()) {
            if (phone.newPhone() != null && userRepository.existsByPhoneAndIdNot(phone.newPhone(), userId)) {
                throw new IllegalArgumentException("This phone number is already linked to another account");
            }
            user.setPhone(phone.newPhone());
            user.setPhoneVerified(phone.newPhone() != null); // only ever set after a successful OTP
        }

        if (request.getAddress() != null) {
            if (user.getRole() != Role.CUSTOMER) {
                throw new ForbiddenException("Address details can only be edited on a customer account");
            }
            applyCustomerAddress(user, request.getAddress());
        }

        if (request.getProvider() != null) {
            if (user.getRole() != Role.PROVIDER) {
                throw new ForbiddenException("Business details can only be edited on a provider account");
            }
            applyProviderDetails(user, request.getProvider());
        }

        userRepository.save(user);
        return buildResponse(user);
    }

    PhoneChange planPhoneChange(User user, UpdateProfileRequest request) {
        String requested = request.getPhone();
        if (requested == null) {
            return PhoneChange.NONE; // field omitted: leave the number alone
        }
        requested = requested.trim();
        String existing = user.getPhone();

        if (requested.isEmpty()) {
            if (existing == null || existing.isBlank()) {
                return PhoneChange.NONE;
            }
            boolean hasAnotherLogin = user.getPasswordHash() != null
                    || user.getGoogleId() != null
                    || user.getAppleId() != null;
            if (!hasAnotherLogin) {
                throw new BadRequestException("Your phone number is your only way to sign in, so it cannot be removed.");
            }
            return new PhoneChange(true, null, false);
        }

        if (requested.equals(existing)) {
            return PhoneChange.NONE;
        }
        if (userRepository.existsByPhoneAndIdNot(requested, user.getId())) {
            throw new IllegalArgumentException("This phone number is already linked to another account");
        }
        return new PhoneChange(true, requested, true);
    }

    /**
     * Updates the customer's default saved address (or creates one if they have none). If any booking
     * already points at that address row, it is NOT edited in place: bookings show their address live,
     * so editing it would silently rewrite where past and pending jobs happen. In that case the edited
     * address is saved as a new default and the old one stays as a normal saved address.
     */
    private void applyCustomerAddress(User user, UpdateProfileRequest.AddressPart a) {
        String street = a.getStreet().trim();
        String area = a.getArea().trim();
        String city = a.getCity().trim();
        String pincode = a.getPincode().trim();
        String state = cleanOrNull(a.getState());

        Address target = addressRepository.findFirstByUserIdAndDefaultAddressTrueOrderByIdAsc(user.getId())
                .or(() -> addressRepository.findFirstByUserIdOrderByIdAsc(user.getId()))
                .orElse(null);

        if (target == null) {
            Address created = new Address();
            created.setUser(user);
            created.setLabel(AddressLabel.HOME);
            fill(created, street, area, city, state, pincode);
            created.setDefaultAddress(true);
            addressRepository.save(created);
            return;
        }

        boolean unchanged = street.equals(target.getStreet()) && area.equals(target.getArea())
                && city.equals(target.getCity()) && pincode.equals(target.getPincode())
                && java.util.Objects.equals(state, target.getState());
        if (unchanged) {
            if (!target.isDefaultAddress()) {
                target.setDefaultAddress(true);
                addressRepository.save(target);
            }
            return;
        }

        if (bookingRepository.existsByAddressId(target.getId())) {
            Address copy = new Address();
            copy.setUser(user);
            copy.setLabel(target.getLabel());
            fill(copy, street, area, city, state, pincode);
            copy.setDefaultAddress(true);
            target.setDefaultAddress(false);
            addressRepository.save(target);
            addressRepository.save(copy);
        } else {
            fill(target, street, area, city, state, pincode);
            target.setDefaultAddress(true);
            addressRepository.save(target);
        }
    }

    private static void fill(Address address, String street, String area, String city, String state, String pincode) {
        address.setStreet(street);
        address.setArea(area);
        address.setCity(city);
        address.setState(state);
        address.setPincode(pincode);
    }

    /**
     * Updates ONLY the business details. Rating, completed jobs, verified/badge, availability text,
     * coordinates, service radius and accepting-bookings are never touched here.
     */
    private void applyProviderDetails(User user, UpdateProfileRequest.ProviderPart p) {
        ProviderProfile profile = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Provider profile not found. Finish setting up your provider profile first."));

        profile.setBusinessName(p.getBusinessName().trim());
        if (p.getTagline() != null) profile.setTagline(cleanOrNull(p.getTagline()));
        if (p.getDescription() != null) profile.setDescription(cleanOrNull(p.getDescription()));
        if (p.getResponseTime() != null) profile.setResponseTime(cleanOrNull(p.getResponseTime()));
        profile.setExperienceYears(p.getExperienceYears());

        applyCategory(profile, p.getCategory());
        applyServiceArea(profile, p.getServiceArea());

        providerProfileRepository.save(profile);
    }

    private void applyCategory(ProviderProfile profile, String requested) {
        if (requested == null || requested.isBlank()) return;
        String wanted = requested.trim();
        if (wanted.equalsIgnoreCase(profile.getCategory())) return;

        ServiceCategory category = serviceCategoryRepository.findByNameIgnoreCase(wanted)
                .orElseThrow(() -> new BadRequestException("Unknown service category: " + wanted));
        if (bookingRepository.existsByProviderIdAndStatusIn(profile.getId(), ACTIVE_BOOKING_STATUSES)) {
            throw new BadRequestException(
                    "You have pending, upcoming or ongoing jobs in your current category. "
                            + "Finish or cancel them before changing category.");
        }
        profile.setCategory(category.getName());
    }

    /** The readable service area must keep matching the saved coordinates, so it is locked once a location exists. */
    private void applyServiceArea(ProviderProfile profile, String requested) {
        if (requested == null) return;
        String cleaned = requested.trim();
        String current = profile.getServiceArea() == null ? "" : profile.getServiceArea().trim();
        if (cleaned.equals(current)) return;

        if (profile.hasLocation()) {
            throw new BadRequestException(
                    "Your service area is tied to your saved map location. Change it from "
                            + "\"Service location & availability\" so both stay in sync.");
        }
        profile.setServiceArea(cleaned.isEmpty() ? null : cleaned);
    }

    // ------------------------------------------------------------------
    // Profile picture
    // ------------------------------------------------------------------

    public ProfileResponse uploadAvatar(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ImageUploadException(HttpStatus.BAD_REQUEST, "Choose an image to upload");
        }
        findUser(userId); // 404 early for a deleted account

        // Type is decided from the file's magic bytes, not the filename / Content-Type the browser sent.
        List<BookingImageValidator.ValidatedImage> validated = imageValidator.validate(List.of(file));
        if (validated.isEmpty()) {
            throw new ImageUploadException(HttpStatus.BAD_REQUEST, "Choose an image to upload");
        }
        BookingImageValidator.ValidatedImage image = validated.get(0);
        if (image.data().length > avatarMaxBytes) {
            throw new ImageUploadException(HttpStatus.PAYLOAD_TOO_LARGE,
                    "Profile pictures must be " + (avatarMaxBytes / (1024 * 1024)) + " MB or smaller");
        }

        // The key is generated here, never taken from the client.
        String key = "avatars/" + userId + "/" + UUID.randomUUID() + "." + image.extension();
        try {
            imageStorage.store(key, image.data(), image.contentType());
        } catch (IOException e) {
            throw new ImageStorageException("Could not save your picture. Please try again.", e);
        }

        String oldKey;
        try {
            oldKey = tx.execute(status -> {
                User user = findUser(userId);
                String previous = user.getAvatarStorageKey();
                user.setAvatarStorageKey(key);
                // ?v= changes on every upload so browsers never show a stale picture.
                user.setAvatarUrl("/users/" + userId + "/avatar?v=" + System.currentTimeMillis());
                userRepository.saveAndFlush(user);
                return previous;
            });
        } catch (RuntimeException e) {
            imageStorage.deleteQuietly(key); // do not leave an orphan file behind
            throw e;
        }
        if (oldKey != null) imageStorage.deleteQuietly(oldKey);
        return getMyProfile(userId);
    }

    public ProfileResponse removeAvatar(Long userId) {
        String oldKey = tx.execute(status -> {
            User user = findUser(userId);
            String previous = user.getAvatarStorageKey();
            user.setAvatarStorageKey(null);
            user.setAvatarUrl(null);
            userRepository.save(user);
            return previous;
        });
        if (oldKey != null) imageStorage.deleteQuietly(oldKey);
        return getMyProfile(userId);
    }

    /** Public read of a user's profile picture (it is shown to booking counterparties and in chat). */
    public AvatarImage loadAvatar(Long userId) {
        String key = readOnlyTx.execute(status -> findUser(userId).getAvatarStorageKey());
        if (key == null) {
            throw new ResourceNotFoundException("No profile picture");
        }
        try {
            return new AvatarImage(imageStorage.load(key), contentTypeOf(key));
        } catch (FileNotFoundException e) {
            throw new ResourceNotFoundException("Profile picture is no longer available");
        } catch (IOException e) {
            throw new ImageStorageException("Could not read the picture. Please try again.", e);
        }
    }

    private static String contentTypeOf(String key) {
        String k = key.toLowerCase(Locale.ROOT);
        if (k.endsWith(".png")) return "image/png";
        if (k.endsWith(".webp")) return "image/webp";
        return "image/jpeg";
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private ProfileResponse buildResponse(User user) {
        AddressResponse address = null;
        ProviderProfileResponse provider = null;
        if (user.getRole() == Role.CUSTOMER) {
            address = addressRepository.findFirstByUserIdAndDefaultAddressTrueOrderByIdAsc(user.getId())
                    .or(() -> addressRepository.findFirstByUserIdOrderByIdAsc(user.getId()))
                    .map(AddressResponse::new)
                    .orElse(null);
        } else if (user.getRole() == Role.PROVIDER) {
            provider = providerProfileRepository.findByUserId(user.getId())
                    .map(p -> new ProviderProfileResponse(p, providerStatsService.statsFor(p.getId()), providerPricingService.offersFor(p.getId())))
                    .orElse(null);
        }
        return new ProfileResponse(user, address, provider);
    }

    private static String cleanOrNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
