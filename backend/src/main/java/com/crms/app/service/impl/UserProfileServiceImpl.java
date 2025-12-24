package com.crms.app.service.impl;

import com.crms.app.dto.AuthProfileResponse;
import com.crms.app.dto.MemberProfileUpdateRequest;
import com.crms.app.exception.CrmsException;
import com.crms.app.exception.ResourceNotFoundException;
import com.crms.app.model.Member;
import com.crms.app.model.User;
import com.crms.app.model.UserRole;
import com.crms.app.repository.MemberRepository;
import com.crms.app.repository.UserRepository;
import com.crms.app.service.UserProfileService;
import java.util.Locale;
import java.util.regex.Pattern;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional
public class UserProfileServiceImpl implements UserProfileService {

    private static final Pattern LICENSE_PATTERN = Pattern.compile("^[A-Z0-9]{5,20}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+?[0-9()\\-\\s]{7,20}$");

    private final MemberRepository memberRepository;
    private final UserRepository userRepository;

    public UserProfileServiceImpl(MemberRepository memberRepository,
                                  UserRepository userRepository) {
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    @Override
    public AuthProfileResponse getCurrentProfile() {
        User user = resolveCurrentUser();
        AuthProfileResponse response = new AuthProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setRole(user.getRole().name());
        if (user.getRole() == UserRole.MEMBER) {
            memberRepository.findByEmail(normalizeEmail(user.getEmail()))
                    .ifPresent(member -> {
                        response.setDrivingLicenseNumber(member.getDrivingLicenseNumber());
                        if (member.getDrivingLicenseExpiry() != null) {
                            response.setDrivingLicenseExpiry(member.getDrivingLicenseExpiry().toString());
                        }
                    });
        }
        return response;
    }

    @Override
    public void updateMemberProfile(MemberProfileUpdateRequest request) {
        if (request == null) {
            throw new CrmsException("Profile update request is required.");
        }
        validateMandatoryFields(request);
        validatePhone(request.getPhone());
        validateDrivingLicense(request.getDrivingLicenseNumber());

        Member member = resolveCurrentMember();
        member.setFullName(normalize(request.getFullName()));
        member.setPhone(normalize(request.getPhone()));
        member.setAddress(normalize(request.getAddress()));
        member.setDrivingLicenseNumber(normalizeLicense(request.getDrivingLicenseNumber()));
        member.setDrivingLicenseExpiry(request.getDrivingLicenseExpiry());
        memberRepository.save(member);
    }

    private void validateMandatoryFields(MemberProfileUpdateRequest request) {
        if (!StringUtils.hasText(request.getFullName())
                || !StringUtils.hasText(request.getPhone())
                || !StringUtils.hasText(request.getAddress())
                || !StringUtils.hasText(request.getDrivingLicenseNumber())
                || request.getDrivingLicenseExpiry() == null) {
            throw new CrmsException("Full name, phone, address, driving license number, and expiry are required.");
        }
    }

    private void validatePhone(String phone) {
        String normalized = normalize(phone);
        if (!PHONE_PATTERN.matcher(normalized).matches()) {
            throw new CrmsException("Phone number format is invalid.");
        }
    }

    private void validateDrivingLicense(String license) {
        String normalized = normalizeLicense(license);
        if (!LICENSE_PATTERN.matcher(normalized).matches()) {
            throw new CrmsException("Driving license number format is invalid.");
        }
    }

    private Member resolveCurrentMember() {
        User user = resolveCurrentUser();
        return memberRepository.findByEmail(normalizeEmail(user.getEmail()))
                .orElseThrow(() -> new ResourceNotFoundException("Member not found for email: " + user.getEmail()));
    }

    private User resolveCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new CrmsException("Authenticated member is required to update profile.");
        }
        String email = extractEmail(authentication.getPrincipal());
        if (!StringUtils.hasText(email)) {
            throw new CrmsException("Authenticated member email is missing.");
        }
        return userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));
    }

    private String extractEmail(Object principal) {
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        if (principal instanceof User user) {
            return user.getEmail();
        }
        if (principal instanceof String text) {
            return text;
        }
        return null;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeLicense(String license) {
        return normalize(license).toUpperCase(Locale.ROOT);
    }

    private String normalizeEmail(String email) {
        return normalize(email).toLowerCase(Locale.ROOT);
    }
}
