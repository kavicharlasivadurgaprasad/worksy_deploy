package com.example.worsi_backend.service;

import com.example.worsi_backend.service.oidc.OidcIdentity;
import com.example.worsi_backend.service.oidc.OidcTokenVerifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

/** Verifies "Sign in with Google" ID tokens. See OidcTokenVerifier for how verification works. */
@Service
public class GoogleAuthService {

    private final OidcTokenVerifier verifier;

    public GoogleAuthService(@Value("${app.oauth.google.client-id:}") String clientId) {
        this.verifier = (clientId == null || clientId.isBlank())
                ? null
                : new OidcTokenVerifier(
                        "https://www.googleapis.com/oauth2/v3/certs",
                        List.of("https://accounts.google.com", "accounts.google.com"),
                        clientId,
                        "Google");
    }

    public OidcIdentity verify(String idToken) {
        if (verifier == null) {
            throw new IllegalStateException("Google Sign-In is not configured on the server. Set GOOGLE_CLIENT_ID.");
        }
        return verifier.verify(idToken);
    }
}
