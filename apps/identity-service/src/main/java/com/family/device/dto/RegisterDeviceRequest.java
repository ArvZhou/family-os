package com.family.device.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request to register a device")
public record RegisterDeviceRequest(
    @Schema(description = "Device hardware ID")
    @NotBlank String deviceId,

    @Schema(description = "Human-readable name")
    @NotBlank String name,

    @Schema(description = "Device type", example = "SENSOR")
    @NotBlank String deviceType,

    @Schema(description = "Protocol", example = "mqtt")
    @NotBlank String protocol
) {}
