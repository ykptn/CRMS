package com.crms.app.service.impl;

import com.crms.app.dto.MemberProfileUpdateRequest;
import com.crms.app.repository.MemberRepository;
import com.crms.app.service.UserProfileService;
import org.springframework.stereotype.Service;

@Service
public class UserProfileServiceImpl implements UserProfileService {

    private final MemberRepository memberRepository;

    public UserProfileServiceImpl(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @Override
    public void updateMemberProfile(MemberProfileUpdateRequest request) {
    }
}
