package com.health.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 健康提醒实体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("health_reminders")
public class HealthReminder {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    @TableField("user_id")
    private Long userId;
    
    // 提醒类型：medication, checkup, exercise, water, custom
    @TableField("reminder_type")
    private String reminderType;
    
    // 提醒内容
    @TableField("content")
    private String content;
    
    // 提醒时间
    @TableField("reminder_time")
    private LocalTime reminderTime;
    
    // 重复类型：once, daily, weekly, monthly
    @TableField("repeat_type")
    private String repeatType;
    
    // 重复日期（周几或每月几号，用逗号分隔）
    @TableField("repeat_days")
    private String repeatDays;
    
    // 是否启用
    @TableField("enabled")
    private Boolean enabled = true;
    
    // 下次提醒时间
    @TableField("next_reminder_time")
    private LocalDateTime nextReminderTime;
    
    // 是否完成
    @TableField("completed")
    private Boolean completed = false;
    
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
