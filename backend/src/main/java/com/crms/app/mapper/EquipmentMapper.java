package com.crms.app.mapper;

import com.crms.app.dto.EquipmentRequest;
import com.crms.app.dto.EquipmentResponse;
import com.crms.app.model.Equipment;
import org.springframework.stereotype.Component;

@Component
public class EquipmentMapper {

    public EquipmentResponse toResponse(Equipment equipment) {
        EquipmentResponse response = new EquipmentResponse();
        response.setId(equipment.getId());
        response.setName(equipment.getName());
        response.setDailyPrice(equipment.getDailyPrice());
        return response;
    }

    public void updateEntity(EquipmentRequest request, Equipment equipment) {
        equipment.setName(request.getName());
        equipment.setDailyPrice(request.getDailyPrice());
    }
}
