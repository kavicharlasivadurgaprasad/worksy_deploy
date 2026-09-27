package com.example.worsi_backend.Exception;

/** OTP request/verify rate limits exceeded. Mapped to HTTP 429 by GlobalExceptionHandler. */
public class TooManyRequestsException extends RuntimeException {
    public TooManyRequestsException(String message) {
        super(message);
    }
}
