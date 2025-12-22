package com.crms.app.controller;

import com.crms.app.dto.MemberResponse;
import com.crms.app.dto.ReservationSummary;
import com.crms.app.service.MemberManagementService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/members")
public class MemberController {

    private final MemberManagementService memberManagementService;

    public MemberController(MemberManagementService memberManagementService) {
        this.memberManagementService = memberManagementService;
    }

    @GetMapping
    public ResponseEntity<List<MemberResponse>> listMembers() {
        return ResponseEntity.ok(memberManagementService.listMembers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemberResponse> getMember(@PathVariable Long id) {
        return ResponseEntity.ok(memberManagementService.getMember(id));
    }

    @GetMapping("/{id}/reservations")
    public ResponseEntity<List<ReservationSummary>> listMemberReservations(@PathVariable Long id) {
        return ResponseEntity.ok(memberManagementService.listMemberReservations(id));
    }
}
