package com.family.common.exception;

/**
 * Thrown when a requested entity is not found.
 * Replaces {@code jakarta.persistence.EntityNotFoundException} after the MyBatis migration.
 */
public class EntityNotFoundException extends RuntimeException {

    public EntityNotFoundException(String message) {
        super(message);
    }

    public EntityNotFoundException(String entity, Object id) {
        super(entity + " not found with id: " + id);
    }
}
