package com.crms.app.service.impl;

import com.crms.app.dto.LoginRequest;
import com.crms.app.dto.UserRegistrationRequest;
import com.crms.app.model.Member;
import com.crms.app.repository.MemberRepository;
import com.crms.app.repository.UserRepository;
import com.crms.app.service.AuthenticationService;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final MemberRepository memberRepository;

    public AuthenticationServiceImpl(UserRepository userRepository,
                                     MemberRepository memberRepository) {
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
    }

    @Override
    public Member registerMember(UserRegistrationRequest request) {
        return null;
    }

    @Override
    public void authenticate(LoginRequest request) {
    }
}
