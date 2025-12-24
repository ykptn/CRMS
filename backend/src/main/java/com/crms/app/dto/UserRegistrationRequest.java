package com.crms.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class UserRegistrationRequest {

    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
            message = "Email must include a valid domain and TLD.")
    private String email;

    @NotBlank
    @Size(min = 8, max = 64)
    private String password;

    @NotBlank
    @Pattern(regexp = "^\\+?[0-9()\\-\\s]{7,20}$")
    private String phone;

    @NotBlank
    private String address;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z0-9]{5,20}$")
    private String drivingLicenseNumber;

    @NotNull
    private LocalDate drivingLicenseExpiry;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public LocalDate getDrivingLicenseExpiry() {
        return drivingLicenseExpiry;
    }

    public void setDrivingLicenseExpiry(LocalDate drivingLicenseExpiry) {
        this.drivingLicenseExpiry = drivingLicenseExpiry;
    }
}
