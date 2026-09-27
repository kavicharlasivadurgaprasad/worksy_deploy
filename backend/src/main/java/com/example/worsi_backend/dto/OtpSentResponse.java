package com.example.worsi_backend.dto;

import lombok.Getter;

/** Confirms an OTP was sent without ever revealing the code itself. */
@Getter
public class OtpSentResponse {
    private final String message;
    private final int expiresInSeconds;
    private final int resendCooldownSeconds;

    public OtpSentResponse(String message, int expiresInSeconds, int resendCooldownSeconds) {
        this.message = message;
        this.expiresInSeconds = expiresInSeconds;
        this.resendCooldownSeconds = resendCooldownSeconds;
    }
}
