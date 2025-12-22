package com.crms.app.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.crms.app.dto.AdditionalServiceRequest;
import com.crms.app.dto.EquipmentRequest;
import com.crms.app.support.IntegrationTestSupport;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class ServiceManagementControllerTest extends IntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldManageServicesAndEquipment() throws Exception {
        createAdmin("admin@crms.local", "AdminPass123");

        AdditionalServiceRequest serviceRequest = new AdditionalServiceRequest();
        serviceRequest.setName("Insurance");
        serviceRequest.setDailyPrice(BigDecimal.valueOf(20));

        var serviceResponse = mockMvc.perform(post("/api/admin/services")
                        .with(httpBasic("admin@crms.local", "AdminPass123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(serviceRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        long serviceId = objectMapper.readTree(serviceResponse.getResponse().getContentAsString()).get("id").asLong();

        serviceRequest.setDailyPrice(BigDecimal.valueOf(25));
        mockMvc.perform(put("/api/admin/services/{id}", serviceId)
                        .with(httpBasic("admin@crms.local", "AdminPass123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(serviceRequest)))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/admin/services/{id}", serviceId)
                        .with(httpBasic("admin@crms.local", "AdminPass123")))
                .andExpect(status().isNoContent());

        EquipmentRequest equipmentRequest = new EquipmentRequest();
        equipmentRequest.setName("Child Seat");
        equipmentRequest.setDailyPrice(BigDecimal.valueOf(10));

        var equipmentResponse = mockMvc.perform(post("/api/admin/equipment")
                        .with(httpBasic("admin@crms.local", "AdminPass123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(equipmentRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        long equipmentId = objectMapper.readTree(equipmentResponse.getResponse().getContentAsString()).get("id").asLong();

        equipmentRequest.setDailyPrice(BigDecimal.valueOf(12));
        mockMvc.perform(put("/api/admin/equipment/{id}", equipmentId)
                        .with(httpBasic("admin@crms.local", "AdminPass123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(equipmentRequest)))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/admin/equipment/{id}", equipmentId)
                        .with(httpBasic("admin@crms.local", "AdminPass123")))
                .andExpect(status().isNoContent());
    }
}
