package com.crms.app.mapper;

import com.crms.app.dto.UserRegistrationRequest;
import com.crms.app.model.Member;
import com.crms.app.model.UserRole;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public Member toMember(UserRegistrationRequest request, String normalizedEmail, String encodedPassword) {
        Member member = new Member();
        member.setFullName(request.getFullName());
        member.setEmail(normalizedEmail);
        member.setPassword(encodedPassword);
        member.setPhone(request.getPhone());
        member.setAddress(request.getAddress());
        member.setDrivingLicenseNumber(request.getDrivingLicenseNumber());
        member.setRole(UserRole.MEMBER);
        return member;
    }
}
