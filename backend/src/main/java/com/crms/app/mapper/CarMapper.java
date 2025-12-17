package com.crms.app.mapper;

import com.crms.app.dto.CarRequest;
import com.crms.app.dto.CarResponse;
import com.crms.app.model.Car;
import com.crms.app.model.CarStatus;
import org.springframework.stereotype.Component;

@Component
public class CarMapper {

    public Car toEntity(CarRequest request) {
        Car car = new Car();
        updateEntity(request, car);
        return car;
    }

    public void updateEntity(CarRequest request, Car car) {
        car.setMake(request.getMake());
        car.setModel(request.getModel());
        car.setModelYear(request.getModelYear());
        car.setLicensePlate(request.getLicensePlate());
        car.setVin(request.getVin());
        car.setSeats(request.getSeats());
        car.setDailyRate(request.getDailyRate());
        car.setTransmission(request.getTransmission());
        car.setFuelType(request.getFuelType());
        car.setGpsIncluded(request.isGpsIncluded());
        car.setChildSeat(request.isChildSeat());
        car.setAirConditioning(request.isAirConditioning());
        car.setDescription(request.getDescription());
        CarStatus status = request.getStatus();
        if (status != null) {
            car.setStatus(status);
        } else if (car.getStatus() == null) {
            car.setStatus(CarStatus.AVAILABLE);
        }
    }

    public CarResponse toResponse(Car car) {
        CarResponse response = new CarResponse();
        response.setId(car.getId());
        response.setMake(car.getMake());
        response.setModel(car.getModel());
        response.setModelYear(car.getModelYear());
        response.setLicensePlate(car.getLicensePlate());
        response.setVin(car.getVin());
        response.setSeats(car.getSeats());
        response.setDailyRate(car.getDailyRate());
        response.setTransmission(car.getTransmission());
        response.setFuelType(car.getFuelType());
        response.setGpsIncluded(car.isGpsIncluded());
        response.setChildSeat(car.isChildSeat());
        response.setAirConditioning(car.isAirConditioning());
        response.setStatus(car.getStatus());
        response.setDescription(car.getDescription());
        return response;
    }
}
