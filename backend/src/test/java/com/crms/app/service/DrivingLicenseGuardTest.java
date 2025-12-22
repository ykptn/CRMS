package com.crms.app.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.crms.app.dto.ReservationRequest;
import com.crms.app.exception.ReservationConflictException;
import com.crms.app.mapper.ReservationMapper;
import com.crms.app.model.Member;
import com.crms.app.repository.CarRepository;
import com.crms.app.repository.EquipmentRepository;
import com.crms.app.repository.LocationRepository;
import com.crms.app.repository.MemberRepository;
import com.crms.app.repository.ReservationRepository;
import com.crms.app.repository.ServiceRepository;
import com.crms.app.service.impl.ReservationManagementServiceImpl;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DrivingLicenseGuardTest {

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
    void shouldBlockReservationWhenLicenseMissing() {
        ReservationRequest request = new ReservationRequest();
        request.setMemberId(1L);
        request.setCarId(2L);
        request.setPickupLocationId(3L);
        request.setDropoffLocationId(4L);
        request.setStartDate(LocalDate.of(2025, 1, 10));
        request.setEndDate(LocalDate.of(2025, 1, 12));

        Member member = new Member();
        member.setId(1L);
        member.setDrivingLicenseNumber("");

        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        assertThatThrownBy(() -> reservationManagementService.createReservation(request))
                .isInstanceOf(ReservationConflictException.class)
                .hasMessageContaining("driving license");
    }
}
