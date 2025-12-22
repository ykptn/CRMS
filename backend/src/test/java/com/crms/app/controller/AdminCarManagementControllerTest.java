package com.crms.app.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.crms.app.dto.CarRequest;
import com.crms.app.dto.CarStatusUpdateRequest;
import com.crms.app.model.CarStatus;
import com.crms.app.model.Location;
import com.crms.app.support.IntegrationTestSupport;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class AdminCarManagementControllerTest extends IntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCreateUpdateAndDeleteCar() throws Exception {
        createAdmin("admin@crms.local", "AdminPass123");
        Location location = createLocation("LOC1");

        CarRequest request = new CarRequest();
        request.setMake("Toyota");
        request.setModel("Corolla");
        request.setModelYear(2022);
        request.setLocationId(location.getId());
        request.setBarcode("BC-100");
        request.setLicensePlate("34ABC01");
        request.setCarType("Sedan");
        request.setMileage(10000);
        request.setSeats(5);
        request.setDailyRate(BigDecimal.valueOf(120));
        request.setTransmission("Automatic");
        request.setFuelType("Gasoline");
        request.setGpsIncluded(true);
        request.setChildSeat(false);
        request.setAirConditioning(true);

        var createResponse = mockMvc.perform(post("/api/admin/cars")
                        .with(httpBasic("admin@crms.local", "AdminPass123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long carId = objectMapper.readTree(createResponse.getResponse().getContentAsString()).get("id").asLong();

        request.setDailyRate(BigDecimal.valueOf(150));
        mockMvc.perform(put("/api/admin/cars/{id}", carId)
                        .with(httpBasic("admin@crms.local", "AdminPass123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        CarStatusUpdateRequest statusUpdate = new CarStatusUpdateRequest();
        statusUpdate.setStatus(CarStatus.UNAVAILABLE);
        mockMvc.perform(patch("/api/admin/cars/{id}/status", carId)
                        .with(httpBasic("admin@crms.local", "AdminPass123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/admin/cars/{id}", carId)
                        .with(httpBasic("admin@crms.local", "AdminPass123")))
                .andExpect(status().isNoContent());
    }
}
