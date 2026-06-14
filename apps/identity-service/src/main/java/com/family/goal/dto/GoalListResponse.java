package com.family.goal.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Paginated goal list response")
public record GoalListResponse(
        List<GoalResponse> items,
        long totalCount,
        boolean hasNextPage,
        boolean hasPreviousPage,
        String startCursor,
        String endCursor) {
}
