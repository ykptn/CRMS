package com.crms.app.mapper;

import com.crms.app.dto.MemberResponse;
import com.crms.app.model.Member;
import org.springframework.stereotype.Component;

@Component
public class MemberMapper {

    public MemberResponse toResponse(Member member) {
        MemberResponse response = new MemberResponse();
        response.setId(member.getId());
        response.setEmail(member.getEmail());
        response.setFullName(member.getFullName());
        response.setPhone(member.getPhone());
        response.setAddress(member.getAddress());
        response.setDrivingLicenseNumber(member.getDrivingLicenseNumber());
        if (member.getDrivingLicenseExpiry() != null) {
            response.setDrivingLicenseExpiry(member.getDrivingLicenseExpiry().toString());
        }
        return response;
    }
}
