package com.crms.app.repository;

import com.crms.app.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, Long> {

    boolean existsByCode(String code);
}
