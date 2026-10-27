package com.example.worsi_backend.Exception;

/** The geocoding provider could not be reached or returned an unusable answer (mapped to HTTP 503). */
public class GeocodingUnavailableException extends RuntimeException {
    public GeocodingUnavailableException(String message) {
        super(message);
    }

    public GeocodingUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
