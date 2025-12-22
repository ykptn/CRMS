package com.crms.app.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.crms.app.dto.ReservationRequest;
import com.crms.app.exception.CarUnavailableException;
import com.crms.app.exception.ReservationConflictException;
import com.crms.app.model.CarStatus;
import com.crms.app.model.Location;
import com.crms.app.model.Member;
import com.crms.app.support.IntegrationTestSupport;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class ReservationConflictValidatorTest extends IntegrationTestSupport {

    @Autowired
    private ReservationManagementService reservationManagementService;

    @Test
    void shouldRejectOverlappingReservationDates() {
        Location location = createLocation("LOC1");
        Member member = createMember("member@crms.local", "Password123");
        var car = createCar(location, "BC-700", "34ABC09");

        ReservationRequest request = new ReservationRequest();
        request.setMemberId(member.getId());
        request.setCarId(car.getId());
        request.setPickupLocationId(location.getId());
        request.setDropoffLocationId(location.getId());
        request.setStartDate(LocalDate.now().plusDays(3));
        request.setEndDate(LocalDate.now().plusDays(5));

        reservationManagementService.createReservation(request);

        ReservationRequest overlapping = new ReservationRequest();
        overlapping.setMemberId(member.getId());
        overlapping.setCarId(car.getId());
        overlapping.setPickupLocationId(location.getId());
        overlapping.setDropoffLocationId(location.getId());
        overlapping.setStartDate(LocalDate.now().plusDays(4));
        overlapping.setEndDate(LocalDate.now().plusDays(6));

        assertThatThrownBy(() -> reservationManagementService.createReservation(overlapping))
                .isInstanceOf(CarUnavailableException.class)
                .hasMessageContaining("not available");
    }

    @Test
    void shouldRejectModificationAfterPickupDate() {
        Location location = createLocation("LOC2");
        Member member = createMember("member2@crms.local", "Password123");
        var car = createCar(location, "BC-701", "34ABC10");

        ReservationRequest request = new ReservationRequest();
        request.setMemberId(member.getId());
        request.setCarId(car.getId());
        request.setPickupLocationId(location.getId());
        request.setDropoffLocationId(location.getId());
        request.setStartDate(LocalDate.now());
        request.setEndDate(LocalDate.now().plusDays(2));

        var created = reservationManagementService.createReservation(request);

        ReservationRequest updateRequest = new ReservationRequest();
        updateRequest.setMemberId(member.getId());
        updateRequest.setCarId(car.getId());
        updateRequest.setPickupLocationId(location.getId());
        updateRequest.setDropoffLocationId(location.getId());
        updateRequest.setStartDate(LocalDate.now().plusDays(1));
        updateRequest.setEndDate(LocalDate.now().plusDays(3));

        assertThatThrownBy(() -> reservationManagementService.updateReservation(created.getId(), updateRequest))
                .isInstanceOf(ReservationConflictException.class)
                .hasMessageContaining("pick-up date");
    }

    @Test
    void shouldRejectInvalidDateRange() {
        Location location = createLocation("LOC3");
        Member member = createMember("member3@crms.local", "Password123");
        var car = createCar(location, "BC-702", "34ABC11");

        ReservationRequest request = new ReservationRequest();
        request.setMemberId(member.getId());
        request.setCarId(car.getId());
        request.setPickupLocationId(location.getId());
        request.setDropoffLocationId(location.getId());
        request.setStartDate(LocalDate.of(2025, 1, 10));
        request.setEndDate(LocalDate.of(2025, 1, 5));

        assertThatThrownBy(() -> reservationManagementService.createReservation(request))
                .isInstanceOf(ReservationConflictException.class)
                .hasMessageContaining("End date");
    }

    @Test
    void shouldRejectReservationWhenCarUnavailableStatus() {
        Location location = createLocation("LOC4");
        Member member = createMember("member4@crms.local", "Password123");
        var car = createCar(location, "BC-703", "34ABC12");
        car.setStatus(CarStatus.UNAVAILABLE);
        carRepository.save(car);

        ReservationRequest request = new ReservationRequest();
        request.setMemberId(member.getId());
        request.setCarId(car.getId());
        request.setPickupLocationId(location.getId());
        request.setDropoffLocationId(location.getId());
        request.setStartDate(LocalDate.now().plusDays(1));
        request.setEndDate(LocalDate.now().plusDays(2));

        assertThatThrownBy(() -> reservationManagementService.createReservation(request))
                .isInstanceOf(CarUnavailableException.class)
                .hasMessageContaining("not available");
    }
}
