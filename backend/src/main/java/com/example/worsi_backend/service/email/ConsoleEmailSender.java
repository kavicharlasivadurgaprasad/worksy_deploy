package com.example.worsi_backend.service.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * LOCAL DEVELOPMENT ONLY. Logs the email body (which contains the reset link) instead of sending
 * it. Active when app.mail.provider is unset or "console". Never use in production: set
 * MAIL_PROVIDER=smtp and the SPRING_MAIL_* variables instead.
 */
@Service
@ConditionalOnProperty(name = "app.mail.provider", havingValue = "console", matchIfMissing = true)
public class ConsoleEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(ConsoleEmailSender.class);

    public ConsoleEmailSender() {
        log.warn("app.mail.provider=console: emails are only LOGGED, not sent. Set MAIL_PROVIDER=smtp for real delivery.");
    }

    @Override
    public void send(String to, String subject, String textBody, String htmlBody) {
        log.info("[DEV ONLY - email not actually sent]\nTo: {}\nSubject: {}\n{}", to, subject, textBody);
    }
}
