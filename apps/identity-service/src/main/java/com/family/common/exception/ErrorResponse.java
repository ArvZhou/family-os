package com.family.common.exception;

import java.util.Collections;
import java.util.List;

public record ErrorResponse(
    String code,
    String message,
    List<String> details
) {
    public ErrorResponse(String code, String message) {
        this(code, message, Collections.emptyList());
    }
}
