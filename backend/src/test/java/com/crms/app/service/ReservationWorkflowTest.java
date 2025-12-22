package com.crms.app.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.crms.app.dto.ReservationRequest;
import com.crms.app.dto.ReservationSummary;
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
class ReservationWorkflowTest {

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
    void shouldCreateReservationAndNotifyMember() {
        ReservationRequest request = new ReservationRequest();
        request.setMemberId(10L);
        request.setCarId(20L);
        request.setPickupLocationId(30L);
        request.setDropoffLocationId(40L);
        request.setStartDate(LocalDate.of(2025, 1, 1));
        request.setEndDate(LocalDate.of(2025, 1, 4));
        request.setAdditionalServiceIds(List.of(1L));
        request.setEquipmentIds(List.of(2L));

        Member member = new Member();
        member.setId(10L);
        member.setEmail("member@crms.local");
        member.setDrivingLicenseNumber("ABC123");

        Car car = new Car();
        car.setId(20L);
        car.setMake("Toyota");
        car.setModel("Corolla");
        car.setLicensePlate("34ABC01");
        car.setDailyRate(BigDecimal.valueOf(100));

        Location pickup = new Location();
        pickup.setId(30L);
        pickup.setName("Levent");
        pickup.setCode("LEV");

        Location dropoff = new Location();
        dropoff.setId(40L);
        dropoff.setName("Kadikoy");
        dropoff.setCode("KAD");

        AdditionalService service = new AdditionalService();
        service.setId(1L);
        service.setDailyPrice(BigDecimal.valueOf(10));

        Equipment equipment = new Equipment();
        equipment.setId(2L);
        equipment.setDailyPrice(BigDecimal.valueOf(5));

        when(memberRepository.findById(10L)).thenReturn(Optional.of(member));
        when(carRepository.findById(20L)).thenReturn(Optional.of(car));
        when(locationRepository.findById(30L)).thenReturn(Optional.of(pickup));
        when(locationRepository.findById(40L)).thenReturn(Optional.of(dropoff));
        when(serviceRepository.findAllById(List.of(1L))).thenReturn(List.of(service));
        when(equipmentRepository.findAllById(List.of(2L))).thenReturn(List.of(equipment));
        when(reservationRepository.existsOverlappingReservation(
                eq(20L),
                eq(ReservationStatus.ACTIVE),
                eq(request.getStartDate()),
                eq(request.getEndDate())))
                .thenReturn(false);
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> {
            Reservation reservation = invocation.getArgument(0);
            reservation.setId(99L);
            return reservation;
        });

        ReservationSummary summary = reservationManagementService.createReservation(request);

        ArgumentCaptor<Reservation> reservationCaptor = ArgumentCaptor.forClass(Reservation.class);
        verify(reservationRepository).save(reservationCaptor.capture());
        Reservation savedReservation = reservationCaptor.getValue();

        assertThat(savedReservation.getReservationNumber()).isNotBlank();
        assertThat(savedReservation.getTotalCost()).isEqualByComparingTo("345");
        assertThat(summary.getTotalCost()).isEqualByComparingTo("345");
        verify(notificationService).sendReservationNotification(savedReservation, "CREATED");
    }
}
