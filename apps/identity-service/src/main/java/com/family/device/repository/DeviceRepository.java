package com.family.device.repository;

import com.family.device.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device, UUID> {
}
