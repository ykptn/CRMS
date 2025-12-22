package com.crms.app.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.crms.app.dto.ReservationSummary;
import com.crms.app.service.MemberManagementService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class MemberHistoryControllerTest {

    @Mock
    private MemberManagementService memberManagementService;

    private MemberController memberController;

    @BeforeEach
    void setup() {
        memberController = new MemberController(memberManagementService);
    }

    @Test
    void shouldReturnMemberReservationHistory() {
        ReservationSummary summary = new ReservationSummary();
        summary.setId(1L);

        when(memberManagementService.listMemberReservations(100L)).thenReturn(List.of(summary));

        var response = memberController.listMemberReservations(100L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(summary);
    }
}
