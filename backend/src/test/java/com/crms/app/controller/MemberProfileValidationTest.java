package com.crms.app.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.crms.app.dto.MemberProfileUpdateRequest;
import com.crms.app.model.Member;
import com.crms.app.support.IntegrationTestSupport;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class MemberProfileValidationTest extends IntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("T-SRS-CRMS-003 - should validate driving license format during profile update")
    void shouldValidateDrivingLicenseOnProfileUpdate() throws Exception {
        createMember("member@crms.local", "Password123");

        MemberProfileUpdateRequest request = new MemberProfileUpdateRequest();
        request.setFullName("Updated Name");
        request.setPhone("+905551111111");
        request.setAddress("Updated Address");
        request.setDrivingLicenseNumber("bad");

        mockMvc.perform(patch("/api/auth/profile")
                        .with(httpBasic("member@crms.local", "Password123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("T-SRS-CRMS-003 - should persist valid updates")
    void shouldAcceptValidProfileUpdates() throws Exception {
        Member member = createMember("member2@crms.local", "Password123");

        MemberProfileUpdateRequest request = new MemberProfileUpdateRequest();
        request.setFullName("Updated Name");
        request.setPhone("+905551111111");
        request.setAddress("Updated Address");
        request.setDrivingLicenseNumber("DL99999");

        mockMvc.perform(patch("/api/auth/profile")
                        .with(httpBasic("member2@crms.local", "Password123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());

        Member updated = memberRepository.findById(member.getId()).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(updated.getFullName()).isEqualTo("Updated Name");
        org.assertj.core.api.Assertions.assertThat(updated.getDrivingLicenseNumber()).isEqualTo("DL99999");
    }
}
