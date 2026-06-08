package com.family.permission.service;

import com.family.permission.mapper.PermissionMapper;
import org.springframework.stereotype.Service;

@Service
public class PermissionServiceImpl implements PermissionService {

    private final PermissionMapper permissionMapper;

    public PermissionServiceImpl(PermissionMapper permissionMapper) {
        this.permissionMapper = permissionMapper;
    }
}
