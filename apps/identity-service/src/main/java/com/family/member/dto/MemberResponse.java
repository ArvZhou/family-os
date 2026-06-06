package com.family.member.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.util.UUID;

@Schema(description = "Member response")
public record MemberResponse(
    UUID id,
    String name,
    LocalDate birthday,
    String relationType,
    String avatarUrl
) {}
