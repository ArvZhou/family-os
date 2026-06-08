package com.family.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request to create a user")
public record CreateUserRequest(
        @Schema(description = "Username", example = "alice")
        @NotBlank String username,

        @Schema(description = "Password (min 8 characters)")
        @NotBlank String password,

        @Schema(description = "Email (used for verification)", example = "alice@example.com")
        String email,

        @Schema(description = "Phone number (used for verification)", example = "+8613800138000")
        String phone,

        @Schema(description = "Display name", example = "Alice")
        @NotBlank String name) {
}
