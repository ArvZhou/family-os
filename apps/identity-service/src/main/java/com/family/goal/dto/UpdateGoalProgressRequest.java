package com.family.goal.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Schema(description = "Request to update goal progress")
public record UpdateGoalProgressRequest(
        @Schema(description = "Current progress value", required = true)
        @NotNull @DecimalMin(value = "0") BigDecimal currentValue) {
}
