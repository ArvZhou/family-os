package com.family.device.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "devices")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "device_id", nullable = false, unique = true)
    private String deviceId;

    @Column(nullable = false)
    private String name;

    @Column(name = "device_type")
    private String deviceType;

    @Column
    private String protocol;

    @Column
    private String status;

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
