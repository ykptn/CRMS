package com.crms.app.controller;

import com.crms.app.dto.CarResponse;
import com.crms.app.dto.CarSearchCriteria;
import com.crms.app.service.CarBrowsingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cars")
public class CarBrowsingController {

    private final CarBrowsingService carBrowsingService;

    public CarBrowsingController(CarBrowsingService carBrowsingService) {
        this.carBrowsingService = carBrowsingService;
    }

    @GetMapping
    public ResponseEntity<List<CarResponse>> searchCars(@Valid CarSearchCriteria criteria) {
        List<CarResponse> cars = carBrowsingService.searchCars(criteria);
        return ResponseEntity.ok(cars);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarResponse> getCar(@PathVariable Long id) {
        CarResponse response = carBrowsingService.getCar(id);
        return ResponseEntity.ok(response);
    }
}
