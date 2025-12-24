package com.health.dto.life;

import com.health.entity.LifeRecord;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 生活记录响应 DTO
 */
@Data
@Builder
public class LifeRecordResponse {
    private Long id;
    private String recordType;
    private LocalDate recordDate;
    private LocalTime recordTime;
    
    // 饮食
    private String mealType;
    private String foodContent;
    private BigDecimal calories;
    
    // 运动
    private String exerciseType;
    private Integer durationMinutes;
    private BigDecimal caloriesBurned;
    private BigDecimal distance;
    private Integer steps;
    
    // 睡眠
    private LocalTime sleepStart;
    private LocalTime sleepEnd;
    private BigDecimal sleepDuration;
    private String sleepQuality;
    
    // 通用
    private String mood;
    private String note;
    private LocalDateTime createdAt;
    
    public static LifeRecordResponse from(LifeRecord record) {
        return LifeRecordResponse.builder()
                .id(record.getId())
                .recordType(record.getRecordType())
                .recordDate(record.getRecordDate())
                .recordTime(record.getRecordTime())
                .mealType(record.getMealType())
                .foodContent(record.getFoodContent())
                .calories(record.getCalories())
                .exerciseType(record.getExerciseType())
                .durationMinutes(record.getDurationMinutes())
                .caloriesBurned(record.getCaloriesBurned())
                .distance(record.getDistance())
                .steps(record.getSteps())
                .sleepStart(record.getSleepStart())
                .sleepEnd(record.getSleepEnd())
                .sleepDuration(record.getSleepDuration())
                .sleepQuality(record.getSleepQuality())
                .mood(record.getMood())
                .note(record.getNote())
                .createdAt(record.getCreatedAt())
                .build();
    }
}









