package com.family.auth.service;

import com.family.auth.mapper.UserMapper;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;

    public AuthServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }
}
