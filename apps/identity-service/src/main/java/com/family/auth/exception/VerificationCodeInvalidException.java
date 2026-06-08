package com.family.auth.exception;

public class VerificationCodeInvalidException extends RuntimeException {

    public VerificationCodeInvalidException() {
        super("Invalid or expired verification code");
    }
}
