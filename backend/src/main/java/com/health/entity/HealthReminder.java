package com.health.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 健康提醒实体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "health_reminders")
public class HealthReminder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // 提醒类型：medication, checkup, exercise, water, custom
    @Column(name = "reminder_type", nullable = false, length = 30)
    private String reminderType;
    
    // 提醒内容
    @Column(nullable = false, length = 200)
    private String content;
    
    // 提醒时间
    @Column(name = "reminder_time")
    private LocalTime reminderTime;
    
    // 重复类型：once, daily, weekly, monthly
    @Column(name = "repeat_type", length = 20)
    private String repeatType;
    
    // 重复日期（周几或每月几号，用逗号分隔）
    @Column(name = "repeat_days", length = 50)
    private String repeatDays;
    
    // 是否启用
    @Column(nullable = false)
    private Boolean enabled = true;
    
    // 下次提醒时间
    @Column(name = "next_reminder_time")
    private LocalDateTime nextReminderTime;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}











