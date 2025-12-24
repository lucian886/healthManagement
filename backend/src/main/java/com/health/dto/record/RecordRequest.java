package com.health.dto.record;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * 病历记录请求 DTO
 */
@Data
public class RecordRequest {
    
    @NotBlank(message = "标题不能为空")
    private String title;
    
    private String recordType;
    private String description;
    private String hospital;
    private String doctor;
    private LocalDate recordDate;
}











