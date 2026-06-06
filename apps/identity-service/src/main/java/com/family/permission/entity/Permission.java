package com.family.permission.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "permissions")
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
