package com.example.worsi_backend.service;

import com.example.worsi_backend.service.email.EmailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

/**
 * Builds the account emails and hands them to the active EmailSender. Methods are @Async so the
 * HTTP response never waits on SMTP - which also keeps /forgot-password's response time the same
 * whether or not the email belongs to an account (no timing side channel).
 *
 * Failures are logged (without the link/token) and swallowed: the caller has already answered.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final EmailSender emailSender;
    private final int expiryMinutes;

    public EmailService(EmailSender emailSender,
                         @Value("${app.password-reset.expiry-minutes:30}") int expiryMinutes) {
        this.emailSender = emailSender;
        this.expiryMinutes = expiryMinutes;
    }

    @Async("mailExecutor")
    public void sendPasswordResetEmail(String to, String name, String resetLink) {
        String safeName = name == null || name.isBlank() ? "there" : name;
        String subject = "Reset your Worksy password";

        String text = "Hi " + safeName + ",\n\n"
                + "We received a request to reset your Worksy password. Use the link below to choose a new one. "
                + "It expires in " + expiryMinutes + " minutes and can only be used once:\n\n"
                + resetLink + "\n\n"
                + "If you didn't ask for this, you can safely ignore this email - your password won't change.\n\n"
                + "- The Worksy team";

        String html = "<div style=\"font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;max-width:480px\">"
                + "<p>Hi " + HtmlUtils.htmlEscape(safeName) + ",</p>"
                + "<p>We received a request to reset your Worksy password. Click the button below to choose a new one. "
                + "The link expires in " + expiryMinutes + " minutes and can only be used once.</p>"
                + "<p><a href=\"" + HtmlUtils.htmlEscape(resetLink) + "\" "
                + "style=\"display:inline-block;background:#000;color:#fff;padding:12px 22px;text-decoration:none;"
                + "font-weight:bold;letter-spacing:1px\">RESET PASSWORD</a></p>"
                + "<p style=\"color:#555\">Or paste this link into your browser:<br>"
                + "<span style=\"word-break:break-all\">" + HtmlUtils.htmlEscape(resetLink) + "</span></p>"
                + "<p style=\"color:#555\">If you didn't ask for this, you can safely ignore this email - "
                + "your password won't change.</p></div>";

        deliver(to, subject, text, html, "password reset");
    }

    @Async("mailExecutor")
    public void sendPasswordChangedEmail(String to, String name) {
        String safeName = name == null || name.isBlank() ? "there" : name;
        String subject = "Your Worksy password was changed";
        String text = "Hi " + safeName + ",\n\n"
                + "Your Worksy password was just changed and you've been signed out of your other sessions. "
                + "If this was you, no action is needed. If it wasn't, reset your password again straight away "
                + "and contact support.\n\n- The Worksy team";
        String html = "<div style=\"font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;max-width:480px\">"
                + "<p>Hi " + HtmlUtils.htmlEscape(safeName) + ",</p>"
                + "<p>Your Worksy password was just changed and you've been signed out of your other sessions.</p>"
                + "<p>If this was you, no action is needed. If it wasn't, reset your password again straight away "
                + "and contact support.</p></div>";
        deliver(to, subject, text, html, "password changed notice");
    }

    private void deliver(String to, String subject, String text, String html, String kind) {
        try {
            emailSender.send(to, subject, text, html);
        } catch (Exception e) {
            // Never log the body/link. The reason alone is enough to debug SMTP problems.
            log.error("Could not send {} email: {}", kind, e.getMessage());
        }
    }
}
