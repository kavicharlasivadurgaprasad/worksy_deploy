package com.example.worsi_backend.service.oidc;

/** The verified identity extracted from a provider's (e.g. Google) ID token, after signature verification. */
public record OidcIdentity(String subject, String email, boolean emailVerified, String name) {
}
