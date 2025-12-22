package com.crms.app.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.crms.app.dto.ReservationRequest;
import com.crms.app.exception.CarUnavailableException;
import com.crms.app.exception.ReservationConflictException;
import com.crms.app.mapper.ReservationMapper;
import com.crms.app.model.Car;
import com.crms.app.model.Location;
import com.crms.app.model.Member;
import com.crms.app.model.Reservation;
import com.crms.app.model.ReservationStatus;
import com.crms.app.repository.CarRepository;
import com.crms.app.repository.EquipmentRepository;
import com.crms.app.repository.LocationRepository;
import com.crms.app.repository.MemberRepository;
import com.crms.app.repository.ReservationRepository;
import com.crms.app.repository.ServiceRepository;
import com.crms.app.service.impl.ReservationManagementServiceImpl;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReservationConflictValidatorTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private CarRepository carRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private NotificationService notificationService;

    private ReservationManagementServiceImpl reservationManagementService;

    @BeforeEach
    void setup() {
        reservationManagementService = new ReservationManagementServiceImpl(
                reservationRepository,
                carRepository,
                memberRepository,
                locationRepository,
                serviceRepository,
                equipmentRepository,
                new ReservationMapper(),
                notificationService);
    }

    @Test
    void shouldRejectOverlappingReservationDates() {
        ReservationRequest request = new ReservationRequest();
        request.setMemberId(1L);
        request.setCarId(2L);
        request.setPickupLocationId(3L);
        request.setDropoffLocationId(4L);
        request.setStartDate(LocalDate.of(2025, 1, 10));
        request.setEndDate(LocalDate.of(2025, 1, 15));

        Member member = new Member();
        member.setId(1L);
        member.setDrivingLicenseNumber("DL12345");

        Car car = new Car();
        car.setId(2L);
        car.setDailyRate(BigDecimal.valueOf(100));

        Location location = new Location();
        location.setId(3L);

        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(carRepository.findById(2L)).thenReturn(Optional.of(car));
        when(locationRepository.findById(3L)).thenReturn(Optional.of(location));
        when(locationRepository.findById(4L)).thenReturn(Optional.of(location));
        when(reservationRepository.existsOverlappingReservation(
                eq(2L),
                eq(ReservationStatus.ACTIVE),
                eq(request.getStartDate()),
                eq(request.getEndDate()))).thenReturn(true);

        assertThatThrownBy(() -> reservationManagementService.createReservation(request))
                .isInstanceOf(CarUnavailableException.class)
                .hasMessageContaining("not available");
    }

    @Test
    void shouldRejectModificationAfterPickupDate() {
        Reservation reservation = new Reservation();
        reservation.setId(10L);
        reservation.setStartDate(LocalDate.now());
        reservation.setEndDate(LocalDate.now().plusDays(2));
        reservation.setStatus(ReservationStatus.ACTIVE);

        when(reservationRepository.findById(10L)).thenReturn(Optional.of(reservation));

        ReservationRequest request = new ReservationRequest();
        request.setStartDate(LocalDate.now().plusDays(1));
        request.setEndDate(LocalDate.now().plusDays(2));

        assertThatThrownBy(() -> reservationManagementService.updateReservation(10L, request))
                .isInstanceOf(ReservationConflictException.class)
                .hasMessageContaining("pick-up date");
    }
}
