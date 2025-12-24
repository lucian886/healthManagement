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

/**
 * 用户档案实体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_profiles")
public class UserProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    // 基本信息
    @Column(name = "real_name", length = 50)
    private String realName;
    
    @Column(length = 10)
    private String gender;
    
    @Column(name = "birth_date")
    private LocalDate birthDate;
    
    @Column(length = 20)
    private String phone;
    
    @Column(length = 200)
    private String address;
    
    // 健康信息
    private Double height;  // 身高 cm
    
    private Double weight;  // 体重 kg
    
    @Column(name = "blood_type", length = 10)
    private String bloodType;
    
    @Column(columnDefinition = "TEXT")
    private String allergies;  // 过敏史
    
    @Column(name = "medical_history", columnDefinition = "TEXT")
    private String medicalHistory;  // 病史
    
    @Column(name = "family_history", columnDefinition = "TEXT")
    private String familyHistory;  // 家族病史
    
    // 紧急联系人
    @Column(name = "emergency_contact", length = 50)
    private String emergencyContact;
    
    @Column(name = "emergency_phone", length = 20)
    private String emergencyPhone;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}











