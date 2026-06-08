package com.family.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Refresh token request")
public record RefreshTokenRequest(
        @Schema(description = "Refresh token")
        @NotBlank String refreshToken) {
}
