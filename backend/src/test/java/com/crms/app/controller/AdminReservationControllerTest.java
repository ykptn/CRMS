package com.crms.app.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.crms.app.dto.ReservationSummary;
import com.crms.app.model.ReservationStatus;
import com.crms.app.service.ReportingService;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class AdminReservationControllerTest {

    @Mock
    private ReportingService reportingService;

    private AdminReservationController controller;

    @BeforeEach
    void setup() {
        controller = new AdminReservationController(reportingService);
    }

    @Test
    void shouldListReservationsByStatus() {
        ReservationSummary summary = new ReservationSummary();
        summary.setId(1L);

        when(reportingService.listReservations(ReservationStatus.ACTIVE)).thenReturn(List.of(summary));

        var response = controller.listReservations(ReservationStatus.ACTIVE);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(summary);
    }

    @Test
    void shouldExportReservationsCsv() {
        byte[] report = "reservationNumber,status".getBytes(StandardCharsets.UTF_8);
        when(reportingService.exportReservationsCsv(null)).thenReturn(report);

        var response = controller.exportReservationsCsv(null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getFirst("Content-Disposition")).contains("reservations.csv");
        assertThat(response.getBody()).isEqualTo(report);
    }

    @Test
    void shouldExportReservationsPdf() {
        byte[] report = new byte[] {1, 2, 3};
        when(reportingService.exportReservationsPdf(ReservationStatus.CANCELED)).thenReturn(report);

        var response = controller.exportReservationsPdf(ReservationStatus.CANCELED);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getFirst("Content-Disposition")).contains("reservations.pdf");
        assertThat(response.getBody()).isEqualTo(report);
    }
}
