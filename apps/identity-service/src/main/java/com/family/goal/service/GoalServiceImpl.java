package com.family.goal.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.common.exception.EntityNotFoundException;
import com.family.goal.dto.CreateGoalRequest;
import com.family.goal.dto.GoalListResponse;
import com.family.goal.dto.GoalResponse;
import com.family.goal.dto.UpdateGoalProgressRequest;
import com.family.goal.entity.Goal;
import com.family.goal.mapper.GoalMapper;
import com.family.member.entity.Member;
import com.family.member.mapper.MemberMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class GoalServiceImpl implements GoalService {

    private final GoalMapper goalMapper;
    private final MemberMapper memberMapper;

    public GoalServiceImpl(GoalMapper goalMapper, MemberMapper memberMapper) {
        this.goalMapper = goalMapper;
        this.memberMapper = memberMapper;
    }

    @Override
    public GoalListResponse findAll(UUID userId, UUID memberId, String type, String status, Integer first, String after) {
        expireDueGoals();

        LambdaQueryWrapper<Goal> query = new LambdaQueryWrapper<>();
        query.eq(Goal::getUserId, userId);
        if (memberId != null) {
            query.eq(Goal::getMemberId, memberId);
        }
        if (type != null && !type.isBlank()) {
            query.eq(Goal::getType, type.trim().toUpperCase());
        }
        if (status != null && !status.isBlank()) {
            query.eq(Goal::getStatus, status.trim().toUpperCase());
        }
        query.orderByDesc(Goal::getCreatedAt);

        List<Goal> goals = goalMapper.selectList(query);
        long totalCount = goals.size();
        boolean hasPreviousPage = after != null && !after.isBlank();

        if (after != null && !after.isBlank()) {
            UUID afterId = UUID.fromString(after);
            int index = -1;
            for (int i = 0; i < goals.size(); i++) {
                if (goals.get(i).getId().equals(afterId)) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) {
                goals = new ArrayList<>(goals.subList(index + 1, goals.size()));
            }
        }

        int limit = first == null || first < 1 ? 20 : first;
        boolean hasNextPage = goals.size() > limit;
        if (hasNextPage) {
            goals = goals.subList(0, limit);
        }

        List<GoalResponse> items = goals.stream().map(this::toResponse).toList();
        return new GoalListResponse(
                items,
                totalCount,
                hasNextPage,
                hasPreviousPage,
                items.isEmpty() ? null : items.getFirst().id().toString(),
                items.isEmpty() ? null : items.getLast().id().toString());
    }

    @Override
    public GoalResponse findById(UUID userId, UUID id) {
        return toResponse(findOwned(userId, id));
    }

    @Override
    public GoalResponse create(UUID userId, CreateGoalRequest request) {
        Member member = findMemberOwnedByUser(userId, request.memberId());
        validateDates(request.startDate(), request.endDate());
        validateGoalType(request.type());

        Goal goal = new Goal();
        goal.setId(UUID.randomUUID());
        goal.setUserId(userId);
        goal.setMemberId(member.getId());
        goal.setTitle(request.title().trim());
        goal.setType(request.type().trim().toUpperCase());
        goal.setTargetValue(request.targetValue());
        goal.setCurrentValue(request.currentValue() == null ? BigDecimal.ZERO : request.currentValue());
        goal.setUnit(request.unit().trim());
        goal.setStartDate(request.startDate());
        goal.setEndDate(request.endDate());
        goal.setStatus(resolveStatus(goal.getCurrentValue(), goal.getTargetValue(), goal.getEndDate(), null));
        goalMapper.insert(goal);
        return toResponse(goal);
    }

    @Override
    public GoalResponse updateProgress(UUID userId, UUID id, UpdateGoalProgressRequest request) {
        Goal goal = findOwned(userId, id);
        goal.setCurrentValue(request.currentValue());
        goal.setStatus(resolveStatus(goal.getCurrentValue(), goal.getTargetValue(), goal.getEndDate(), goal.getStatus()));
        goalMapper.updateById(goal);
        return toResponse(goal);
    }

    @Override
    public void delete(UUID userId, UUID id) {
        Goal goal = findOwned(userId, id);
        goalMapper.deleteById(goal.getId());
    }

    @Override
    public int expireDueGoals() {
        List<Goal> goals = goalMapper.selectList(
                new LambdaQueryWrapper<Goal>().eq(Goal::getStatus, "ACTIVE")
        );
        LocalDate today = LocalDate.now();
        int count = 0;
        for (Goal goal : goals) {
            if (goal.getEndDate() != null && goal.getEndDate().isBefore(today)) {
                goal.setStatus("EXPIRED");
                goalMapper.updateById(goal);
                count += 1;
            }
        }
        return count;
    }

    private Goal findOwned(UUID userId, UUID id) {
        LambdaQueryWrapper<Goal> query = new LambdaQueryWrapper<>();
        query.eq(Goal::getId, id).eq(Goal::getUserId, userId);
        Goal goal = goalMapper.selectOne(query);
        if (goal == null) {
            throw new EntityNotFoundException("Goal", id);
        }
        return goal;
    }

    private Member findMemberOwnedByUser(UUID userId, UUID memberId) {
        LambdaQueryWrapper<Member> query = new LambdaQueryWrapper<>();
        query.eq(Member::getId, memberId).eq(Member::getUserId, userId);
        Member member = memberMapper.selectOne(query);
        if (member == null) {
            throw new EntityNotFoundException("Member", memberId);
        }
        return member;
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date must be on or after start date");
        }
    }

    private void validateGoalType(String type) {
        try {
            GoalType.valueOf(type.trim().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid goal type: " + type);
        }
    }

    private String resolveStatus(BigDecimal currentValue, BigDecimal targetValue, LocalDate endDate, String currentStatus) {
        if (currentValue != null && targetValue != null && currentValue.compareTo(targetValue) >= 0) {
            return "COMPLETED";
        }
        if (endDate != null && endDate.isBefore(LocalDate.now())) {
            return "EXPIRED";
        }
        if ("EXPIRED".equalsIgnoreCase(currentStatus)) {
            return "EXPIRED";
        }
        return "ACTIVE";
    }

    private GoalResponse toResponse(Goal goal) {
        BigDecimal progress = BigDecimal.ZERO;
        if (goal.getTargetValue() != null && goal.getTargetValue().compareTo(BigDecimal.ZERO) > 0) {
            progress = goal.getCurrentValue()
                    .multiply(BigDecimal.valueOf(100))
                    .divide(goal.getTargetValue(), 2, RoundingMode.HALF_UP);
        }
        return new GoalResponse(
                goal.getId(),
                goal.getUserId(),
                goal.getMemberId(),
                goal.getTitle(),
                goal.getType(),
                goal.getTargetValue(),
                goal.getCurrentValue(),
                goal.getUnit(),
                goal.getStartDate(),
                goal.getEndDate(),
                goal.getStatus(),
                progress,
                goal.getCreatedAt(),
                goal.getUpdatedAt());
    }

    private enum GoalType {
        DAILY,
        WEEKLY,
        MONTHLY,
        CUSTOM
    }
}
