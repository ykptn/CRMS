package com.crms.app.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.crms.app.dto.ReservationSummary;
import com.crms.app.mapper.ReservationMapper;
import com.crms.app.model.Reservation;
import com.crms.app.model.ReservationStatus;
import com.crms.app.repository.ReservationRepository;
import com.crms.app.service.impl.ReportingServiceImpl;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReservationStatusFilterServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private ReservationMapper reservationMapper;

    private ReportingServiceImpl reportingService;

    @BeforeEach
    void setup() {
        reportingService = new ReportingServiceImpl(reservationRepository, reservationMapper);
    }

    @Test
    void shouldListAllReservationsWhenStatusMissing() {
        Reservation reservation = new Reservation();
        ReservationSummary summary = new ReservationSummary();
        summary.setId(1L);

        when(reservationRepository.findAllByOrderByStartDateDesc()).thenReturn(List.of(reservation));
        when(reservationMapper.toSummary(reservation)).thenReturn(summary);

        List<ReservationSummary> results = reportingService.listReservations(null);

        assertThat(results).containsExactly(summary);
        verify(reservationRepository).findAllByOrderByStartDateDesc();
        verify(reservationRepository, never()).findAllByStatusOrderByStartDateDesc(any());
    }

    @Test
    void shouldFilterReservationsByStatus() {
        Reservation reservation = new Reservation();
        ReservationSummary summary = new ReservationSummary();
        summary.setId(2L);

        when(reservationRepository.findAllByStatusOrderByStartDateDesc(ReservationStatus.ACTIVE))
                .thenReturn(List.of(reservation));
        when(reservationMapper.toSummary(reservation)).thenReturn(summary);

        List<ReservationSummary> results = reportingService.listReservations(ReservationStatus.ACTIVE);

        assertThat(results).containsExactly(summary);
        verify(reservationRepository).findAllByStatusOrderByStartDateDesc(ReservationStatus.ACTIVE);
    }

    @Test
    void shouldExportReservationsAsCsv() {
        Reservation reservation = new Reservation();
        ReservationSummary summary = new ReservationSummary();
        summary.setReservationNumber("RES-100");
        summary.setStatus(ReservationStatus.ACTIVE);

        when(reservationRepository.findAllByOrderByStartDateDesc()).thenReturn(List.of(reservation));
        when(reservationMapper.toSummary(reservation)).thenReturn(summary);

        byte[] csv = reportingService.exportReservationsCsv(null);

        String output = new String(csv, java.nio.charset.StandardCharsets.UTF_8);
        assertThat(output).contains("reservationNumber,status,startDate,endDate,totalCost,memberId,carId,pickupLocationId,dropoffLocationId");
        assertThat(output).contains("RES-100");
    }

    @Test
    void shouldExportReservationsAsPdf() {
        Reservation reservation = new Reservation();
        ReservationSummary summary = new ReservationSummary();
        summary.setReservationNumber("RES-200");
        summary.setStatus(ReservationStatus.CANCELED);

        when(reservationRepository.findAllByOrderByStartDateDesc()).thenReturn(List.of(reservation));
        when(reservationMapper.toSummary(reservation)).thenReturn(summary);

        byte[] pdf = reportingService.exportReservationsPdf(null);

        assertThat(pdf).isNotEmpty();
    }
}
