package com.family.member.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Schema(description = "Request to create a family member")
public record CreateMemberRequest(
    @Schema(description = "Display name", example = "Alice", required = true)
    @NotBlank String name,

    @Schema(description = "Date of birth", example = "1990-01-15", required = true)
    @NotNull LocalDate birthday,

    @Schema(description = "Relationship type", example = "SPOUSE")
    @NotNull String relationType,

    @Schema(description = "Avatar URL", example = "https://example.com/avatar.jpg")
    String avatarUrl
) {}
