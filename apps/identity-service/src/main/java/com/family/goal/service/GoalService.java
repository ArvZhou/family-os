package com.family.goal.service;

import com.family.goal.dto.CreateGoalRequest;
import com.family.goal.dto.GoalListResponse;
import com.family.goal.dto.GoalResponse;
import com.family.goal.dto.UpdateGoalProgressRequest;

import java.util.UUID;

public interface GoalService {

    GoalListResponse findAll(UUID userId, UUID memberId, String type, String status, Integer first, String after);

    GoalResponse findById(UUID userId, UUID id);

    GoalResponse create(UUID userId, CreateGoalRequest request);

    GoalResponse updateProgress(UUID userId, UUID id, UpdateGoalProgressRequest request);

    void delete(UUID userId, UUID id);

    int expireDueGoals();
}
