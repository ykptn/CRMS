package com.crms.app.repository;

import com.crms.app.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    boolean existsByNameIgnoreCase(String name);
}
