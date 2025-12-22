package com.crms.app.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.crms.app.dto.CarSearchCriteria;
import com.crms.app.mapper.CarMapper;
import com.crms.app.model.Car;
import com.crms.app.model.ReservationStatus;
import com.crms.app.repository.CarRepository;
import com.crms.app.repository.ReservationRepository;
import com.crms.app.service.impl.CarBrowsingServiceImpl;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CarSearchServiceTest {

    @Mock
    private CarRepository carRepository;

    @Mock
    private ReservationRepository reservationRepository;

    private CarBrowsingServiceImpl carBrowsingService;

    @BeforeEach
    void setup() {
        carBrowsingService = new CarBrowsingServiceImpl(carRepository, new CarMapper(), reservationRepository);
    }

    @Test
    void shouldReturnOnlyAvailableCarsForDateRange() {
        CarSearchCriteria criteria = new CarSearchCriteria();
        criteria.setStartDate(LocalDate.of(2025, 1, 10));
        criteria.setEndDate(LocalDate.of(2025, 1, 15));

        Car available = new Car();
        available.setId(1L);
        available.setMake("Toyota");

        Car unavailable = new Car();
        unavailable.setId(2L);
        unavailable.setMake("Honda");

        when(carRepository.findAll(any())).thenReturn(List.of(available, unavailable));
        when(reservationRepository.existsOverlappingReservation(
                eq(1L),
                eq(ReservationStatus.ACTIVE),
                eq(criteria.getStartDate()),
                eq(criteria.getEndDate()))).thenReturn(false);
        when(reservationRepository.existsOverlappingReservation(
                eq(2L),
                eq(ReservationStatus.ACTIVE),
                eq(criteria.getStartDate()),
                eq(criteria.getEndDate()))).thenReturn(true);

        var results = carBrowsingService.searchCars(criteria);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo(1L);
    }
}
