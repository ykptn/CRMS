package com.crms.app.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.crms.app.dto.ReservationRequest;
import com.crms.app.model.Location;
import com.crms.app.model.Member;
import com.crms.app.support.IntegrationTestSupport;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class ReservationModificationControllerTest extends IntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCreateQuoteUpdateCancelAndCompleteReservation() throws Exception {
        Location location = createLocation("LOC1");
        Member member = createMember("member@crms.local", "Password123");
        var car = createCar(location, "BC-300", "34ABC03");

        ReservationRequest request = new ReservationRequest();
        request.setMemberId(member.getId());
        request.setCarId(car.getId());
        request.setPickupLocationId(location.getId());
        request.setDropoffLocationId(location.getId());
        request.setStartDate(LocalDate.now().plusDays(5));
        request.setEndDate(LocalDate.now().plusDays(7));

        mockMvc.perform(post("/api/reservations/quote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        var createResponse = mockMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode created = objectMapper.readTree(createResponse.getResponse().getContentAsString());
        long reservationId = created.get("id").asLong();

        ReservationRequest updateRequest = new ReservationRequest();
        updateRequest.setMemberId(member.getId());
        updateRequest.setCarId(car.getId());
        updateRequest.setPickupLocationId(location.getId());
        updateRequest.setDropoffLocationId(location.getId());
        updateRequest.setStartDate(LocalDate.now().plusDays(6));
        updateRequest.setEndDate(LocalDate.now().plusDays(8));

        mockMvc.perform(put("/api/reservations/{id}", reservationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/reservations/{id}/cancel", reservationId))
                .andExpect(status().isOk());

        ReservationRequest completeRequest = new ReservationRequest();
        completeRequest.setMemberId(member.getId());
        completeRequest.setCarId(car.getId());
        completeRequest.setPickupLocationId(location.getId());
        completeRequest.setDropoffLocationId(location.getId());
        completeRequest.setStartDate(LocalDate.now().minusDays(4));
        completeRequest.setEndDate(LocalDate.now().minusDays(2));

        var completeCreate = mockMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode completeBody = objectMapper.readTree(completeCreate.getResponse().getContentAsString());
        long completeId = completeBody.get("id").asLong();

        mockMvc.perform(post("/api/reservations/{id}/complete", completeId))
                .andExpect(status().isOk());
    }
}
