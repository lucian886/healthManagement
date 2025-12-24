package com.health.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 生活记录实体（饮食、运动、睡眠）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("life_records")
public class LifeRecord {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    @TableField("user_id")
    private Long userId;
    
    // 记录类型：diet(饮食), exercise(运动), sleep(睡眠)
    @TableField("record_type")
    private String recordType;
    
    // 记录日期
    @TableField("record_date")
    private LocalDate recordDate;
    
    // 记录时间（如用餐时间、运动时间）
    @TableField("record_time")
    private LocalTime recordTime;
    
    // === 饮食相关字段 ===
    // 餐次：breakfast, lunch, dinner, snack
    @TableField("meal_type")
    private String mealType;
    
    // 食物内容
    @TableField("food_content")
    private String foodContent;
    
    // 卡路里
    @TableField("calories")
    private BigDecimal calories;
    
    // === 运动相关字段 ===
    // 运动类型：walking, running, cycling, swimming, yoga, gym, other
    @TableField("exercise_type")
    private String exerciseType;
    
    // 运动时长（分钟）
    @TableField("duration_minutes")
    private Integer durationMinutes;
    
    // 消耗卡路里
    @TableField("calories_burned")
    private BigDecimal caloriesBurned;
    
    // 运动距离（公里）
    @TableField("distance")
    private BigDecimal distance;
    
    // 步数
    @TableField("steps")
    private Integer steps;
    
    // === 睡眠相关字段 ===
    // 入睡时间
    @TableField("sleep_start")
    private LocalTime sleepStart;
    
    // 醒来时间
    @TableField("sleep_end")
    private LocalTime sleepEnd;
    
    // 睡眠时长（小时）
    @TableField("sleep_duration")
    private BigDecimal sleepDuration;
    
    // 睡眠质量：good, normal, poor
    @TableField("sleep_quality")
    private String sleepQuality;
    
    // === 通用字段 ===
    // 心情：happy, normal, sad, anxious
    @TableField("mood")
    private String mood;
    
    // 备注
    @TableField("note")
    private String note;
    
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
