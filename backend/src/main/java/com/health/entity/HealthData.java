package com.health.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 健康数据记录实体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("health_data")
public class HealthData {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    @TableField("user_id")
    private Long userId;
    
    // 数据类型：weight, blood_pressure, blood_sugar, heart_rate, temperature, sleep, exercise
    @TableField("data_type")
    private String dataType;
    
    // 数值（用于单值类型如体重、血糖）
    @TableField("value")
    private BigDecimal value;
    
    // 收缩压（血压高压）
    @TableField("systolic_pressure")
    private Integer systolicPressure;
    
    // 舒张压（血压低压）
    @TableField("diastolic_pressure")
    private Integer diastolicPressure;
    
    // 单位
    @TableField("unit")
    private String unit;
    
    // 记录日期
    @TableField("record_date")
    private LocalDate recordDate;
    
    // 记录时间（可选，如早晨/晚上）
    @TableField("record_time")
    private String recordTime;
    
    // 备注
    @TableField("note")
    private String note;
    
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}











