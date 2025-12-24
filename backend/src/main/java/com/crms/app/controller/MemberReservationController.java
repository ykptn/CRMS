package com.crms.app.controller;

import com.crms.app.dto.ReservationSummary;
import com.crms.app.service.MemberManagementService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/members")
public class MemberReservationController {

    private final MemberManagementService memberManagementService;

    public MemberReservationController(MemberManagementService memberManagementService) {
        this.memberManagementService = memberManagementService;
    }

    @GetMapping("/{id}/reservations")
    public ResponseEntity<List<ReservationSummary>> listMemberReservations(@PathVariable Long id) {
        return ResponseEntity.ok(memberManagementService.listMemberReservations(id));
    }
}
