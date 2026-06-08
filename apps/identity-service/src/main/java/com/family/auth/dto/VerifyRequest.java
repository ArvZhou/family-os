package com.family.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Verify account with code")
public record VerifyRequest(
        @Schema(description = "Email or phone used during registration", example = "alice@example.com")
        @NotBlank String target,

        @Schema(description = "6-digit verification code", example = "123456")
        @NotBlank String code) {
}
