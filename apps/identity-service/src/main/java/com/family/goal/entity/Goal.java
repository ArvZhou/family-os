package com.family.goal.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@TableName("goals")
public class Goal {

    @TableId(type = IdType.ASSIGN_UUID)
    private UUID id;

    @TableField("user_id")
    private UUID userId;

    @TableField("member_id")
    private UUID memberId;

    private String title;
    private String type;

    @TableField("target_value")
    private BigDecimal targetValue;

    @TableField("current_value")
    private BigDecimal currentValue;

    private String unit;

    @TableField("start_date")
    private LocalDate startDate;

    @TableField("end_date")
    private LocalDate endDate;

    private String status;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    @TableField("deleted_at")
    private LocalDateTime deletedAt;
}
