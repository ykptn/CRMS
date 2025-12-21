package com.crms.app.service.impl;

import com.crms.app.dto.LoginRequest;
import com.crms.app.dto.UserRegistrationRequest;
import com.crms.app.exception.CrmsException;
import com.crms.app.exception.InvalidCredentialsException;
import com.crms.app.mapper.UserMapper;
import com.crms.app.model.Member;
import com.crms.app.model.User;
import com.crms.app.repository.MemberRepository;
import com.crms.app.repository.UserRepository;
import com.crms.app.service.AuthenticationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@Transactional
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public AuthenticationServiceImpl(UserRepository userRepository,
                                     MemberRepository memberRepository,
                                     PasswordEncoder passwordEncoder,
                                     UserMapper userMapper) {
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    @Override
    public Member registerMember(UserRegistrationRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new CrmsException("Email already registered: " + normalizedEmail);
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Member member = userMapper.toMember(request, normalizedEmail, encodedPassword);
        return memberRepository.save(member);
    }

    @Override
    public void authenticate(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password."));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password.");
        }
    }

    private String normalizeEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return "";
        }
        return email.trim().toLowerCase();
    }
}
