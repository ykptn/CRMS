package com.crms.app.service;

import com.crms.app.dto.CarResponse;
import com.crms.app.dto.CarSearchCriteria;
import java.util.List;

public interface CarBrowsingService {

    List<CarResponse> searchCars(CarSearchCriteria criteria);

    CarResponse getCar(Long id);
}
