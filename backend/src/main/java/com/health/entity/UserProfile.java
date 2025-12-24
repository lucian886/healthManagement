package com.health.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户档案实体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("user_profiles")
public class UserProfile {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    @TableField("user_id")
    private Long userId;
    
    // 基本信息
    @TableField("real_name")
    private String realName;
    
    @TableField("gender")
    private String gender;
    
    @TableField("birth_date")
    private LocalDate birthDate;
    
    @TableField("phone")
    private String phone;
    
    @TableField("address")
    private String address;
    
    // 健康信息
    @TableField("height")
    private Double height;  // 身高 cm
    
    @TableField("weight")
    private Double weight;  // 体重 kg
    
    @TableField("blood_type")
    private String bloodType;
    
    @TableField("allergies")
    private String allergies;  // 过敏史
    
    @TableField("medical_history")
    private String medicalHistory;  // 病史
    
    @TableField("family_history")
    private String familyHistory;  // 家族病史
    
    // 紧急联系人
    @TableField("emergency_contact")
    private String emergencyContact;
    
    @TableField("emergency_phone")
    private String emergencyPhone;
    
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}











