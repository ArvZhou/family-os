package com.family.auth.verification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Development-only implementation that prints verification codes to the console.
 * Activated when sms.provider=console (the default).
 */
@Service
public class ConsoleVerificationCodeService implements VerificationCodeService {

    private static final Logger log = LoggerFactory.getLogger(ConsoleVerificationCodeService.class);

    @Override
    public void send(String target, String code) {
        log.info("");
        log.info("========================================");
        log.info("  VERIFICATION CODE for {}: {}", target, code);
        log.info("========================================");
        log.info("");
    }

    @Override
    public boolean supports(String target) {
        // Console supports all target types
        return true;
    }
}
