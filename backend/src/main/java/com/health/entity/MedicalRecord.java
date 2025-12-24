package com.health.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 病历记录实体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("medical_records")
public class MedicalRecord {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    @TableField("user_id")
    private Long userId;
    
    // 记录信息
    @TableField("title")
    private String title;
    
    @TableField("record_type")
    private String recordType;  // 类型：检查报告、处方、病历等
    
    @TableField("description")
    private String description;
    
    @TableField("hospital")
    private String hospital;  // 医院
    
    @TableField("doctor")
    private String doctor;  // 医生
    
    @TableField("record_date")
    private LocalDate recordDate;  // 就诊日期
    
    // 文件信息（保留单文件字段，兼容旧数据）
    @TableField("file_path")
    private String filePath;
    
    @TableField("file_name")
    private String fileName;
    
    @TableField("file_type")
    private String fileType;
    
    @TableField("file_size")
    private Long fileSize;
    
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
