package com.health.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

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
@Entity
@Table(name = "life_records")
public class LifeRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // 记录类型：diet(饮食), exercise(运动), sleep(睡眠)
    @Column(name = "record_type", nullable = false, length = 20)
    private String recordType;
    
    // 记录日期
    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;
    
    // 记录时间（如用餐时间、运动时间）
    @Column(name = "record_time")
    private LocalTime recordTime;
    
    // === 饮食相关字段 ===
    // 餐次：breakfast, lunch, dinner, snack
    @Column(name = "meal_type", length = 20)
    private String mealType;
    
    // 食物内容
    @Column(name = "food_content", length = 500)
    private String foodContent;
    
    // 卡路里
    @Column(precision = 10, scale = 2)
    private BigDecimal calories;
    
    // === 运动相关字段 ===
    // 运动类型：walking, running, cycling, swimming, yoga, gym, other
    @Column(name = "exercise_type", length = 30)
    private String exerciseType;
    
    // 运动时长（分钟）
    @Column(name = "duration_minutes")
    private Integer durationMinutes;
    
    // 消耗卡路里
    @Column(name = "calories_burned", precision = 10, scale = 2)
    private BigDecimal caloriesBurned;
    
    // 运动距离（公里）
    @Column(precision = 10, scale = 2)
    private BigDecimal distance;
    
    // 步数
    private Integer steps;
    
    // === 睡眠相关字段 ===
    // 入睡时间
    @Column(name = "sleep_start")
    private LocalTime sleepStart;
    
    // 醒来时间
    @Column(name = "sleep_end")
    private LocalTime sleepEnd;
    
    // 睡眠时长（小时）
    @Column(name = "sleep_duration", precision = 4, scale = 2)
    private BigDecimal sleepDuration;
    
    // 睡眠质量：good, normal, poor
    @Column(name = "sleep_quality", length = 20)
    private String sleepQuality;
    
    // === 通用字段 ===
    // 心情：happy, normal, sad, anxious
    @Column(length = 20)
    private String mood;
    
    // 备注
    @Column(length = 500)
    private String note;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}









