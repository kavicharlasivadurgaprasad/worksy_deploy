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

    // Only used if this Google account has no existing/linked user yet. Defaults to CUSTOMER.
    private Role role;
}
