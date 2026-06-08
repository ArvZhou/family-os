package com.family.device.service;

import com.family.device.mapper.DeviceMapper;
import org.springframework.stereotype.Service;

@Service
public class DeviceServiceImpl implements DeviceService {

    private final DeviceMapper deviceMapper;

    public DeviceServiceImpl(DeviceMapper deviceMapper) {
        this.deviceMapper = deviceMapper;
    }
}
