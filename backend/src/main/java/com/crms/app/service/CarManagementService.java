package com.crms.app.service;

import com.crms.app.dto.CarRequest;
import com.crms.app.dto.CarResponse;
import com.crms.app.dto.CarStatusUpdateRequest;

public interface CarManagementService {

    CarResponse createCar(CarRequest request);

    CarResponse updateCar(Long id, CarRequest request);

    void deleteCar(Long id);

    CarResponse updateStatus(Long id, CarStatusUpdateRequest request);
}
