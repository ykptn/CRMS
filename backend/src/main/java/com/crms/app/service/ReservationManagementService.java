package com.crms.app.service;

import com.crms.app.dto.ReservationRequest;
import com.crms.app.dto.ReservationSummary;

public interface ReservationManagementService {

    ReservationSummary createReservation(ReservationRequest request);

    ReservationSummary updateReservation(Long reservationId, ReservationRequest request);

    ReservationSummary cancelReservation(Long reservationId);
}
