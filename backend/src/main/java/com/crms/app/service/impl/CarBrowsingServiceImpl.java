package com.crms.app.service.impl;

import com.crms.app.dto.CarResponse;
import com.crms.app.dto.CarSearchCriteria;
import com.crms.app.exception.ReservationConflictException;
import com.crms.app.mapper.CarMapper;
import com.crms.app.model.Car;
import com.crms.app.model.ReservationStatus;
import com.crms.app.repository.CarRepository;
import com.crms.app.repository.ReservationRepository;
import com.crms.app.service.CarBrowsingService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional(readOnly = true)
public class CarBrowsingServiceImpl implements CarBrowsingService {

    private final CarRepository carRepository;
    private final CarMapper carMapper;
    private final ReservationRepository reservationRepository;

    public CarBrowsingServiceImpl(CarRepository carRepository,
                                  CarMapper carMapper,
                                  ReservationRepository reservationRepository) {
        this.carRepository = carRepository;
        this.carMapper = carMapper;
        this.reservationRepository = reservationRepository;
    }

    @Override
    public List<CarResponse> searchCars(CarSearchCriteria criteria) {
        Specification<Car> specification = buildSpecification(criteria);
        List<Car> cars = carRepository.findAll(specification);
        if (criteria == null || criteria.getStartDate() == null || criteria.getEndDate() == null) {
            return cars.stream()
                    .map(carMapper::toResponse)
                    .toList();
        }

        validateDateRange(criteria.getStartDate(), criteria.getEndDate());
        return cars.stream()
                .filter(car -> isAvailable(car.getId(), criteria.getStartDate(), criteria.getEndDate()))
                .map(carMapper::toResponse)
                .toList();
    }

    @Override
    public CarResponse getCar(Long id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Car not found: " + id));
        return carMapper.toResponse(car);
    }

    private Specification<Car> buildSpecification(CarSearchCriteria criteria) {
        return (root, query, builder) -> {
            if (criteria == null) {
                return builder.conjunction();
            }
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(criteria.getMake())) {
                predicates.add(builder.like(
                        builder.lower(root.get("make")),
                        "%" + criteria.getMake().toLowerCase() + "%"));
            }

            if (StringUtils.hasText(criteria.getModel())) {
                predicates.add(builder.like(
                        builder.lower(root.get("model")),
                        "%" + criteria.getModel().toLowerCase() + "%"));
            }

            if (criteria.getMinYear() != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("modelYear"), criteria.getMinYear()));
            }

            if (criteria.getMaxYear() != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("modelYear"), criteria.getMaxYear()));
            }

            if (criteria.getMinDailyRate() != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("dailyRate"), criteria.getMinDailyRate()));
            }

            if (criteria.getMaxDailyRate() != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("dailyRate"), criteria.getMaxDailyRate()));
            }

            if (criteria.getSeats() != null) {
                predicates.add(builder.equal(root.get("seats"), criteria.getSeats()));
            }

            if (StringUtils.hasText(criteria.getTransmission())) {
                predicates.add(builder.equal(
                        builder.lower(root.get("transmission")),
                        criteria.getTransmission().toLowerCase()));
            }

            if (StringUtils.hasText(criteria.getFuelType())) {
                predicates.add(builder.equal(
                        builder.lower(root.get("fuelType")),
                        criteria.getFuelType().toLowerCase()));
            }

            if (criteria.getGpsIncluded() != null) {
                predicates.add(builder.equal(root.get("gpsIncluded"), criteria.getGpsIncluded()));
            }

            if (criteria.getChildSeat() != null) {
                predicates.add(builder.equal(root.get("childSeat"), criteria.getChildSeat()));
            }

            if (criteria.getStatus() != null) {
                predicates.add(builder.equal(root.get("status"), criteria.getStatus()));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private boolean isAvailable(Long carId, LocalDate startDate, LocalDate endDate) {
        return !reservationRepository.existsOverlappingReservation(
                carId,
                ReservationStatus.ACTIVE,
                startDate,
                endDate);
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new ReservationConflictException("End date must be on or after the start date.");
        }
    }
}
