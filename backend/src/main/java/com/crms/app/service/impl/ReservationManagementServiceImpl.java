package com.crms.app.service.impl;

import com.crms.app.dto.ReservationRequest;
import com.crms.app.dto.ReservationSummary;
import com.crms.app.exception.CarUnavailableException;
import com.crms.app.exception.ResourceNotFoundException;
import com.crms.app.exception.ReservationConflictException;
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
import com.crms.app.service.ReservationManagementService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

@Service
@Transactional
public class ReservationManagementServiceImpl implements ReservationManagementService {

    private final ReservationRepository reservationRepository;
    private final CarRepository carRepository;
    private final MemberRepository memberRepository;
    private final LocationRepository locationRepository;
    private final ServiceRepository serviceRepository;
    private final EquipmentRepository equipmentRepository;
    private final ReservationMapper reservationMapper;

    public ReservationManagementServiceImpl(ReservationRepository reservationRepository,
                                            CarRepository carRepository,
                                            MemberRepository memberRepository,
                                            LocationRepository locationRepository,
                                            ServiceRepository serviceRepository,
                                            EquipmentRepository equipmentRepository,
                                            ReservationMapper reservationMapper) {
        this.reservationRepository = reservationRepository;
        this.carRepository = carRepository;
        this.memberRepository = memberRepository;
        this.locationRepository = locationRepository;
        this.serviceRepository = serviceRepository;
        this.equipmentRepository = equipmentRepository;
        this.reservationMapper = reservationMapper;
    }

    @Override
    public ReservationSummary createReservation(ReservationRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());
        Member member = findMember(request.getMemberId());
        ensureMemberHasLicense(member);
        Car car = findCar(request.getCarId());
        ensureCarAvailable(car.getId(), request.getStartDate(), request.getEndDate());

        Reservation reservation = new Reservation();
        reservation.setReservationNumber(UUID.randomUUID().toString());
        reservation.setMember(member);
        reservation.setCar(car);
        reservation.setPickupLocation(findLocation(request.getPickupLocationId()));
        reservation.setDropoffLocation(findLocation(request.getDropoffLocationId()));
        reservation.setStartDate(request.getStartDate());
        reservation.setEndDate(request.getEndDate());
        reservation.setAdditionalServices(resolveServices(request.getAdditionalServiceIds()));
        reservation.setEquipments(resolveEquipment(request.getEquipmentIds()));
        reservation.setTotalCost(calculateTotalCost(reservation));

        Reservation saved = reservationRepository.save(reservation);
        return reservationMapper.toSummary(saved);
    }

    @Override
    public ReservationSummary updateReservation(Long reservationId, ReservationRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());
        Reservation reservation = findReservation(reservationId);
        ensureModifiable(reservation);
        Member member = findMember(request.getMemberId());
        ensureMemberHasLicense(member);
        Car car = findCar(request.getCarId());

        boolean availabilityConflict = reservationRepository.existsOverlappingReservationExcludingId(
                car.getId(),
                reservation.getId(),
                ReservationStatus.ACTIVE,
                request.getStartDate(),
                request.getEndDate());
        if (availabilityConflict) {
            throw new CarUnavailableException("Car is not available for the selected dates.");
        }

        reservation.setMember(member);
        reservation.setCar(car);
        reservation.setPickupLocation(findLocation(request.getPickupLocationId()));
        reservation.setDropoffLocation(findLocation(request.getDropoffLocationId()));
        reservation.setStartDate(request.getStartDate());
        reservation.setEndDate(request.getEndDate());
        reservation.setAdditionalServices(resolveServices(request.getAdditionalServiceIds()));
        reservation.setEquipments(resolveEquipment(request.getEquipmentIds()));
        reservation.setTotalCost(calculateTotalCost(reservation));

        Reservation saved = reservationRepository.save(reservation);
        return reservationMapper.toSummary(saved);
    }

    @Override
    public ReservationSummary cancelReservation(Long reservationId) {
        Reservation reservation = findReservation(reservationId);
        ensureModifiable(reservation);
        reservation.setStatus(ReservationStatus.CANCELED);
        Reservation saved = reservationRepository.save(reservation);
        return reservationMapper.toSummary(saved);
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new ReservationConflictException("Start date and end date are required.");
        }
        if (endDate.isBefore(startDate)) {
            throw new ReservationConflictException("End date must be on or after the start date.");
        }
    }

    private void ensureModifiable(Reservation reservation) {
        LocalDate today = LocalDate.now();
        if (!reservation.getStartDate().isAfter(today)) {
            throw new ReservationConflictException("Reservation cannot be modified after pick-up date.");
        }
        if (reservation.getStatus() == ReservationStatus.CANCELED) {
            throw new ReservationConflictException("Reservation is already canceled.");
        }
    }

    private void ensureCarAvailable(Long carId, LocalDate startDate, LocalDate endDate) {
        boolean conflict = reservationRepository.existsOverlappingReservation(
                carId,
                ReservationStatus.ACTIVE,
                startDate,
                endDate);
        if (conflict) {
            throw new CarUnavailableException("Car is not available for the selected dates.");
        }
    }

    private Member findMember(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + memberId));
    }

    private Car findCar(Long carId) {
        return carRepository.findById(carId)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found: " + carId));
    }

    private Location findLocation(Long locationId) {
        return locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + locationId));
    }

    private Set<AdditionalService> resolveServices(List<Long> serviceIds) {
        if (CollectionUtils.isEmpty(serviceIds)) {
            return new HashSet<>();
        }
        return new HashSet<>(serviceRepository.findAllById(serviceIds));
    }

    private Set<Equipment> resolveEquipment(List<Long> equipmentIds) {
        if (CollectionUtils.isEmpty(equipmentIds)) {
            return new HashSet<>();
        }
        return new HashSet<>(equipmentRepository.findAllById(equipmentIds));
    }

    private void ensureMemberHasLicense(Member member) {
        if (!StringUtils.hasText(member.getDrivingLicenseNumber())) {
            throw new ReservationConflictException("Member must provide a valid driving license number.");
        }
    }

    private Reservation findReservation(Long reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + reservationId));
    }

    private BigDecimal calculateTotalCost(Reservation reservation) {
        long rentalDays = Math.max(1, ChronoUnit.DAYS.between(
                reservation.getStartDate(),
                reservation.getEndDate()));
        BigDecimal days = BigDecimal.valueOf(rentalDays);
        BigDecimal carCost = reservation.getCar().getDailyRate().multiply(days);
        BigDecimal addOnCost = sumAddOnCosts(reservation).multiply(days);
        return carCost.add(addOnCost);
    }

    private BigDecimal sumAddOnCosts(Reservation reservation) {
        BigDecimal serviceCost = reservation.getAdditionalServices().stream()
                .map(AdditionalService::getDailyPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal equipmentCost = reservation.getEquipments().stream()
                .map(Equipment::getDailyPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return serviceCost.add(equipmentCost);
    }
}
