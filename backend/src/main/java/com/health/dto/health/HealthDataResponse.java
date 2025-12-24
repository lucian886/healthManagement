package com.health.dto.health;

import com.health.entity.HealthData;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 健康数据响应 DTO
 */
@Data
@Builder
public class HealthDataResponse {
    private Long id;
    private String dataType;
    private BigDecimal value;
    private Integer systolicPressure;
    private Integer diastolicPressure;
    private String unit;
    private LocalDate recordDate;
    private String recordTime;
    private String note;
    private LocalDateTime createdAt;
    
    public static HealthDataResponse from(HealthData data) {
        return HealthDataResponse.builder()
                .id(data.getId())
                .dataType(data.getDataType())
                .value(data.getValue())
                .systolicPressure(data.getSystolicPressure())
                .diastolicPressure(data.getDiastolicPressure())
                .unit(data.getUnit())
                .recordDate(data.getRecordDate())
                .recordTime(data.getRecordTime())
                .note(data.getNote())
                .createdAt(data.getCreatedAt())
                .build();
    }
}









