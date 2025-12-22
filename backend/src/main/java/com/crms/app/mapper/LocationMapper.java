package com.crms.app.mapper;

import com.crms.app.dto.LocationRequest;
import com.crms.app.dto.LocationResponse;
import com.crms.app.model.Location;
import org.springframework.stereotype.Component;

@Component
public class LocationMapper {

    public LocationResponse toResponse(Location location) {
        LocationResponse response = new LocationResponse();
        response.setId(location.getId());
        response.setCode(location.getCode());
        response.setName(location.getName());
        response.setAddress(location.getAddress());
        return response;
    }

    public void updateEntity(LocationRequest request, Location location) {
        location.setCode(request.getCode());
        location.setName(request.getName());
        location.setAddress(request.getAddress());
    }
}
