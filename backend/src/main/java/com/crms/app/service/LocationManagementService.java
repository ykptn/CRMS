package com.crms.app.service;

import com.crms.app.dto.LocationRequest;
import com.crms.app.dto.LocationResponse;
import java.util.List;

public interface LocationManagementService {

    List<LocationResponse> listLocations();

    LocationResponse getLocation(Long id);

    LocationResponse createLocation(LocationRequest request);

    LocationResponse updateLocation(Long id, LocationRequest request);

    void deleteLocation(Long id);
}
