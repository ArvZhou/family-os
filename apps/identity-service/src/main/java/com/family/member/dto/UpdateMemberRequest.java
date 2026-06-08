package com.family.member.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;

@Schema(description = "Request to update a family member")
public record UpdateMemberRequest(
        @Schema(description = "Display name", example = "Alice")
        String name,

        @Schema(description = "Date of birth", example = "1990-01-15")
        LocalDate birthday,

        @Schema(description = "Relationship type", example = "CHILD")
        String relationType,

        @Schema(description = "Avatar URL", example = "https://example.com/avatar.jpg")
        String avatarUrl) {
}
