package com.crms.app.dto;

import com.crms.app.model.CarStatus;
import jakarta.validation.constraints.NotNull;

public class CarStatusUpdateRequest {

    @NotNull
    private CarStatus status;

    public CarStatus getStatus() {
        return status;
    }

    public void setStatus(CarStatus status) {
        this.status = status;
    }
}
