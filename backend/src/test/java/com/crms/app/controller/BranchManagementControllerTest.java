package com.crms.app.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.crms.app.dto.LocationRequest;
import com.crms.app.support.IntegrationTestSupport;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class BranchManagementControllerTest extends IntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldManageLocations() throws Exception {
        createAdmin("admin@crms.local", "AdminPass123");

        LocationRequest request = new LocationRequest();
        request.setCode("LOC1");
        request.setName("Levent");
        request.setAddress("Levent Address");

        var createResponse = mockMvc.perform(post("/api/admin/locations")
                        .with(httpBasic("admin@crms.local", "AdminPass123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long locationId = objectMapper.readTree(createResponse.getResponse().getContentAsString()).get("id").asLong();

        request.setName("Levent Updated");
        mockMvc.perform(put("/api/admin/locations/{id}", locationId)
                        .with(httpBasic("admin@crms.local", "AdminPass123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/locations")
                        .with(httpBasic("admin@crms.local", "AdminPass123")))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/admin/locations/{id}", locationId)
                        .with(httpBasic("admin@crms.local", "AdminPass123")))
                .andExpect(status().isNoContent());
    }
}
