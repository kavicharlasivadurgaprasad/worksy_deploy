package com.example.worsi_backend.service.email;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

/**
 * Real delivery through Spring Mail / any SMTP server. Active when app.mail.provider=smtp.
 * Credentials are never in code or in application.properties: Spring Boot reads them from the
 * SPRING_MAIL_HOST / SPRING_MAIL_PORT / SPRING_MAIL_USERNAME / SPRING_MAIL_PASSWORD env vars.
 */
@Service
@ConditionalOnProperty(name = "app.mail.provider", havingValue = "smtp")
public class SmtpEmailSender implements EmailSender {

    private final JavaMailSender mailSender;
    private final String from;

    public SmtpEmailSender(ObjectProvider<JavaMailSender> mailSenderProvider,
                            @Value("${app.mail.from}") String from) {
        // JavaMailSender only exists when spring.mail.host is set - fail fast with a clear reason.
        this.mailSender = mailSenderProvider.getIfAvailable();
        if (this.mailSender == null) {
            throw new IllegalStateException(
                    "app.mail.provider=smtp but no JavaMailSender is configured. Set SPRING_MAIL_HOST "
                            + "(and SPRING_MAIL_PORT / SPRING_MAIL_USERNAME / SPRING_MAIL_PASSWORD).");
        }
        this.from = from;
    }

    @Override
    public void send(String to, String subject, String textBody, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(textBody, htmlBody); // plain-text part + HTML part
            mailSender.send(message);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to send email: " + e.getMessage(), e);
        }
    }
}
