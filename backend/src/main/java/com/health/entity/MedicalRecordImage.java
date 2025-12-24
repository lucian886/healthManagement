package com.health.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 病历图片实体 - 一个病历可以有多张图片
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("medical_record_images")
public class MedicalRecordImage {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    @TableField("record_id")
    private Long recordId;
    
    // 文件信息
    @TableField("file_path")
    private String filePath;
    
    @TableField("file_name")
    private String fileName;
    
    @TableField("file_type")
    private String fileType;
    
    @TableField("file_size")
    private Long fileSize;
    
    // 排序
    @TableField("sort_order")
    private Integer sortOrder;
    
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
