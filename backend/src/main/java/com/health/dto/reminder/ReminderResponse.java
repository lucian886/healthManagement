package com.health.dto.reminder;

import com.health.entity.HealthReminder;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 提醒响应 DTO
 */
@Data
@Builder
public class ReminderResponse {
    private Long id;
    private String reminderType;
    private String content;
    private LocalTime reminderTime;
    private String repeatType;
    private String repeatDays;
    private Boolean enabled;
    private LocalDateTime nextReminderTime;
    private LocalDateTime createdAt;
    
    public static ReminderResponse from(HealthReminder reminder) {
        return ReminderResponse.builder()
                .id(reminder.getId())
                .reminderType(reminder.getReminderType())
                .content(reminder.getContent())
                .reminderTime(reminder.getReminderTime())
                .repeatType(reminder.getRepeatType())
                .repeatDays(reminder.getRepeatDays())
                .enabled(reminder.getEnabled())
                .nextReminderTime(reminder.getNextReminderTime())
                .createdAt(reminder.getCreatedAt())
                .build();
    }
}









