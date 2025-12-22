package com.crms.app.service;

import com.crms.app.dto.MemberResponse;
import com.crms.app.dto.ReservationSummary;
import java.util.List;

public interface MemberManagementService {

    List<MemberResponse> listMembers();

    MemberResponse getMember(Long id);

    List<ReservationSummary> listMemberReservations(Long memberId);
}
