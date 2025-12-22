package com.crms.app.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.crms.app.dto.ReservationRequest;
import com.crms.app.exception.ReservationConflictException;
import com.crms.app.model.Location;
import com.crms.app.model.Member;
import com.crms.app.support.IntegrationTestSupport;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class DrivingLicenseGuardTest extends IntegrationTestSupport {

    @Autowired
    private ReservationManagementService reservationManagementService;

    @Test
    void shouldBlockReservationWhenLicenseMissing() {
        Location location = createLocation("LOC1");
        Member member = createMember("member@crms.local", "Password123");
        member.setDrivingLicenseNumber("");
        memberRepository.save(member);
        var car = createCar(location, "BC-800", "34ABC13");

        ReservationRequest request = new ReservationRequest();
        request.setMemberId(member.getId());
        request.setCarId(car.getId());
        request.setPickupLocationId(location.getId());
        request.setDropoffLocationId(location.getId());
        request.setStartDate(LocalDate.now().plusDays(2));
        request.setEndDate(LocalDate.now().plusDays(4));

        assertThatThrownBy(() -> reservationManagementService.createReservation(request))
                .isInstanceOf(ReservationConflictException.class)
                .hasMessageContaining("driving license");
    }
}
