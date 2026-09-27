package com.example.worsi_backend.service.sms;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * Local-development fallback: logs the OTP to the backend console/log instead of sending a real
 * SMS. Active whenever app.sms.provider is unset or "console" (the default). This must never be
 * the active provider in production - point app.sms.provider at a real implementation and set its
 * required environment variables before deploying.
 */
@Service
@ConditionalOnProperty(name = "app.sms.provider", havingValue = "console", matchIfMissing = true)
public class ConsoleSmsSender implements SmsSender {

    private static final Logger log = LoggerFactory.getLogger(ConsoleSmsSender.class);

    @Override
    public void send(String phoneNumber, String message) {
        log.info("[DEV ONLY - no SMS provider configured] OTP for {}: {}", phoneNumber, message);
    }
}
