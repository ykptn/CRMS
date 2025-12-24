package com.crms.app.mapper;

import com.crms.app.dto.ReservationQuoteResponse;
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
        summary.setAdditionalServiceIds(reservation.getAdditionalServices().stream()
                .map(service -> service.getId())
                .toList());
        summary.setEquipmentIds(reservation.getEquipments().stream()
                .map(equipment -> equipment.getId())
                .toList());
        return summary;
    }

    public ReservationQuoteResponse toQuoteResponse(Reservation reservation) {
        ReservationQuoteResponse response = new ReservationQuoteResponse();
        response.setMemberId(reservation.getMember().getId());
        response.setCarId(reservation.getCar().getId());
        response.setPickupLocationId(reservation.getPickupLocation().getId());
        response.setDropoffLocationId(reservation.getDropoffLocation().getId());
        response.setStartDate(reservation.getStartDate());
        response.setEndDate(reservation.getEndDate());
        response.setAdditionalServiceIds(reservation.getAdditionalServices().stream()
                .map(service -> service.getId())
                .toList());
        response.setEquipmentIds(reservation.getEquipments().stream()
                .map(equipment -> equipment.getId())
                .toList());
        response.setTotalCost(reservation.getTotalCost());
        return response;
    }
}
