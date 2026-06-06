package com.family.permission.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request to create a permission")
public record CreatePermissionRequest(
    @Schema(description = "Permission name", example = "health:read")
    @NotBlank String name,

    @Schema(description = "Permission description", example = "View health records")
    String description
) {}
