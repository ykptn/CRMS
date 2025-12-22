package com.crms.app.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.crms.app.dto.ReservationRequest;
import com.crms.app.mapper.ReservationMapper;
import com.crms.app.model.AdditionalService;
import com.crms.app.model.Car;
import com.crms.app.model.Equipment;
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
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdditionalServiceSelectionTest {

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
    void shouldStoreSelectedExtrasOnReservation() {
        ReservationRequest request = new ReservationRequest();
        request.setMemberId(1L);
        request.setCarId(2L);
        request.setPickupLocationId(3L);
        request.setDropoffLocationId(4L);
        request.setStartDate(LocalDate.of(2025, 2, 1));
        request.setEndDate(LocalDate.of(2025, 2, 3));
        request.setAdditionalServiceIds(List.of(10L));
        request.setEquipmentIds(List.of(20L));

        Member member = new Member();
        member.setId(1L);
        member.setDrivingLicenseNumber("DL12345");

        Car car = new Car();
        car.setId(2L);
        car.setDailyRate(BigDecimal.valueOf(100));

        Location location = new Location();
        location.setId(3L);

        AdditionalService service = new AdditionalService();
        service.setId(10L);
        service.setDailyPrice(BigDecimal.valueOf(15));

        Equipment equipment = new Equipment();
        equipment.setId(20L);
        equipment.setDailyPrice(BigDecimal.valueOf(5));

        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(carRepository.findById(2L)).thenReturn(Optional.of(car));
        when(locationRepository.findById(3L)).thenReturn(Optional.of(location));
        when(locationRepository.findById(4L)).thenReturn(Optional.of(location));
        when(serviceRepository.findAllById(List.of(10L))).thenReturn(List.of(service));
        when(equipmentRepository.findAllById(List.of(20L))).thenReturn(List.of(equipment));
        when(reservationRepository.existsOverlappingReservation(
                eq(2L),
                eq(ReservationStatus.ACTIVE),
                eq(request.getStartDate()),
                eq(request.getEndDate()))).thenReturn(false);
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        reservationManagementService.createReservation(request);

        ArgumentCaptor<Reservation> captor = ArgumentCaptor.forClass(Reservation.class);
        verify(reservationRepository).save(captor.capture());
        Reservation saved = captor.getValue();

        assertThat(saved.getAdditionalServices()).hasSize(1);
        assertThat(saved.getAdditionalServices().iterator().next().getId()).isEqualTo(10L);
        assertThat(saved.getEquipments()).hasSize(1);
        assertThat(saved.getEquipments().iterator().next().getId()).isEqualTo(20L);
    }
}
