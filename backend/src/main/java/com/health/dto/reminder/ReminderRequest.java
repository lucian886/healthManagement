package com.health.dto.reminder;

import lombok.Data;

import java.time.LocalTime;

/**
 * 提醒请求 DTO
 */
@Data
public class ReminderRequest {
    private String reminderType;  // medication, checkup, exercise, water, custom
    private String content;
    private LocalTime reminderTime;
    private String repeatType;    // once, daily, weekly, monthly
    private String repeatDays;    // 逗号分隔的星期或日期
    private Boolean enabled = true;
}









