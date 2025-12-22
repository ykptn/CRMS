package com.crms.app.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
class MemberHistoryControllerTest extends IntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.crms.app.service.ReservationManagementService reservationManagementService;

    @Test
    void shouldReturnMemberReservationHistory() throws Exception {
        createAdmin("admin@crms.local", "AdminPass123");

        Location location = createLocation("LOC1");
        Member member = createMember("member@crms.local", "Password123");
        var car = createCar(location, "BC-200", "34ABC02");

        ReservationRequest request = new ReservationRequest();
        request.setMemberId(member.getId());
        request.setCarId(car.getId());
        request.setPickupLocationId(location.getId());
        request.setDropoffLocationId(location.getId());
        request.setStartDate(LocalDate.now().plusDays(3));
        request.setEndDate(LocalDate.now().plusDays(5));

        reservationManagementService.createReservation(request);

        var response = mockMvc.perform(get("/api/admin/members/{id}/reservations", member.getId())
                        .with(httpBasic("admin@crms.local", "AdminPass123"))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(response.getResponse().getContentAsString());
        org.assertj.core.api.Assertions.assertThat(body.isArray()).isTrue();
        org.assertj.core.api.Assertions.assertThat(body.size()).isEqualTo(1);
    }
}
