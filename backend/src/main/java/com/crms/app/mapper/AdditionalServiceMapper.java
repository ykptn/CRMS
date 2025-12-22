package com.crms.app.mapper;

import com.crms.app.dto.AdditionalServiceRequest;
import com.crms.app.dto.AdditionalServiceResponse;
import com.crms.app.model.AdditionalService;
import org.springframework.stereotype.Component;

@Component
public class AdditionalServiceMapper {

    public AdditionalServiceResponse toResponse(AdditionalService service) {
        AdditionalServiceResponse response = new AdditionalServiceResponse();
        response.setId(service.getId());
        response.setName(service.getName());
        response.setDailyPrice(service.getDailyPrice());
        return response;
    }

    public void updateEntity(AdditionalServiceRequest request, AdditionalService service) {
        service.setName(request.getName());
        service.setDailyPrice(request.getDailyPrice());
    }
}
