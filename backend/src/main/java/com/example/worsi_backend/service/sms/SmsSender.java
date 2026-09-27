package com.example.worsi_backend.service.sms;

/**
 * Pluggable SMS provider. Exactly one implementation is active at a time, chosen by
 * app.sms.provider (see application.properties). Swap in a real provider (Twilio, MSG91, AWS SNS,
 * etc.) by adding a new implementation of this interface, annotated with
 * @ConditionalOnProperty(name = "app.sms.provider", havingValue = "<your-provider-name>") - no
 * other code needs to change, since OtpService only ever depends on this interface.
 */
public interface SmsSender {
    void send(String phoneNumber, String message);
}
