package com.family.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request to create a user")
public record CreateUserRequest(
    @Schema(description = "Username", example = "alice")
    @NotBlank String username,

    @Schema(description = "Password")
    @NotBlank String password,

    @Schema(description = "Email", example = "alice@example.com")
    String email,

    @Schema(description = "Display name", example = "Alice")
    @NotBlank String name
) {}
