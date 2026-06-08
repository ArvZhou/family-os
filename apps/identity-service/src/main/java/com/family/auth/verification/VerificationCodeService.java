package com.family.auth.verification;

/**
 * Strategy interface for sending verification codes.
 * Implementations: console (dev), aliyun-sms, twilio-sms, smtp-email, etc.
 */
public interface VerificationCodeService {

    /**
     * Send a verification code to the target (email or phone).
     *
     * @param target email address or phone number
     * @param code   6-digit verification code
     */
    void send(String target, String code);

    /**
     * Whether this service supports the given target type.
     */
    boolean supports(String target);
}
