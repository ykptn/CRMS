package com.crms.app.controller;

import com.crms.app.dto.AdditionalServiceRequest;
import com.crms.app.dto.AdditionalServiceResponse;
import com.crms.app.dto.EquipmentRequest;
import com.crms.app.dto.EquipmentResponse;
import com.crms.app.service.ServiceSelectionService;
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
@RequestMapping("/api")
public class ServiceSelectionController {

    private final ServiceSelectionService serviceSelectionService;

    public ServiceSelectionController(ServiceSelectionService serviceSelectionService) {
        this.serviceSelectionService = serviceSelectionService;
    }

    @GetMapping("/services")
    public ResponseEntity<List<AdditionalServiceResponse>> listServices() {
        return ResponseEntity.ok(serviceSelectionService.listServices());
    }

    @GetMapping("/equipment")
    public ResponseEntity<List<EquipmentResponse>> listEquipment() {
        return ResponseEntity.ok(serviceSelectionService.listEquipment());
    }

    @GetMapping("/admin/services")
    public ResponseEntity<List<AdditionalServiceResponse>> listAdminServices() {
        return ResponseEntity.ok(serviceSelectionService.listServices());
    }

    @GetMapping("/admin/services/{id}")
    public ResponseEntity<AdditionalServiceResponse> getService(@PathVariable Long id) {
        return ResponseEntity.ok(serviceSelectionService.getService(id));
    }

    @PostMapping("/admin/services")
    public ResponseEntity<AdditionalServiceResponse> createService(
            @Valid @RequestBody AdditionalServiceRequest request) {
        AdditionalServiceResponse response = serviceSelectionService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/admin/services/{id}")
    public ResponseEntity<AdditionalServiceResponse> updateService(@PathVariable Long id,
                                                                   @Valid @RequestBody AdditionalServiceRequest request) {
        return ResponseEntity.ok(serviceSelectionService.updateService(id, request));
    }

    @DeleteMapping("/admin/services/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceSelectionService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/equipment")
    public ResponseEntity<List<EquipmentResponse>> listAdminEquipment() {
        return ResponseEntity.ok(serviceSelectionService.listEquipment());
    }

    @GetMapping("/admin/equipment/{id}")
    public ResponseEntity<EquipmentResponse> getEquipment(@PathVariable Long id) {
        return ResponseEntity.ok(serviceSelectionService.getEquipment(id));
    }

    @PostMapping("/admin/equipment")
    public ResponseEntity<EquipmentResponse> createEquipment(@Valid @RequestBody EquipmentRequest request) {
        EquipmentResponse response = serviceSelectionService.createEquipment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/admin/equipment/{id}")
    public ResponseEntity<EquipmentResponse> updateEquipment(@PathVariable Long id,
                                                             @Valid @RequestBody EquipmentRequest request) {
        return ResponseEntity.ok(serviceSelectionService.updateEquipment(id, request));
    }

    @DeleteMapping("/admin/equipment/{id}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id) {
        serviceSelectionService.deleteEquipment(id);
        return ResponseEntity.noContent().build();
    }
}
