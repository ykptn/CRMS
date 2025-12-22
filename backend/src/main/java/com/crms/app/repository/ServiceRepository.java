package com.crms.app.repository;

import com.crms.app.model.AdditionalService;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<AdditionalService, Long> {

    boolean existsByNameIgnoreCase(String name);
}
