package com.example.worsi_backend.service;

import com.example.worsi_backend.dto.GoogleAuthRequest;
import com.example.worsi_backend.dto.LoginRequest;
import com.example.worsi_backend.dto.LoginResponse;
import com.example.worsi_backend.dto.PhoneOtpVerifyRequest;
import com.example.worsi_backend.dto.RegisterRequest;
import com.example.worsi_backend.dto.UserResponse;
import com.example.worsi_backend.Entity.AuthProvider;
import com.example.worsi_backend.Entity.Role;
import com.example.worsi_backend.Entity.User;
import com.example.worsi_backend.Exception.BadRequestException;
import com.example.worsi_backend.Exception.UnauthorizedException;
import com.example.worsi_backend.repository.UserRepository;
import com.example.worsi_backend.security.JwtUtil;
import com.example.worsi_backend.service.oidc.OidcIdentity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    private final GoogleAuthService googleAuthService;

    public AuthService(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        JwtUtil jwtUtil,
                        OtpService otpService,
                        GoogleAuthService googleAuthService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.otpService = otpService;
        this.googleAuthService = googleAuthService;
    }

    // ------------------------------------------------------------------
    // Email + password (unchanged behaviour)
    // ------------------------------------------------------------------

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setAuthProvider(AuthProvider.LOCAL);

        User savedUser = userRepository.save(user);

        return new UserResponse(savedUser);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        return issueSession(user);
    }

    // ------------------------------------------------------------------
    // Phone (OTP)
    // ------------------------------------------------------------------

    public void sendPhoneOtp(String phone) {
        otpService.sendOtp(phone);
    }

    @Transactional
    public LoginResponse loginOrRegisterWithPhone(PhoneOtpVerifyRequest request) {
        otpService.verifyOtp(request.getPhone(), request.getOtp());

        User user = userRepository.findByPhone(request.getPhone()).orElse(null);
        if (user == null) {
            user = new User();
            user.setName("Worksy User"); // phone-only signups have no name source; the profile can be edited later
            user.setPhone(request.getPhone());
            user.setRole(request.getRole() != null ? request.getRole() : Role.CUSTOMER);
            user.setAuthProvider(AuthProvider.PHONE);
        }
        user.setPhoneVerified(true);
        user = userRepository.save(user);

        return issueSession(user);
    }

    // ------------------------------------------------------------------
    // Google
    // ------------------------------------------------------------------

    @Transactional
    public LoginResponse loginOrRegisterWithGoogle(GoogleAuthRequest request) {
        OidcIdentity identity = googleAuthService.verify(request.getIdToken());
        User user = findOrCreateOAuthUser(
                AuthProvider.GOOGLE,
                identity,
                request.getRole(),
                userRepository::findByGoogleId,
                User::setGoogleId);
        return issueSession(user);
    }

    // ------------------------------------------------------------------
    // Shared OAuth find-or-create / account-linking logic
    // ------------------------------------------------------------------

    /**
     * Finds the user for this provider identity, in order:
     *   1) an account already linked to this provider's subject id,
     *   2) an existing account with the same, provider-verified email (linked in place - this is
     *      what stops the same person ending up with two accounts when they first used email or a
     *      different provider and later sign in with this one),
     *   3) otherwise a brand-new account.
     * Never overwrites an existing user's role, password or already-set profile fields.
     */
    private User findOrCreateOAuthUser(AuthProvider provider,
                                        OidcIdentity identity,
                                        Role requestedRole,
                                        java.util.function.Function<String, java.util.Optional<User>> findByProviderId,
                                        java.util.function.BiConsumer<User, String> providerIdSetter) {

        User existing = findByProviderId.apply(identity.subject()).orElse(null);
        if (existing != null) {
            return existing;
        }

        if (identity.email() != null && identity.emailVerified()) {
            User byEmail = userRepository.findByEmail(identity.email()).orElse(null);
            if (byEmail != null) {
                providerIdSetter.accept(byEmail, identity.subject());
                if (!byEmail.isEmailVerified()) {
                    byEmail.setEmailVerified(true);
                }
                return userRepository.save(byEmail);
            }
        }

        User created = new User();
        created.setAuthProvider(provider);
        providerIdSetter.accept(created, identity.subject());
        created.setRole(requestedRole != null ? requestedRole : Role.CUSTOMER);

        if (identity.email() != null) {
            if (userRepository.existsByEmail(identity.email())) {
                // Email belongs to someone else's unverified claim on this provider's side; don't
                // silently attach to a stranger's account.
                throw new BadRequestException("An account with this email already exists. Please log in with email/password and link this provider from your profile instead.");
            }
            created.setEmail(identity.email());
            created.setEmailVerified(identity.emailVerified());
        }

        String name = identity.name();
        created.setName((name != null && !name.isBlank()) ? name
                : (identity.email() != null ? identity.email().split("@")[0] : "Worksy User"));

        return userRepository.save(created);
    }

    // ------------------------------------------------------------------

    private LoginResponse issueSession(User user) {
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new LoginResponse(token, new UserResponse(user));
    }
}
