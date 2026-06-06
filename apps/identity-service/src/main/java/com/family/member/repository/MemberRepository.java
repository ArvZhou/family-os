package com.family.member.repository;

import com.family.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface MemberRepository extends JpaRepository<Member, UUID> {
}
