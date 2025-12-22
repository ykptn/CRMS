package com.crms.app.service;

import com.crms.app.dto.AdditionalServiceRequest;
import com.crms.app.dto.AdditionalServiceResponse;
import com.crms.app.dto.EquipmentRequest;
import com.crms.app.dto.EquipmentResponse;
import java.util.List;

public interface ServiceSelectionService {

    List<AdditionalServiceResponse> listServices();

    AdditionalServiceResponse getService(Long id);

    AdditionalServiceResponse createService(AdditionalServiceRequest request);

    AdditionalServiceResponse updateService(Long id, AdditionalServiceRequest request);

    void deleteService(Long id);

    List<EquipmentResponse> listEquipment();

    EquipmentResponse getEquipment(Long id);

    EquipmentResponse createEquipment(EquipmentRequest request);

    EquipmentResponse updateEquipment(Long id, EquipmentRequest request);

    void deleteEquipment(Long id);
}
