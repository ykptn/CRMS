package com.crms.app.controller;

import com.crms.app.dto.ReservationQuoteResponse;
import com.crms.app.dto.ReservationRequest;
import com.crms.app.dto.ReservationSummary;
import com.crms.app.service.ReservationManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationManagementService reservationManagementService;

    public ReservationController(ReservationManagementService reservationManagementService) {
        this.reservationManagementService = reservationManagementService;
    }

    @PostMapping
    public ResponseEntity<ReservationSummary> createReservation(@Valid @RequestBody ReservationRequest request) {
        ReservationSummary summary = reservationManagementService.createReservation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(summary);
    }

    @PostMapping("/quote")
    public ResponseEntity<ReservationQuoteResponse> quoteReservation(@Valid @RequestBody ReservationRequest request) {
        ReservationQuoteResponse response = reservationManagementService.quoteReservation(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{reservationId}")
    public ResponseEntity<ReservationSummary> updateReservation(@PathVariable Long reservationId,
                                                                @Valid @RequestBody ReservationRequest request) {
        ReservationSummary summary = reservationManagementService.updateReservation(reservationId, request);
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/{reservationId}/cancel")
    public ResponseEntity<ReservationSummary> cancelReservation(@PathVariable Long reservationId) {
        ReservationSummary summary = reservationManagementService.cancelReservation(reservationId);
        return ResponseEntity.ok(summary);
    }
}
