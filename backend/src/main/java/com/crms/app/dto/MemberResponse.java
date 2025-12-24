package com.crms.app.dto;

public class MemberResponse {

    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String drivingLicenseNumber;
    private String drivingLicenseExpiry;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDrivingLicenseNumber() {
        return drivingLicenseNumber;
    }

    public void setDrivingLicenseNumber(String drivingLicenseNumber) {
        this.drivingLicenseNumber = drivingLicenseNumber;
    }

    public String getDrivingLicenseExpiry() {
        return drivingLicenseExpiry;
    }

    public void setDrivingLicenseExpiry(String drivingLicenseExpiry) {
        this.drivingLicenseExpiry = drivingLicenseExpiry;
    }
}
