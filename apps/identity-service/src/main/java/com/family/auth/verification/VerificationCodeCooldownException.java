package com.family.auth.verification;

public class VerificationCodeCooldownException extends RuntimeException {

    private final long cooldownSeconds;

    public VerificationCodeCooldownException(long cooldownSeconds) {
        super("Please wait " + cooldownSeconds + " seconds before resending");
        this.cooldownSeconds = cooldownSeconds;
    }

    public long getCooldownSeconds() {
        return cooldownSeconds;
    }
}
