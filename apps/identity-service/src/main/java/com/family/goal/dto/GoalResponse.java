package com.family.goal.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Goal response")
public record GoalResponse(
        UUID id,
        UUID userId,
        UUID memberId,
        String title,
        String type,
        BigDecimal targetValue,
        BigDecimal currentValue,
        String unit,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        BigDecimal progress,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
