package com.family.permission.dto;

import java.util.UUID;

public record PermissionResponse(
    UUID id,
    String name,
    String description
) {}
