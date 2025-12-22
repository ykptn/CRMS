package com.crms.app.dto;

import com.crms.app.model.CarStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.time.LocalDate;

public class CarSearchCriteria {

    private String make;
    private String model;
    private String carType;
    private Long locationId;

    @Min(1900)
    private Integer minYear;

    @Min(1900)
    private Integer maxYear;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal minDailyRate;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal maxDailyRate;

    @Min(1)
    private Integer seats;

    private String transmission;
    private String fuelType;
    private Boolean gpsIncluded;
    private Boolean childSeat;
    private CarStatus status;
    private LocalDate startDate;
    private LocalDate endDate;

    @Min(0)
    private Integer page;

    @Min(1)
    @Max(200)
    private Integer size;

    public String getMake() {
        return make;
    }

    public void setMake(String make) {
        this.make = make;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getCarType() {
        return carType;
    }

    public void setCarType(String carType) {
        this.carType = carType;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public Integer getMinYear() {
        return minYear;
    }

    public void setMinYear(Integer minYear) {
        this.minYear = minYear;
    }

    public Integer getMaxYear() {
        return maxYear;
    }

    public void setMaxYear(Integer maxYear) {
        this.maxYear = maxYear;
    }

    public BigDecimal getMinDailyRate() {
        return minDailyRate;
    }

    public void setMinDailyRate(BigDecimal minDailyRate) {
        this.minDailyRate = minDailyRate;
    }

    public BigDecimal getMaxDailyRate() {
        return maxDailyRate;
    }

    public void setMaxDailyRate(BigDecimal maxDailyRate) {
        this.maxDailyRate = maxDailyRate;
    }

    public Integer getSeats() {
        return seats;
    }

    public void setSeats(Integer seats) {
        this.seats = seats;
    }

    public String getTransmission() {
        return transmission;
    }

    public void setTransmission(String transmission) {
        this.transmission = transmission;
    }

    public String getFuelType() {
        return fuelType;
    }

    public void setFuelType(String fuelType) {
        this.fuelType = fuelType;
    }

    public Boolean getGpsIncluded() {
        return gpsIncluded;
    }

    public void setGpsIncluded(Boolean gpsIncluded) {
        this.gpsIncluded = gpsIncluded;
    }

    public Boolean getChildSeat() {
        return childSeat;
    }

    public void setChildSeat(Boolean childSeat) {
        this.childSeat = childSeat;
    }

    public CarStatus getStatus() {
        return status;
    }

    public void setStatus(CarStatus status) {
        this.status = status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }
}
