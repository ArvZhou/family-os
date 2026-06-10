package com.family.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

@Schema(description = "User response")
public record UserResponse(
    UUID id,
    String username,
    String email,
    String phone,
    String name
) {}
