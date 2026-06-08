package com.family.auth.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@TableName("users")
public class User {

    @TableId(type = IdType.ASSIGN_UUID)
    private UUID id;

    private String username;

    @TableField("password_hash")
    private String passwordHash;

    private String email;
    private String name;

    @TableField("external_id")
    private String externalId;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    private LocalDateTime updatedAt;

    @TableLogic
    @TableField("deleted_at")
    private LocalDateTime deletedAt;
}
