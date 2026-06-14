package com.family.goal.controller;

import com.family.goal.dto.CreateGoalRequest;
import com.family.goal.dto.GoalListResponse;
import com.family.goal.dto.GoalResponse;
import com.family.goal.dto.UpdateGoalProgressRequest;
import com.family.goal.service.GoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Goals", description = "Goal management")
@RestController
@RequestMapping("/api/v1/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    private UUID getUserId(Principal principal) {
        if (principal == null) {
            throw new IllegalStateException("Authentication required");
        }
        return UUID.fromString(principal.getName());
    }

    @Operation(summary = "List goals", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "List of goals")
    @GetMapping
    public ResponseEntity<GoalListResponse> findAll(
            @RequestParam(required = false) UUID memberId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer first,
            @RequestParam(required = false) String after,
            Principal principal) {
        return ResponseEntity.ok(goalService.findAll(getUserId(principal), memberId, type, status, first, after));
    }

    @Operation(summary = "Get goal by ID", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Goal found"),
            @ApiResponse(responseCode = "404", description = "Goal not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<GoalResponse> findById(@PathVariable UUID id, Principal principal) {
        return ResponseEntity.ok(goalService.findById(getUserId(principal), id));
    }

    @Operation(summary = "Create a goal", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Goal created"),
            @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    @PostMapping
    public ResponseEntity<GoalResponse> create(@Valid @RequestBody CreateGoalRequest request, Principal principal) {
        GoalResponse goal = goalService.create(getUserId(principal), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(goal);
    }

    @Operation(summary = "Update goal progress", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Goal updated"),
            @ApiResponse(responseCode = "404", description = "Goal not found")
    })
    @PatchMapping("/{id}/progress")
    public ResponseEntity<GoalResponse> updateProgress(@PathVariable UUID id,
                                                       @Valid @RequestBody UpdateGoalProgressRequest request,
                                                       Principal principal) {
        return ResponseEntity.ok(goalService.updateProgress(getUserId(principal), id, request));
    }

    @Operation(summary = "Delete a goal", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Goal deleted"),
            @ApiResponse(responseCode = "404", description = "Goal not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id, Principal principal) {
        goalService.delete(getUserId(principal), id);
        return ResponseEntity.ok(Map.of("message", "Goal deleted"));
    }

    @Operation(summary = "Expire overdue goals", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/expire-due")
    public ResponseEntity<Map<String, Integer>> expireDueGoals() {
        int expired = goalService.expireDueGoals();
        return ResponseEntity.ok(Map.of("expired", expired));
    }
}
