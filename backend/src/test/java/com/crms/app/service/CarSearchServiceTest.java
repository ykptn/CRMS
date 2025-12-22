package com.crms.app.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.crms.app.dto.CarSearchCriteria;
import com.crms.app.model.Location;
import com.crms.app.support.IntegrationTestSupport;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class CarSearchServiceTest extends IntegrationTestSupport {

    @Autowired
    private CarBrowsingService carBrowsingService;

    @Autowired
    private ReservationManagementService reservationManagementService;

    @Autowired
    private com.crms.app.repository.CarRepository carRepository;

    @Test
    void shouldReturnOnlyAvailableCarsForDateRange() {
        Location location = createLocation("LOC1");
        var available = createCar(location, "BC-1100", "34ABC16");
        var unavailable = createCar(location, "BC-1101", "34ABC17");

        var member = createMember("member@crms.local", "Password123");

        var request = new com.crms.app.dto.ReservationRequest();
        request.setMemberId(member.getId());
        request.setCarId(unavailable.getId());
        request.setPickupLocationId(location.getId());
        request.setDropoffLocationId(location.getId());
        request.setStartDate(LocalDate.of(2025, 1, 10));
        request.setEndDate(LocalDate.of(2025, 1, 15));
        reservationManagementService.createReservation(request);

        CarSearchCriteria criteria = new CarSearchCriteria();
        criteria.setStartDate(LocalDate.of(2025, 1, 10));
        criteria.setEndDate(LocalDate.of(2025, 1, 15));
        criteria.setLocationId(location.getId());

        var results = carBrowsingService.searchCars(criteria);

        assertThat(results).extracting("id").contains(available.getId());
        assertThat(results).extracting("id").doesNotContain(unavailable.getId());
    }

    @Test
    void shouldApplyLimitWhenSizeProvided() {
        Location location = createLocation("LOC2");
        createCar(location, "BC-1200", "34ABC18");
        createCar(location, "BC-1201", "34ABC19");
        createCar(location, "BC-1202", "34ABC20");

        CarSearchCriteria criteria = new CarSearchCriteria();
        criteria.setLocationId(location.getId());
        criteria.setSize(2);

        var results = carBrowsingService.searchCars(criteria);

        assertThat(results.size()).isLessThanOrEqualTo(2);
    }

    @Test
    void shouldFilterByMakeModelTypeAndPriceRange() {
        Location location = createLocation("LOC3");
        var matching = createCar(location, "BC-1300", "34ABC21");
        matching.setMake("Toyota");
        matching.setModel("Corolla");
        matching.setCarType("Sedan");
        matching.setDailyRate(java.math.BigDecimal.valueOf(150));
        carRepository.save(matching);

        var nonMatching = createCar(location, "BC-1301", "34ABC22");
        nonMatching.setMake("Honda");
        nonMatching.setModel("Civic");
        nonMatching.setCarType("Hatchback");
        nonMatching.setDailyRate(java.math.BigDecimal.valueOf(300));
        carRepository.save(nonMatching);

        CarSearchCriteria criteria = new CarSearchCriteria();
        criteria.setLocationId(location.getId());
        criteria.setMake("Toyota");
        criteria.setModel("Corolla");
        criteria.setCarType("Sedan");
        criteria.setMinDailyRate(java.math.BigDecimal.valueOf(100));
        criteria.setMaxDailyRate(java.math.BigDecimal.valueOf(200));

        var results = carBrowsingService.searchCars(criteria);

        assertThat(results).extracting("id").contains(matching.getId());
        assertThat(results).extracting("id").doesNotContain(nonMatching.getId());
    }
}
