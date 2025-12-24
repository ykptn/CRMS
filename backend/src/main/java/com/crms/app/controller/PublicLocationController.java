package com.crms.app.controller;

import com.crms.app.dto.LocationResponse;
import com.crms.app.service.LocationManagementService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/locations")
public class PublicLocationController {

    private final LocationManagementService locationManagementService;

    public PublicLocationController(LocationManagementService locationManagementService) {
        this.locationManagementService = locationManagementService;
    }

    @GetMapping
    public ResponseEntity<List<LocationResponse>> listLocations() {
        return ResponseEntity.ok(locationManagementService.listLocations());
    }
}
