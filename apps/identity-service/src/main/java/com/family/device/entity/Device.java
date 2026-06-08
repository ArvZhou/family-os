package com.family.device.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@TableName("devices")
public class Device {

    @TableId(type = IdType.ASSIGN_UUID)
    private UUID id;

    @TableField("device_id")
    private String deviceId;

    private String name;

    @TableField("device_type")
    private String deviceType;

    private String protocol;
    private String status;

    @TableField("last_seen_at")
    private LocalDateTime lastSeenAt;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    private LocalDateTime updatedAt;

    @TableLogic
    @TableField("deleted_at")
    private LocalDateTime deletedAt;
}
