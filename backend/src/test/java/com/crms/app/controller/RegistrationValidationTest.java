package com.crms.app.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.crms.app.dto.UserRegistrationRequest;
import com.crms.app.support.IntegrationTestSupport;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class RegistrationValidationTest extends IntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("T-SRS-CRMS-002 - should reject duplicate email")
    void shouldRejectDuplicateEmailsDuringRegistration() throws Exception {
        UserRegistrationRequest registration = new UserRegistrationRequest();
        registration.setFullName("Member");
        registration.setEmail("dupe@crms.local");
        registration.setPassword("Password123");
        registration.setPhone("+905551111111");
        registration.setAddress("Test Address");
        registration.setDrivingLicenseNumber("DL12345");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registration)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registration)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("T-SRS-CRMS-002 - should enforce field validations")
    void shouldValidateRequiredRegistrationFields() throws Exception {
        UserRegistrationRequest registration = new UserRegistrationRequest();
        registration.setEmail("bad@crms.local");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registration)))
                .andExpect(status().isBadRequest());
    }
}
