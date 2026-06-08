package com.family.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Login request")
public record LoginRequest(
        @Schema(description = "Username", example = "alice")
        @NotBlank String username,

        @Schema(description = "Password", example = "securePassword123")
        @NotBlank String password) {
}
