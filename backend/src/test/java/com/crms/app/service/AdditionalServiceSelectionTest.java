package com.crms.app.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.crms.app.dto.ReservationRequest;
import com.crms.app.model.Location;
import com.crms.app.model.Member;
import com.crms.app.support.IntegrationTestSupport;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class AdditionalServiceSelectionTest extends IntegrationTestSupport {

    @Autowired
    private ReservationManagementService reservationManagementService;

    @Test
    void shouldStoreSelectedExtrasOnReservation() {
        Location location = createLocation("LOC1");
        Member member = createMember("member@crms.local", "Password123");
        var car = createCar(location, "BC-900", "34ABC14");

        var service = createService("Insurance", BigDecimal.valueOf(15));
        var equipment = createEquipment("GPS", BigDecimal.valueOf(5));

        ReservationRequest request = new ReservationRequest();
        request.setMemberId(member.getId());
        request.setCarId(car.getId());
        request.setPickupLocationId(location.getId());
        request.setDropoffLocationId(location.getId());
        request.setStartDate(LocalDate.now().plusDays(2));
        request.setEndDate(LocalDate.now().plusDays(4));
        request.setAdditionalServiceIds(java.util.List.of(service.getId()));
        request.setEquipmentIds(java.util.List.of(equipment.getId()));

        var summary = reservationManagementService.createReservation(request);

        var reservation = reservationRepository.findById(summary.getId()).orElseThrow();
        assertThat(reservation.getAdditionalServices()).hasSize(1);
        assertThat(reservation.getEquipments()).hasSize(1);
    }
}
