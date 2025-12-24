package com.health.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
@Entity
@Table(name = "medication_records")
public class MedicationRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // 药品名称
    @Column(name = "medication_name", nullable = false, length = 100)
    private String medicationName;
    
    // 剂量
    @Column(length = 50)
    private String dosage;
    
    // 用法 (口服、注射、外用等)
    @Column(length = 50)
    private String method;
    
    // 频率 (每日一次、每日两次等)
    @Column(length = 50)
    private String frequency;
    
    // 服药时间
    @Column(name = "take_time")
    private LocalTime takeTime;
    
    // 开始日期
    @Column(name = "start_date")
    private LocalDate startDate;
    
    // 结束日期
    @Column(name = "end_date")
    private LocalDate endDate;
    
    // 是否正在服用
    @Column(nullable = false)
    private Boolean active = true;
    
    // 备注
    @Column(length = 500)
    private String note;
    
    // 提醒关联
    @Column(name = "reminder_id")
    private Long reminderId;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}









