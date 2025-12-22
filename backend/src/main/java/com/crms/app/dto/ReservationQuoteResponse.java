package com.crms.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ReservationQuoteResponse {

    private Long memberId;
    private Long carId;
    private Long pickupLocationId;
    private Long dropoffLocationId;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<Long> additionalServiceIds;
    private List<Long> equipmentIds;
    private BigDecimal totalCost;

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }

    public Long getCarId() {
        return carId;
    }

    public void setCarId(Long carId) {
        this.carId = carId;
    }

    public Long getPickupLocationId() {
        return pickupLocationId;
    }

    public void setPickupLocationId(Long pickupLocationId) {
        this.pickupLocationId = pickupLocationId;
    }

    public Long getDropoffLocationId() {
        return dropoffLocationId;
    }

    public void setDropoffLocationId(Long dropoffLocationId) {
        this.dropoffLocationId = dropoffLocationId;
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

    public List<Long> getAdditionalServiceIds() {
        return additionalServiceIds;
    }

    public void setAdditionalServiceIds(List<Long> additionalServiceIds) {
        this.additionalServiceIds = additionalServiceIds;
    }

    public List<Long> getEquipmentIds() {
        return equipmentIds;
    }

    public void setEquipmentIds(List<Long> equipmentIds) {
        this.equipmentIds = equipmentIds;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }
}
