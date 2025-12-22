package com.crms.app.service.impl;

import com.crms.app.dto.CarRequest;
import com.crms.app.dto.CarResponse;
import com.crms.app.dto.CarStatusUpdateRequest;
import com.crms.app.exception.ResourceNotFoundException;
import com.crms.app.mapper.CarMapper;
import com.crms.app.model.Car;
import com.crms.app.model.Location;
import com.crms.app.repository.CarRepository;
import com.crms.app.repository.LocationRepository;
import com.crms.app.service.CarManagementService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CarManagementServiceImpl implements CarManagementService {

    private final CarRepository carRepository;
    private final CarMapper carMapper;
    private final LocationRepository locationRepository;

    public CarManagementServiceImpl(CarRepository carRepository,
                                    CarMapper carMapper,
                                    LocationRepository locationRepository) {
        this.carRepository = carRepository;
        this.carMapper = carMapper;
        this.locationRepository = locationRepository;
    }

    @Override
    public CarResponse createCar(CarRequest request) {
        Car car = carMapper.toEntity(request);
        car.setLocation(findLocation(request.getLocationId()));
        Car saved = carRepository.save(car);
        return carMapper.toResponse(saved);
    }

    @Override
    public CarResponse updateCar(Long id, CarRequest request) {
        Car car = findCar(id);
        carMapper.updateEntity(request, car);
        car.setLocation(findLocation(request.getLocationId()));
        return carMapper.toResponse(carRepository.save(car));
    }

    @Override
    public void deleteCar(Long id) {
        Car car = findCar(id);
        carRepository.delete(car);
    }

    @Override
    public CarResponse updateStatus(Long id, CarStatusUpdateRequest request) {
        Car car = findCar(id);
        car.setStatus(request.getStatus());
        return carMapper.toResponse(carRepository.save(car));
    }

    private Car findCar(Long id) {
        return carRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Car not found: " + id));
    }

    private Location findLocation(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + id));
    }
}
