package com.family.auth.exception;

/**
 * Thrown when attempting to register with an email that is already in use.
 */
public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException(String email) {
        super("Email '" + email + "' is already registered");
    }
}
