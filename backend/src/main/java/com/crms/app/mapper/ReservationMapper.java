package com.crms.app.mapper;

import com.crms.app.dto.ReservationSummary;
import com.crms.app.model.Reservation;
import org.springframework.stereotype.Component;

@Component
public class ReservationMapper {

    public ReservationSummary toSummary(Reservation reservation) {
        ReservationSummary summary = new ReservationSummary();
        summary.setId(reservation.getId());
        summary.setReservationNumber(reservation.getReservationNumber());
        summary.setMemberId(reservation.getMember().getId());
        summary.setCarId(reservation.getCar().getId());
        summary.setPickupLocationId(reservation.getPickupLocation().getId());
        summary.setDropoffLocationId(reservation.getDropoffLocation().getId());
        summary.setStartDate(reservation.getStartDate());
        summary.setEndDate(reservation.getEndDate());
        summary.setTotalCost(reservation.getTotalCost());
        summary.setStatus(reservation.getStatus());
        return summary;
    }
}
