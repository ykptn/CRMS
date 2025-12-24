package com.crms.app.controller;

import com.crms.app.dto.LoginRequest;
import com.crms.app.dto.AuthProfileResponse;
import com.crms.app.dto.MemberProfileUpdateRequest;
import com.crms.app.dto.UserRegistrationRequest;
import com.crms.app.service.AuthenticationService;
import com.crms.app.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final UserProfileService userProfileService;

    public AuthenticationController(AuthenticationService authenticationService,
                                    UserProfileService userProfileService) {
        this.authenticationService = authenticationService;
        this.userProfileService = userProfileService;
    }

    @PostMapping("/register")
    public ResponseEntity<Void> registerMember(@Valid @RequestBody UserRegistrationRequest request) {
        authenticationService.registerMember(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<Void> login(@Valid @RequestBody LoginRequest request) {
        authenticationService.authenticate(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<AuthProfileResponse> getProfile() {
        return ResponseEntity.ok(userProfileService.getCurrentProfile());
    }

    @PatchMapping("/profile")
    public ResponseEntity<Void> updateProfile(@Valid @RequestBody MemberProfileUpdateRequest request) {
        userProfileService.updateMemberProfile(request);
        return ResponseEntity.noContent().build();
    }
}
