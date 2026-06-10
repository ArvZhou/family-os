package com.family.auth.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.auth.dto.*;
import com.family.auth.entity.User;
import com.family.auth.exception.*;
import com.family.auth.mapper.UserMapper;
import com.family.auth.security.JwtService;
import com.family.auth.verification.VerificationService;
import com.family.common.exception.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final VerificationService verificationService;

    public AuthServiceImpl(UserMapper userMapper, PasswordEncoder passwordEncoder,
                           JwtService jwtService, VerificationService verificationService) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.verificationService = verificationService;
    }

    @Override
    public AuthResponse register(CreateUserRequest request) {
        // Determine verification target: email takes priority, then phone
        String target = resolveTarget(request);
        if (target == null) {
            throw new IllegalArgumentException("Either email or phone is required for registration");
        }

        // Check duplicate username
        LambdaQueryWrapper<User> query = new LambdaQueryWrapper<>();
        query.eq(User::getUsername, request.username());
        if (userMapper.selectCount(query) > 0) {
            throw new DuplicateUsernameException(request.username());
        }

        // Check duplicate email
        if (request.email() != null && !request.email().isBlank()) {
            LambdaQueryWrapper<User> emailQuery = new LambdaQueryWrapper<>();
            emailQuery.eq(User::getEmail, request.email());
            if (userMapper.selectCount(emailQuery) > 0) {
                throw new DuplicateEmailException(request.email());
            }
        }

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(request.username());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setName(request.name());
        user.setVerified(false);
        userMapper.insert(user);

        // Send verification code
        verificationService.sendCode(target);

        // Generate tokens so the user is logged in immediately after registration
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        return new AuthResponse(accessToken, refreshToken, 1800, toResponse(user));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        LambdaQueryWrapper<User> query = new LambdaQueryWrapper<>();
        query.eq(User::getUsername, request.username());
        User user = userMapper.selectOne(query);

        if (user == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        if (!Boolean.TRUE.equals(user.getVerified())) {
            throw new AccountNotVerifiedException();
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        return new AuthResponse(accessToken, refreshToken, 1800, toResponse(user));
    }

    @Override
    public AuthResponse refresh(RefreshTokenRequest request) {
        if (!jwtService.isRefreshTokenValid(request.refreshToken())) {
            throw new InvalidCredentialsException();
        }

        var claims = jwtService.parseRefreshToken(request.refreshToken());
        UUID userId = UUID.fromString(claims.getSubject());

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new EntityNotFoundException("User", userId);
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        return new AuthResponse(accessToken, refreshToken, 1800, toResponse(user));
    }

    @Override
    public UserResponse me(UUID userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new EntityNotFoundException("User", userId);
        }
        return toResponse(user);
    }

    @Override
    public void verify(String target, String code) {
        // Find user by email or phone
        User user = findUserByTarget(target);
        if (user == null) {
            throw new VerificationCodeInvalidException();
        }

        if (!verificationService.verifyCode(target, code)) {
            throw new VerificationCodeInvalidException();
        }

        user.setVerified(true);
        userMapper.updateById(user);
    }

    @Override
    public void resendCode(String target) {
        User user = findUserByTarget(target);
        if (user == null) {
            // Don't reveal whether the target exists
            return;
        }
        verificationService.sendCode(target);
    }

    private String resolveTarget(CreateUserRequest request) {
        if (request.email() != null && !request.email().isBlank()) {
            return request.email();
        }
        if (request.phone() != null && !request.phone().isBlank()) {
            return request.phone();
        }
        return null;
    }

    private User findUserByTarget(String target) {
        LambdaQueryWrapper<User> query = new LambdaQueryWrapper<>();
        if (target.contains("@")) {
            query.eq(User::getEmail, target);
        } else {
            query.eq(User::getPhone, target);
        }
        return userMapper.selectOne(query);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getPhone(), user.getName());
    }
}
