package com.family.device.dto;

import java.util.UUID;

public record DeviceResponse(
    UUID id,
    String deviceId,
    String name,
    String deviceType,
    String protocol,
    String status
) {}
