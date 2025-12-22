package com.crms.app.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.crms.app.dto.ReservationRequest;
import com.crms.app.model.Location;
import com.crms.app.model.Member;
import com.crms.app.model.ReservationStatus;
import com.crms.app.support.IntegrationTestSupport;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class ReservationStatusFilterServiceTest extends IntegrationTestSupport {

    @Autowired
    private ReportingService reportingService;

    @Autowired
    private ReservationManagementService reservationManagementService;

    @Test
    void shouldListAndFilterReservations() {
        Location location = createLocation("LOC1");
        Member member = createMember("member@crms.local", "Password123");
        var car = createCar(location, "BC-500", "34ABC05");

        ReservationRequest request = new ReservationRequest();
        request.setMemberId(member.getId());
        request.setCarId(car.getId());
        request.setPickupLocationId(location.getId());
        request.setDropoffLocationId(location.getId());
        request.setStartDate(LocalDate.now().plusDays(3));
        request.setEndDate(LocalDate.now().plusDays(4));

        reservationManagementService.createReservation(request);

        var all = reportingService.listReservations(null);
        var active = reportingService.listReservations(ReservationStatus.ACTIVE);

        assertThat(all).isNotEmpty();
        assertThat(active).isNotEmpty();
    }

    @Test
    void shouldExportReservationsAsCsvAndPdf() {
        Location location = createLocation("LOC2");
        Member member = createMember("member2@crms.local", "Password123");
        var car = createCar(location, "BC-501", "34ABC06");

        ReservationRequest request = new ReservationRequest();
        request.setMemberId(member.getId());
        request.setCarId(car.getId());
        request.setPickupLocationId(location.getId());
        request.setDropoffLocationId(location.getId());
        request.setStartDate(LocalDate.now().plusDays(5));
        request.setEndDate(LocalDate.now().plusDays(6));

        reservationManagementService.createReservation(request);

        byte[] csv = reportingService.exportReservationsCsv(null);
        byte[] pdf = reportingService.exportReservationsPdf(null);

        assertThat(new String(csv, java.nio.charset.StandardCharsets.UTF_8))
                .contains("reservationNumber,status,startDate,endDate,totalCost,memberId,carId,pickupLocationId,dropoffLocationId");
        assertThat(pdf).isNotEmpty();
    }
}
