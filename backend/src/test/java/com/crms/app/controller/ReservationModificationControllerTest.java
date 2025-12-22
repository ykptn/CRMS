package com.crms.app.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.crms.app.dto.ReservationRequest;
import com.crms.app.dto.ReservationSummary;
import com.crms.app.service.ReservationManagementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class ReservationModificationControllerTest {

    @Mock
    private ReservationManagementService reservationManagementService;

    private ReservationController reservationController;

    @BeforeEach
    void setup() {
        reservationController = new ReservationController(reservationManagementService);
    }

    @Test
    void shouldUpdateReservation() {
        ReservationSummary summary = new ReservationSummary();
        summary.setId(10L);

        when(reservationManagementService.updateReservation(eq(10L), any(ReservationRequest.class)))
                .thenReturn(summary);

        var response = reservationController.updateReservation(10L, new ReservationRequest());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(summary);
    }

    @Test
    void shouldCancelReservation() {
        ReservationSummary summary = new ReservationSummary();
        summary.setId(20L);

        when(reservationManagementService.cancelReservation(20L)).thenReturn(summary);

        var response = reservationController.cancelReservation(20L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(summary);
    }
}
