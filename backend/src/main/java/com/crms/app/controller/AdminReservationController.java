package com.crms.app.controller;

import com.crms.app.dto.ReservationSummary;
import com.crms.app.model.ReservationStatus;
import com.crms.app.service.ReportingService;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

    @GetMapping(value = "/export/csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportReservationsCsv(
            @RequestParam(required = false) ReservationStatus status) {
        byte[] report = reportingService.exportReservationsCsv(status);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"reservations.csv\"");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(report);
    }

    @GetMapping(value = "/export/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportReservationsPdf(
            @RequestParam(required = false) ReservationStatus status) {
        byte[] report = reportingService.exportReservationsPdf(status);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"reservations.pdf\"");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(report);
    }
}
