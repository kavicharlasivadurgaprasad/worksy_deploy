package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.Role;
import com.example.worsi_backend.Entity.User;
import lombok.Getter;

/**
 * The signed-in user's own editable profile. Never contains the password hash, tokens,
 * auth-provider ids, storage keys or provider coordinates.
 *
 * Customers get {@code address} (their default saved address, or null); providers get
 * {@code provider} (their provider_profiles row, or null until onboarding is finished).
 */
@Getter
public class ProfileResponse {

    private final Long id;
    private final Role role;
    private final String name;
    /** Read-only here: the email is the login identifier. */
    private final String email;
    private final String phone;
    private final boolean phoneVerified;
    /** Path relative to the API base (e.g. /users/7/avatar?v=...), or null when no picture is set. */
    private final String avatarUrl;
    private final AddressResponse address;
    private final ProviderProfileResponse provider;

    public ProfileResponse(User user, AddressResponse address, ProviderProfileResponse provider) {
        this.id = user.getId();
        this.role = user.getRole();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.phoneVerified = user.isPhoneVerified();
        this.avatarUrl = user.getAvatarUrl();
        this.address = address;
        this.provider = provider;
    }
}
