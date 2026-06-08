package com.family.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Authentication response with tokens and user info")
public record AuthResponse(
        @Schema(description = "JWT access token") String accessToken,
        @Schema(description = "JWT refresh token") String refreshToken,
        @Schema(description = "Token expiry in seconds") long expiresIn,
        @Schema(description = "Authenticated user") UserResponse user) {
}
