package com.crms.app.service;

import com.crms.app.dto.LoginRequest;
import com.crms.app.dto.UserRegistrationRequest;
import com.crms.app.model.Member;

public interface AuthenticationService {

    Member registerMember(UserRegistrationRequest request);

    void authenticate(LoginRequest request);
}
