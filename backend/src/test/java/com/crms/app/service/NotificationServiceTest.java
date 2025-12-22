package com.crms.app.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.crms.app.config.NotificationProperties;
import com.crms.app.model.Car;
import com.crms.app.model.Location;
import com.crms.app.model.Member;
import com.crms.app.model.Reservation;
import com.crms.app.service.impl.NotificationServiceImpl;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private NotificationProperties properties;
    private NotificationServiceImpl notificationService;

    @BeforeEach
    void setup() {
        properties = new NotificationProperties();
        properties.setEnabled(true);
        properties.setFrom("no-reply@crms.local");
        properties.setSubjectPrefix("CRMS Reservation");
        notificationService = new NotificationServiceImpl(mailSender, properties);
    }

    @Test
    void shouldSendReservationEmailWhenEnabled() {
        Reservation reservation = buildReservation();

        notificationService.sendReservationNotification(reservation, "CREATED");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        SimpleMailMessage message = captor.getValue();

        assertThat(message.getTo()).containsExactly("member@crms.local");
        assertThat(message.getFrom()).isEqualTo("no-reply@crms.local");
        assertThat(message.getSubject()).contains("CREATED");
        assertThat(message.getText()).contains("Reservation number");
    }

    @Test
    void shouldSkipEmailWhenDisabled() {
        properties.setEnabled(false);

        notificationService.sendReservationNotification(buildReservation(), "CANCELED");

        verifyNoInteractions(mailSender);
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
