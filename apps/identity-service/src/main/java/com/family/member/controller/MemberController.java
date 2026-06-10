package com.family.member.controller;

import com.family.member.dto.*;
import com.family.member.service.MemberService;
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
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Members", description = "Family member management")
@RestController
@RequestMapping("/api/v1/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    private UUID getUserId(Principal principal) {
        if (principal == null) {
            throw new IllegalStateException("Authentication required");
        }
        return UUID.fromString(principal.getName());
    }

    @Operation(summary = "List all family members", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "List of members")
    @GetMapping
    public ResponseEntity<List<MemberResponse>> findAll(Principal principal) {
        return ResponseEntity.ok(memberService.findAll(getUserId(principal)));
    }

    @Operation(summary = "Get member by ID", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Member found"),
            @ApiResponse(responseCode = "404", description = "Member not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<MemberResponse> findById(@PathVariable UUID id, Principal principal) {
        return ResponseEntity.ok(memberService.findById(getUserId(principal), id));
    }

    @Operation(summary = "Create a new family member", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Member created"),
            @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    @PostMapping
    public ResponseEntity<MemberResponse> create(@Valid @RequestBody CreateMemberRequest request,
                                                  Principal principal) {
        MemberResponse member = memberService.create(getUserId(principal), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }

    @Operation(summary = "Update an existing family member", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Member updated"),
            @ApiResponse(responseCode = "404", description = "Member not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<MemberResponse> update(@PathVariable UUID id,
                                                  @Valid @RequestBody UpdateMemberRequest request,
                                                  Principal principal) {
        return ResponseEntity.ok(memberService.update(getUserId(principal), id, request));
    }

    @Operation(summary = "Delete a family member (soft delete)", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Member deleted"),
            @ApiResponse(responseCode = "404", description = "Member not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id, Principal principal) {
        memberService.delete(getUserId(principal), id);
        return ResponseEntity.ok(Map.of("message", "Member deleted"));
    }
}
