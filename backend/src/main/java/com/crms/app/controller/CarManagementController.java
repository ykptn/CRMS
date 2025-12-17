package com.crms.app.controller;

import com.crms.app.dto.CarRequest;
import com.crms.app.dto.CarResponse;
import com.crms.app.dto.CarStatusUpdateRequest;
import com.crms.app.service.CarManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/cars")
public class CarManagementController {

    private final CarManagementService carManagementService;

    public CarManagementController(CarManagementService carManagementService) {
        this.carManagementService = carManagementService;
    }

    @PostMapping
    public ResponseEntity<CarResponse> createCar(@Valid @RequestBody CarRequest request) {
        CarResponse response = carManagementService.createCar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarResponse> updateCar(@PathVariable Long id,
                                                 @Valid @RequestBody CarRequest request) {
        CarResponse response = carManagementService.updateCar(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CarResponse> updateStatus(@PathVariable Long id,
                                                    @Valid @RequestBody CarStatusUpdateRequest request) {
        CarResponse response = carManagementService.updateStatus(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCar(@PathVariable Long id) {
        carManagementService.deleteCar(id);
        return ResponseEntity.noContent().build();
    }
}
