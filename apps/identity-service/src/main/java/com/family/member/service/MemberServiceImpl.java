package com.family.member.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.common.exception.EntityNotFoundException;
import com.family.member.dto.*;
import com.family.member.entity.Member;
import com.family.member.entity.RelationType;
import com.family.member.mapper.MemberMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class MemberServiceImpl implements MemberService {

    private final MemberMapper memberMapper;

    public MemberServiceImpl(MemberMapper memberMapper) {
        this.memberMapper = memberMapper;
    }

    @Override
    public List<MemberResponse> findAll(UUID userId) {
        LambdaQueryWrapper<Member> query = new LambdaQueryWrapper<>();
        query.eq(Member::getUserId, userId);
        List<Member> members = memberMapper.selectList(query);
        return members.stream().map(this::toResponse).toList();
    }

    @Override
    public MemberResponse findById(UUID userId, UUID id) {
        Member member = findOwned(userId, id);
        return toResponse(member);
    }

    @Override
    public MemberResponse create(UUID userId, CreateMemberRequest request) {
        validateName(request.name());
        validateBirthday(request.birthday());
        validateRelationType(request.relationType());

        Member member = new Member();
        member.setId(UUID.randomUUID());
        member.setUserId(userId);
        member.setName(request.name().trim());
        member.setBirthday(request.birthday());
        member.setRelationType(request.relationType().toUpperCase());
        member.setAvatarUrl(request.avatarUrl());
        memberMapper.insert(member);
        return toResponse(member);
    }

    @Override
    public MemberResponse update(UUID userId, UUID id, UpdateMemberRequest request) {
        Member member = findOwned(userId, id);

        if (request.name() != null) {
            validateName(request.name());
            member.setName(request.name().trim());
        }
        if (request.birthday() != null) {
            validateBirthday(request.birthday());
            member.setBirthday(request.birthday());
        }
        if (request.relationType() != null) {
            validateRelationType(request.relationType());
            member.setRelationType(request.relationType().toUpperCase());
        }
        if (request.avatarUrl() != null) {
            member.setAvatarUrl(request.avatarUrl());
        }

        memberMapper.updateById(member);
        return toResponse(member);
    }

    @Override
    public void delete(UUID userId, UUID id) {
        Member member = findOwned(userId, id);
        memberMapper.deleteById(member.getId());
    }

    /**
     * Find a member by id and verify it belongs to the given user.
     */
    private Member findOwned(UUID userId, UUID id) {
        LambdaQueryWrapper<Member> query = new LambdaQueryWrapper<>();
        query.eq(Member::getId, id)
             .eq(Member::getUserId, userId);
        Member member = memberMapper.selectOne(query);
        if (member == null) {
            throw new EntityNotFoundException("Member", id);
        }
        return member;
    }

    private void validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (name.length() > 50) {
            throw new IllegalArgumentException("Name must be 50 characters or less");
        }
    }

    private void validateBirthday(LocalDate birthday) {
        if (birthday == null) {
            throw new IllegalArgumentException("Birthday is required");
        }
        if (birthday.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Birthday cannot be in the future");
        }
    }

    private void validateRelationType(String relationType) {
        if (relationType == null || relationType.isBlank()) {
            throw new IllegalArgumentException("Relation type is required");
        }
        try {
            RelationType.valueOf(relationType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid relation type: " + relationType
                            + ". Must be one of: SPOUSE, PARENT, CHILD, SIBLING, OTHER");
        }
    }

    private MemberResponse toResponse(Member member) {
        return new MemberResponse(
                member.getId(),
                member.getName(),
                member.getBirthday(),
                member.getRelationType(),
                member.getAvatarUrl());
    }
}
