package com.crms.app.service.impl;

import com.crms.app.dto.LocationRequest;
import com.crms.app.dto.LocationResponse;
import com.crms.app.exception.CrmsException;
import com.crms.app.exception.ResourceNotFoundException;
import com.crms.app.mapper.LocationMapper;
import com.crms.app.model.Location;
import com.crms.app.repository.LocationRepository;
import com.crms.app.service.LocationManagementService;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional
public class LocationManagementServiceImpl implements LocationManagementService {

    private final LocationRepository locationRepository;
    private final LocationMapper locationMapper;

    public LocationManagementServiceImpl(LocationRepository locationRepository,
                                         LocationMapper locationMapper) {
        this.locationRepository = locationRepository;
        this.locationMapper = locationMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationResponse> listLocations() {
        return locationRepository.findAll().stream()
                .map(locationMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LocationResponse getLocation(Long id) {
        Location location = findLocation(id);
        return locationMapper.toResponse(location);
    }

    @Override
    public LocationResponse createLocation(LocationRequest request) {
        Location location = new Location();
        applyRequest(location, request);
        String code = location.getCode();
        if (locationRepository.existsByCode(code)) {
            throw new CrmsException("Location code already exists: " + code);
        }
        Location saved = locationRepository.save(location);
        return locationMapper.toResponse(saved);
    }

    @Override
    public LocationResponse updateLocation(Long id, LocationRequest request) {
        Location location = findLocation(id);
        String nextCode = normalizeCode(request == null ? null : request.getCode());
        if (!nextCode.equals(location.getCode()) && locationRepository.existsByCode(nextCode)) {
            throw new CrmsException("Location code already exists: " + nextCode);
        }
        applyRequest(location, request);
        return locationMapper.toResponse(locationRepository.save(location));
    }

    @Override
    public void deleteLocation(Long id) {
        Location location = findLocation(id);
        locationRepository.delete(location);
    }

    private Location findLocation(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + id));
    }

    private void applyRequest(Location location, LocationRequest request) {
        if (request == null) {
            throw new CrmsException("Location request is required.");
        }
        location.setCode(normalizeCode(request.getCode()));
        location.setName(normalize(request.getName()));
        location.setAddress(normalize(request.getAddress()));
    }

    private String normalize(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        return value.trim();
    }

    private String normalizeCode(String code) {
        if (!StringUtils.hasText(code)) {
            return "";
        }
        return code.trim().toUpperCase(Locale.ROOT);
    }
}
