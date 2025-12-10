package com.crms.app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "members")
public class Member extends User {

    @Column(nullable = false)
    private String drivingLicenseNumber;
}
