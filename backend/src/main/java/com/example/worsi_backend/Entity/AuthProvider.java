package com.example.worsi_backend.Entity;

/**
 * How the user first authenticated. Informational only - after registration a user can still
 * log in through any linked method (see User#googleId / User#appleId / User#phone). All methods
 * ultimately issue the same application JWT (see AuthService).
 */
public enum AuthProvider {
    LOCAL,
    GOOGLE,
    APPLE,
    PHONE
}
