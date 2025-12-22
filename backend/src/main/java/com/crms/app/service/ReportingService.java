package com.crms.app.service;

import com.crms.app.dto.ReservationSummary;
import com.crms.app.model.ReservationStatus;
import java.util.List;

public interface ReportingService {

    List<ReservationSummary> listReservations(ReservationStatus status);

    byte[] exportReservationsCsv(ReservationStatus status);

    byte[] exportReservationsPdf(ReservationStatus status);
}
