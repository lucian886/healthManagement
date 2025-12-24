package com.health.dto.medication;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 用药请求 DTO
 */
@Data
public class MedicationRequest {
    private String medicationName;
    private String dosage;
    private String method;       // oral, injection, external
    private String frequency;    // daily, twice_daily, three_times_daily, weekly
    private LocalTime takeTime;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean active;
    private String note;
}









