package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleAuthRequest {

    // The ID token returned by Google Identity Services on the frontend (a signed JWT),
    // NOT an access token or auth code. Verified server-side in GoogleAuthService.
    @NotBlank(message = "idToken is required")
    private String idToken;

    // The role chosen on the Customer/Provider login screen. Send it on every Google login.
    // - New Google account: the account is created with this role (400 if omitted).
    // - Existing account: its stored role is never changed; a different requested role is rejected (403).
    private Role role;
}
