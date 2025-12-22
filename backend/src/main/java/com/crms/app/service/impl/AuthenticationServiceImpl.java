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
import java.util.Locale;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@Transactional
public class AuthenticationServiceImpl implements AuthenticationService {

    private static final Pattern LICENSE_PATTERN = Pattern.compile("^[A-Z0-9]{5,20}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+?[0-9()\\-\\s]{7,20}$");

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
        validateRegistration(request);
        String normalizedEmail = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new CrmsException("Email already registered: " + normalizedEmail);
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Member member = userMapper.toMember(request, normalizedEmail, encodedPassword);
        member.setFullName(normalize(request.getFullName()));
        member.setPhone(normalize(request.getPhone()));
        member.setAddress(normalize(request.getAddress()));
        member.setDrivingLicenseNumber(normalizeLicense(request.getDrivingLicenseNumber()));
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

    private void validateRegistration(UserRegistrationRequest request) {
        if (request == null) {
            throw new CrmsException("Registration request is required.");
        }
        String normalizedPhone = normalize(request.getPhone());
        if (!PHONE_PATTERN.matcher(normalizedPhone).matches()) {
            throw new CrmsException("Phone number format is invalid.");
        }
        String normalizedLicense = normalizeLicense(request.getDrivingLicenseNumber());
        if (!LICENSE_PATTERN.matcher(normalizedLicense).matches()) {
            throw new CrmsException("Driving license number format is invalid.");
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeLicense(String license) {
        return normalize(license).toUpperCase(Locale.ROOT);
    }
}
