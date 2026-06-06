package com.family.member.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Members", description = "Family member management")
@RestController
@RequestMapping("/api/v1/members")
public class MemberController {
}
