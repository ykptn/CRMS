package com.crms.app.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.crms.app.model.Car;
import com.crms.app.model.Location;
import com.crms.app.model.Member;
import com.crms.app.model.Reservation;
import com.crms.app.support.InMemoryMailSender;
import com.crms.app.support.IntegrationTestSupport;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class NotificationServiceTest extends IntegrationTestSupport {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private InMemoryMailSender mailSender;

    @BeforeEach
    void clearMailbox() {
        mailSender.clear();
    }

    @Test
    void shouldSendReservationEmailWhenEnabled() {
        Reservation reservation = buildReservation();

        notificationService.sendReservationNotification(reservation, "CREATED");

        assertThat(mailSender.getSentMessages()).hasSize(1);
        var message = mailSender.getSentMessages().get(0);
        assertThat(message.getTo()).containsExactly("member@crms.local");
        assertThat(message.getSubject()).contains("CREATED");
    }

    private Reservation buildReservation() {
        Member member = new Member();
        member.setEmail("member@crms.local");

        Car car = new Car();
        car.setMake("Toyota");
        car.setModel("Corolla");
        car.setLicensePlate("34ABC01");

        Location pickup = new Location();
        pickup.setName("Levent");
        pickup.setCode("LEV");

        Location dropoff = new Location();
        dropoff.setName("Kadikoy");
        dropoff.setCode("KAD");

        Reservation reservation = new Reservation();
        reservation.setReservationNumber("RES-123");
        reservation.setMember(member);
        reservation.setCar(car);
        reservation.setPickupLocation(pickup);
        reservation.setDropoffLocation(dropoff);
        reservation.setStartDate(LocalDate.of(2025, 1, 1));
        reservation.setEndDate(LocalDate.of(2025, 1, 3));
        reservation.setTotalCost(BigDecimal.valueOf(300));
        return reservation;
    }
}
