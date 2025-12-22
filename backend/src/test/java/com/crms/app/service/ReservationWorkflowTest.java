package com.crms.app.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.crms.app.dto.ReservationRequest;
import com.crms.app.dto.ReservationSummary;
import com.crms.app.model.Location;
import com.crms.app.model.Member;
import com.crms.app.model.ReservationStatus;
import com.crms.app.support.InMemoryMailSender;
import com.crms.app.support.IntegrationTestSupport;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class ReservationWorkflowTest extends IntegrationTestSupport {

    @Autowired
    private ReservationManagementService reservationManagementService;

    @Autowired
    private InMemoryMailSender mailSender;

    @BeforeEach
    void clearMailbox() {
        mailSender.clear();
    }

    @Test
    void shouldCreateReservationAndNotifyMember() {
        Location location = createLocation("LOC1");
        Member member = createMember("member@crms.local", "Password123");
        var car = createCar(location, "BC-600", "34ABC06");

        var service = createService("Insurance", java.math.BigDecimal.valueOf(10));
        var equipment = createEquipment("GPS", java.math.BigDecimal.valueOf(5));

        ReservationRequest request = new ReservationRequest();
        request.setMemberId(member.getId());
        request.setCarId(car.getId());
        request.setPickupLocationId(location.getId());
        request.setDropoffLocationId(location.getId());
        request.setStartDate(LocalDate.now().plusDays(1));
        request.setEndDate(LocalDate.now().plusDays(4));
        request.setAdditionalServiceIds(java.util.List.of(service.getId()));
        request.setEquipmentIds(java.util.List.of(equipment.getId()));

        ReservationSummary summary = reservationManagementService.createReservation(request);

        assertThat(summary.getReservationNumber()).isNotBlank();
        assertThat(summary.getStatus()).isEqualTo(ReservationStatus.ACTIVE);
        assertThat(summary.getTotalCost()).isEqualByComparingTo("345");
        assertThat(mailSender.getSentMessages()).isNotEmpty();
    }

    @Test
    void shouldUpdateAndCancelReservation() {
        Location location = createLocation("LOC2");
        Member member = createMember("member2@crms.local", "Password123");
        var car = createCar(location, "BC-601", "34ABC07");

        ReservationRequest createRequest = new ReservationRequest();
        createRequest.setMemberId(member.getId());
        createRequest.setCarId(car.getId());
        createRequest.setPickupLocationId(location.getId());
        createRequest.setDropoffLocationId(location.getId());
        createRequest.setStartDate(LocalDate.now().plusDays(5));
        createRequest.setEndDate(LocalDate.now().plusDays(7));

        ReservationSummary created = reservationManagementService.createReservation(createRequest);

        ReservationRequest updateRequest = new ReservationRequest();
        updateRequest.setMemberId(member.getId());
        updateRequest.setCarId(car.getId());
        updateRequest.setPickupLocationId(location.getId());
        updateRequest.setDropoffLocationId(location.getId());
        updateRequest.setStartDate(LocalDate.now().plusDays(6));
        updateRequest.setEndDate(LocalDate.now().plusDays(8));

        ReservationSummary updated = reservationManagementService.updateReservation(created.getId(), updateRequest);
        ReservationSummary canceled = reservationManagementService.cancelReservation(created.getId());

        assertThat(updated.getTotalCost()).isNotNull();
        assertThat(canceled.getStatus()).isEqualTo(ReservationStatus.CANCELED);
        assertThat(mailSender.getSentMessages().size()).isGreaterThanOrEqualTo(2);
    }

    @Test
    void shouldCompleteReservation() {
        Location location = createLocation("LOC3");
        Member member = createMember("member3@crms.local", "Password123");
        var car = createCar(location, "BC-602", "34ABC08");

        ReservationRequest request = new ReservationRequest();
        request.setMemberId(member.getId());
        request.setCarId(car.getId());
        request.setPickupLocationId(location.getId());
        request.setDropoffLocationId(location.getId());
        request.setStartDate(LocalDate.now().minusDays(4));
        request.setEndDate(LocalDate.now().minusDays(2));

        ReservationSummary created = reservationManagementService.createReservation(request);
        ReservationSummary completed = reservationManagementService.completeReservation(created.getId());

        assertThat(completed.getStatus()).isEqualTo(ReservationStatus.COMPLETED);
    }
}
