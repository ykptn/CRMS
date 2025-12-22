package com.crms.app.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.crms.app.dto.ReservationRequest;
import com.crms.app.model.Location;
import com.crms.app.model.Member;
import com.crms.app.support.IntegrationTestSupport;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class AdminReservationControllerTest extends IntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private com.crms.app.service.ReservationManagementService reservationManagementService;

    @Test
    void shouldListAndExportReservations() throws Exception {
        createAdmin("admin@crms.local", "AdminPass123");

        Location location = createLocation("LOC1");
        Member member = createMember("member@crms.local", "Password123");
        var car = createCar(location, "BC-400", "34ABC04");

        ReservationRequest request = new ReservationRequest();
        request.setMemberId(member.getId());
        request.setCarId(car.getId());
        request.setPickupLocationId(location.getId());
        request.setDropoffLocationId(location.getId());
        request.setStartDate(LocalDate.now().plusDays(3));
        request.setEndDate(LocalDate.now().plusDays(4));

        reservationManagementService.createReservation(request);

        mockMvc.perform(get("/api/admin/reservations")
                        .with(httpBasic("admin@crms.local", "AdminPass123"))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/reservations/export/csv")
                        .with(httpBasic("admin@crms.local", "AdminPass123")))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/reservations/export/pdf")
                        .with(httpBasic("admin@crms.local", "AdminPass123")))
                .andExpect(status().isOk());
    }
}
