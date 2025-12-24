package com.health.dto.health;

import lombok.Data;

import java.time.LocalDate;

/**
 * 健康数据请求 DTO
 */
@Data
public class HealthDataRequest {
    private String dataType;  // weight, blood_pressure, blood_sugar, heart_rate, temperature, sleep, exercise
    private String value;
    private Integer systolicPressure;  // 收缩压
    private Integer diastolicPressure; // 舒张压
    private LocalDate recordDate;
    private String recordTime;  // morning, afternoon, evening, night
    private String note;
}









