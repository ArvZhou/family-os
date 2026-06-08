package com.family.auth.exception;

public class AccountNotVerifiedException extends RuntimeException {

    public AccountNotVerifiedException() {
        super("Account is not verified. Please verify your email or phone before logging in.");
    }
}
