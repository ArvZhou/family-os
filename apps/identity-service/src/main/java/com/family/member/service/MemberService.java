package com.family.member.service;

import com.family.member.dto.*;
import java.util.List;
import java.util.UUID;

public interface MemberService {

    List<MemberResponse> findAll(UUID userId);

    MemberResponse findById(UUID userId, UUID id);

    MemberResponse create(UUID userId, CreateMemberRequest request);

    MemberResponse update(UUID userId, UUID id, UpdateMemberRequest request);

    void delete(UUID userId, UUID id);
}
