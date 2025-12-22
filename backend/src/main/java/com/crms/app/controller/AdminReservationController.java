package com.crms.app.controller;

import com.crms.app.dto.ReservationSummary;
import com.crms.app.model.ReservationStatus;
import com.crms.app.service.ReportingService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reservations")
public class AdminReservationController {

    private final ReportingService reportingService;

    public AdminReservationController(ReportingService reportingService) {
        this.reportingService = reportingService;
    }

    @GetMapping
    public ResponseEntity<List<ReservationSummary>> listReservations(
            @RequestParam(required = false) ReservationStatus status) {
        List<ReservationSummary> reservations = reportingService.listReservations(status);
        return ResponseEntity.ok(reservations);
    }
}
