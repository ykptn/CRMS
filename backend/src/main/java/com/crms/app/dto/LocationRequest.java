package com.crms.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class LocationRequest {

    @NotBlank
    @Size(max = 20)
    private String code;

    @NotBlank
    private String name;

    @NotBlank
    private String address;

    @NotBlank
    @Pattern(regexp = "^\\+?[0-9()\\-\\s]{7,20}$")
    private String phone;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
