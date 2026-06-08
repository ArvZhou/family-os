package com.family.member.service;

import com.family.member.mapper.MemberMapper;
import org.springframework.stereotype.Service;

@Service
public class MemberServiceImpl implements MemberService {

    private final MemberMapper memberMapper;

    public MemberServiceImpl(MemberMapper memberMapper) {
        this.memberMapper = memberMapper;
    }
}
