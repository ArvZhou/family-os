package com.family.auth.service;

import com.family.auth.dto.*;

public interface AuthService {

    UserResponse register(CreateUserRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshTokenRequest request);

    UserResponse me(java.util.UUID userId);

    void verify(String target, String code);

    void resendCode(String target);
}
