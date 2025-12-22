package com.crms.app.service.impl;

import com.crms.app.dto.AdditionalServiceRequest;
import com.crms.app.dto.AdditionalServiceResponse;
import com.crms.app.dto.EquipmentRequest;
import com.crms.app.dto.EquipmentResponse;
import com.crms.app.exception.CrmsException;
import com.crms.app.exception.ResourceNotFoundException;
import com.crms.app.mapper.AdditionalServiceMapper;
import com.crms.app.mapper.EquipmentMapper;
import com.crms.app.model.AdditionalService;
import com.crms.app.model.Equipment;
import com.crms.app.repository.EquipmentRepository;
import com.crms.app.repository.ServiceRepository;
import com.crms.app.service.ServiceSelectionService;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional
public class ServiceSelectionServiceImpl implements ServiceSelectionService {

    private final ServiceRepository serviceRepository;
    private final EquipmentRepository equipmentRepository;
    private final AdditionalServiceMapper serviceMapper;
    private final EquipmentMapper equipmentMapper;

    public ServiceSelectionServiceImpl(ServiceRepository serviceRepository,
                                       EquipmentRepository equipmentRepository,
                                       AdditionalServiceMapper serviceMapper,
                                       EquipmentMapper equipmentMapper) {
        this.serviceRepository = serviceRepository;
        this.equipmentRepository = equipmentRepository;
        this.serviceMapper = serviceMapper;
        this.equipmentMapper = equipmentMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdditionalServiceResponse> listServices() {
        return serviceRepository.findAll().stream()
                .map(serviceMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdditionalServiceResponse getService(Long id) {
        AdditionalService service = findService(id);
        return serviceMapper.toResponse(service);
    }

    @Override
    public AdditionalServiceResponse createService(AdditionalServiceRequest request) {
        AdditionalService service = new AdditionalService();
        applyServiceRequest(service, request);
        String nameKey = normalizeKey(service.getName());
        if (serviceRepository.existsByNameIgnoreCase(nameKey)) {
            throw new CrmsException("Service already exists: " + service.getName());
        }
        AdditionalService saved = serviceRepository.save(service);
        return serviceMapper.toResponse(saved);
    }

    @Override
    public AdditionalServiceResponse updateService(Long id, AdditionalServiceRequest request) {
        AdditionalService service = findService(id);
        String nextName = normalizeKey(request == null ? null : request.getName());
        if (!nextName.equalsIgnoreCase(service.getName())
                && serviceRepository.existsByNameIgnoreCase(nextName)) {
            throw new CrmsException("Service already exists: " + nextName);
        }
        applyServiceRequest(service, request);
        return serviceMapper.toResponse(serviceRepository.save(service));
    }

    @Override
    public void deleteService(Long id) {
        AdditionalService service = findService(id);
        serviceRepository.delete(service);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentResponse> listEquipment() {
        return equipmentRepository.findAll().stream()
                .map(equipmentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EquipmentResponse getEquipment(Long id) {
        Equipment equipment = findEquipment(id);
        return equipmentMapper.toResponse(equipment);
    }

    @Override
    public EquipmentResponse createEquipment(EquipmentRequest request) {
        Equipment equipment = new Equipment();
        applyEquipmentRequest(equipment, request);
        String nameKey = normalizeKey(equipment.getName());
        if (equipmentRepository.existsByNameIgnoreCase(nameKey)) {
            throw new CrmsException("Equipment already exists: " + equipment.getName());
        }
        Equipment saved = equipmentRepository.save(equipment);
        return equipmentMapper.toResponse(saved);
    }

    @Override
    public EquipmentResponse updateEquipment(Long id, EquipmentRequest request) {
        Equipment equipment = findEquipment(id);
        String nextName = normalizeKey(request == null ? null : request.getName());
        if (!nextName.equalsIgnoreCase(equipment.getName())
                && equipmentRepository.existsByNameIgnoreCase(nextName)) {
            throw new CrmsException("Equipment already exists: " + nextName);
        }
        applyEquipmentRequest(equipment, request);
        return equipmentMapper.toResponse(equipmentRepository.save(equipment));
    }

    @Override
    public void deleteEquipment(Long id) {
        Equipment equipment = findEquipment(id);
        equipmentRepository.delete(equipment);
    }

    private AdditionalService findService(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));
    }

    private Equipment findEquipment(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found: " + id));
    }

    private void applyServiceRequest(AdditionalService service, AdditionalServiceRequest request) {
        if (request == null) {
            throw new CrmsException("Service request is required.");
        }
        service.setName(normalize(request.getName()));
        service.setDailyPrice(request.getDailyPrice());
    }

    private void applyEquipmentRequest(Equipment equipment, EquipmentRequest request) {
        if (request == null) {
            throw new CrmsException("Equipment request is required.");
        }
        equipment.setName(normalize(request.getName()));
        equipment.setDailyPrice(request.getDailyPrice());
    }

    private String normalize(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        return value.trim();
    }

    private String normalizeKey(String value) {
        return normalize(value).toLowerCase(Locale.ROOT);
    }
}
