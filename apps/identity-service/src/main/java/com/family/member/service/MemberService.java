package com.family.member.service;

import com.family.member.dto.*;
import java.util.List;
import java.util.UUID;

public interface MemberService {

    List<MemberResponse> findAll();

    MemberResponse findById(UUID id);

    MemberResponse create(CreateMemberRequest request);

    MemberResponse update(UUID id, UpdateMemberRequest request);

    void delete(UUID id);
}
