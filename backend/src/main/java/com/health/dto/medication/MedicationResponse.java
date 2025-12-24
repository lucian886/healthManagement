package com.health.dto.medication;

import com.health.entity.MedicationRecord;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 用药响应 DTO
 */
@Data
@Builder
public class MedicationResponse {
    private Long id;
    private String medicationName;
    private String dosage;
    private String method;
    private String frequency;
    private LocalTime takeTime;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean active;
    private String note;
    private Long reminderId;
    private LocalDateTime createdAt;
    
    public static MedicationResponse from(MedicationRecord record) {
        return MedicationResponse.builder()
                .id(record.getId())
                .medicationName(record.getMedicationName())
                .dosage(record.getDosage())
                .method(record.getMethod())
                .frequency(record.getFrequency())
                .takeTime(record.getTakeTime())
                .startDate(record.getStartDate())
                .endDate(record.getEndDate())
                .active(record.getActive())
                .note(record.getNote())
                .reminderId(record.getReminderId())
                .createdAt(record.getCreatedAt())
                .build();
    }
}









