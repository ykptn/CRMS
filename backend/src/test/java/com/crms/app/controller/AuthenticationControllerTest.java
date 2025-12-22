package com.crms.app.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.crms.app.dto.LoginRequest;
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
class AuthenticationControllerTest extends IntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("T-SRS-CRMS-001 - user login success path")
    void shouldAuthenticateMemberWithValidCredentials() throws Exception {
        UserRegistrationRequest registration = new UserRegistrationRequest();
        registration.setFullName("Test Member");
        registration.setEmail("member@crms.local");
        registration.setPassword("Password123");
        registration.setPhone("+905551111111");
        registration.setAddress("Test Address");
        registration.setDrivingLicenseNumber("DL12345");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registration)))
                .andExpect(status().isCreated());

        LoginRequest login = new LoginRequest();
        login.setEmail("member@crms.local");
        login.setPassword("Password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("T-SRS-CRMS-001 - user login failure path")
    void shouldRejectInvalidCredentials() throws Exception {
        createMember("member2@crms.local", "Password123");

        LoginRequest login = new LoginRequest();
        login.setEmail("member2@crms.local");
        login.setPassword("WrongPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }
}
