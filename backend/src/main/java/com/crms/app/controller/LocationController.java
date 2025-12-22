package com.crms.app.controller;

import com.crms.app.dto.LocationRequest;
import com.crms.app.dto.LocationResponse;
import com.crms.app.service.LocationManagementService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/locations")
public class LocationController {

    private final LocationManagementService locationManagementService;

    public LocationController(LocationManagementService locationManagementService) {
        this.locationManagementService = locationManagementService;
    }

    @GetMapping
    public ResponseEntity<List<LocationResponse>> listLocations() {
        return ResponseEntity.ok(locationManagementService.listLocations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocationResponse> getLocation(@PathVariable Long id) {
        return ResponseEntity.ok(locationManagementService.getLocation(id));
    }

    @PostMapping
    public ResponseEntity<LocationResponse> createLocation(@Valid @RequestBody LocationRequest request) {
        LocationResponse response = locationManagementService.createLocation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LocationResponse> updateLocation(@PathVariable Long id,
                                                           @Valid @RequestBody LocationRequest request) {
        return ResponseEntity.ok(locationManagementService.updateLocation(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
        locationManagementService.deleteLocation(id);
        return ResponseEntity.noContent().build();
    }
}
