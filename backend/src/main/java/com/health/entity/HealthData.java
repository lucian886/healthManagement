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

/**
 * 健康数据记录实体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "health_data")
public class HealthData {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // 数据类型：weight, blood_pressure, blood_sugar, heart_rate, temperature, sleep, exercise
    @Column(name = "data_type", nullable = false, length = 30)
    private String dataType;
    
    // 数值（用于单值类型如体重、血糖）
    @Column(precision = 10, scale = 2)
    private BigDecimal value;
    
    // 收缩压（血压高压）
    @Column(name = "systolic_pressure")
    private Integer systolicPressure;
    
    // 舒张压（血压低压）
    @Column(name = "diastolic_pressure")
    private Integer diastolicPressure;
    
    // 单位
    @Column(length = 20)
    private String unit;
    
    // 记录日期
    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;
    
    // 记录时间（可选，如早晨/晚上）
    @Column(name = "record_time", length = 20)
    private String recordTime;
    
    // 备注
    @Column(length = 500)
    private String note;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}











