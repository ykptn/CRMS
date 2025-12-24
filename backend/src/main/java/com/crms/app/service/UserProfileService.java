package com.crms.app.service;

import com.crms.app.dto.AuthProfileResponse;
import com.crms.app.dto.MemberProfileUpdateRequest;

public interface UserProfileService {

    AuthProfileResponse getCurrentProfile();

    void updateMemberProfile(MemberProfileUpdateRequest request);
}
