package com.family.goal.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Schema(description = "Request to create a goal")
public record CreateGoalRequest(
        @Schema(description = "Associated member ID", required = true)
        @NotNull UUID memberId,

        @Schema(description = "Goal title", example = "每天走 8000 步", required = true)
        @NotBlank String title,

        @Schema(description = "Goal type", example = "WEEKLY", required = true)
        @NotBlank String type,

        @Schema(description = "Target value", example = "8000", required = true)
        @NotNull @DecimalMin(value = "0.01") BigDecimal targetValue,

        @Schema(description = "Current value", example = "0")
        BigDecimal currentValue,

        @Schema(description = "Unit", example = "steps", required = true)
        @NotBlank String unit,

        @Schema(description = "Start date", example = "2026-06-14", required = true)
        @NotNull LocalDate startDate,

        @Schema(description = "End date", example = "2026-06-30", required = true)
        @NotNull LocalDate endDate) {
}
