package com.family.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Resend verification code")
public record ResendCodeRequest(
        @Schema(description = "Email or phone to resend code to", example = "alice@example.com")
        @NotBlank String target) {
}
