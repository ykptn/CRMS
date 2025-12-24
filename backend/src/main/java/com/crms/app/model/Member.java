package com.crms.app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "members")
public class Member extends User {

    @Column(nullable = false)
    private String drivingLicenseNumber;

    @Column
    private LocalDate drivingLicenseExpiry;

    public String getDrivingLicenseNumber() {
        return drivingLicenseNumber;
    }

    public void setDrivingLicenseNumber(String drivingLicenseNumber) {
        this.drivingLicenseNumber = drivingLicenseNumber;
    }

    public LocalDate getDrivingLicenseExpiry() {
        return drivingLicenseExpiry;
    }

    public void setDrivingLicenseExpiry(LocalDate drivingLicenseExpiry) {
        this.drivingLicenseExpiry = drivingLicenseExpiry;
    }
}
