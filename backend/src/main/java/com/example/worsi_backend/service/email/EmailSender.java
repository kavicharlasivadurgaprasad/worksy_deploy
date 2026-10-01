package com.example.worsi_backend.service.email;

/**
 * Pluggable outgoing-email transport. Exactly one implementation is active, chosen by
 * app.mail.provider (see application.properties) - the same pattern as SmsSender. EmailService
 * only ever depends on this interface.
 */
public interface EmailSender {
    void send(String to, String subject, String textBody, String htmlBody);
}
