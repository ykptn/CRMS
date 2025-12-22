package com.crms.app.service.impl;

import com.crms.app.dto.MemberResponse;
import com.crms.app.dto.ReservationSummary;
import com.crms.app.exception.ResourceNotFoundException;
import com.crms.app.mapper.MemberMapper;
import com.crms.app.mapper.ReservationMapper;
import com.crms.app.model.Member;
import com.crms.app.model.Reservation;
import com.crms.app.repository.MemberRepository;
import com.crms.app.repository.ReservationRepository;
import com.crms.app.service.MemberManagementService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class MemberManagementServiceImpl implements MemberManagementService {

    private final MemberRepository memberRepository;
    private final ReservationRepository reservationRepository;
    private final MemberMapper memberMapper;
    private final ReservationMapper reservationMapper;

    public MemberManagementServiceImpl(MemberRepository memberRepository,
                                       ReservationRepository reservationRepository,
                                       MemberMapper memberMapper,
                                       ReservationMapper reservationMapper) {
        this.memberRepository = memberRepository;
        this.reservationRepository = reservationRepository;
        this.memberMapper = memberMapper;
        this.reservationMapper = reservationMapper;
    }

    @Override
    public List<MemberResponse> listMembers() {
        return memberRepository.findAll().stream()
                .map(memberMapper::toResponse)
                .toList();
    }

    @Override
    public MemberResponse getMember(Long id) {
        Member member = findMember(id);
        return memberMapper.toResponse(member);
    }

    @Override
    public List<ReservationSummary> listMemberReservations(Long memberId) {
        findMember(memberId);
        List<Reservation> reservations = reservationRepository.findAllByMemberIdOrderByStartDateDesc(memberId);
        return reservations.stream()
                .map(reservationMapper::toSummary)
                .toList();
    }

    private Member findMember(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + id));
    }
}
