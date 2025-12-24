package com.health.dto.life;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 生活记录请求 DTO
 */
@Data
public class LifeRecordRequest {
    private String recordType;  // diet, exercise, sleep
    private LocalDate recordDate;
    private LocalTime recordTime;
    
    // 饮食相关
    private String mealType;     // breakfast, lunch, dinner, snack
    private String foodContent;
    private BigDecimal calories;
    
    // 运动相关
    private String exerciseType; // walking, running, cycling, swimming, yoga, gym, other
    private Integer durationMinutes;
    private BigDecimal caloriesBurned;
    private BigDecimal distance;
    private Integer steps;
    
    // 睡眠相关
    private LocalTime sleepStart;
    private LocalTime sleepEnd;
    private BigDecimal sleepDuration;
    private String sleepQuality;  // good, normal, poor
    
    // 通用
    private String mood;  // happy, normal, sad, anxious
    private String note;
}









