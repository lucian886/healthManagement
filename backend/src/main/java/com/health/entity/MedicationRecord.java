package com.health.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 用药记录实体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("medication_records")
public class MedicationRecord {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    @TableField("user_id")
    private Long userId;
    
    // 药品名称
    @TableField("medication_name")
    private String medicationName;
    
    // 剂量
    @TableField("dosage")
    private String dosage;
    
    // 用法 (口服、注射、外用等)
    @TableField("method")
    private String method;
    
    // 频率 (每日一次、每日两次等)
    @TableField("frequency")
    private String frequency;
    
    // 服药时间
    @TableField("take_time")
    private LocalTime takeTime;
    
    // 开始日期
    @TableField("start_date")
    private LocalDate startDate;
    
    // 结束日期
    @TableField("end_date")
    private LocalDate endDate;
    
    // 是否正在服用
    @TableField("active")
    private Boolean active = true;
    
    // 备注
    @TableField("note")
    private String note;
    
    // 提醒关联
    @TableField("reminder_id")
    private Long reminderId;
    
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
