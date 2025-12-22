package com.crms.app.service.impl;

import com.crms.app.dto.ReservationSummary;
import com.crms.app.mapper.ReservationMapper;
import com.crms.app.model.Reservation;
import com.crms.app.model.ReservationStatus;
import com.crms.app.repository.ReservationRepository;
import com.crms.app.service.ReportingService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ReportingServiceImpl implements ReportingService {

    private final ReservationRepository reservationRepository;
    private final ReservationMapper reservationMapper;

    public ReportingServiceImpl(ReservationRepository reservationRepository,
                                ReservationMapper reservationMapper) {
        this.reservationRepository = reservationRepository;
        this.reservationMapper = reservationMapper;
    }

    @Override
    public List<ReservationSummary> listReservations(ReservationStatus status) {
        List<Reservation> reservations = status == null
                ? reservationRepository.findAllByOrderByStartDateDesc()
                : reservationRepository.findAllByStatusOrderByStartDateDesc(status);
        return reservations.stream()
                .map(reservationMapper::toSummary)
                .toList();
    }
}
