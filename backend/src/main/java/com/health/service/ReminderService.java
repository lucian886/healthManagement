package com.health.service;

import com.health.entity.HealthReminder;
import com.health.entity.User;
import com.health.repository.HealthReminderRepository;
import com.health.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * 提醒服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderService {
    
    private final HealthReminderRepository reminderRepository;
    private final UserRepository userRepository;
    
    /**
     * 创建提醒
     */
    @Transactional
    public HealthReminder createReminder(Long userId, String reminderType, String content,
                                          LocalTime reminderTime, String repeatType, String repeatDays) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        HealthReminder reminder = HealthReminder.builder()
                .user(user)
                .reminderType(reminderType)
                .content(content)
                .reminderTime(reminderTime)
                .repeatType(repeatType != null ? repeatType : "daily")
                .repeatDays(repeatDays)
                .enabled(true)
                .build();
        
        // 计算下次提醒时间
        reminder.setNextReminderTime(calculateNextReminderTime(reminder));
        
        return reminderRepository.save(reminder);
    }
    
    /**
     * 获取用户所有提醒
     */
    @Transactional(readOnly = true)
    public List<HealthReminder> getReminders(Long userId) {
        return reminderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * 获取用户启用的提醒
     */
    @Transactional(readOnly = true)
    public List<HealthReminder> getActiveReminders(Long userId) {
        return reminderRepository.findByUserIdAndEnabledOrderByReminderTimeAsc(userId, true);
    }
    
    /**
     * 更新提醒
     */
    @Transactional
    public HealthReminder updateReminder(Long userId, Long reminderId, String content,
                                          LocalTime reminderTime, String repeatType,
                                          String repeatDays, Boolean enabled) {
        HealthReminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new RuntimeException("提醒不存在"));
        
        if (!reminder.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权修改此提醒");
        }
        
        if (content != null) reminder.setContent(content);
        if (reminderTime != null) reminder.setReminderTime(reminderTime);
        if (repeatType != null) reminder.setRepeatType(repeatType);
        if (repeatDays != null) reminder.setRepeatDays(repeatDays);
        if (enabled != null) reminder.setEnabled(enabled);
        
        // 重新计算下次提醒时间
        reminder.setNextReminderTime(calculateNextReminderTime(reminder));
        
        return reminderRepository.save(reminder);
    }
    
    /**
     * 切换提醒启用状态
     */
    @Transactional
    public HealthReminder toggleReminder(Long userId, Long reminderId) {
        HealthReminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new RuntimeException("提醒不存在"));
        
        if (!reminder.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权修改此提醒");
        }
        
        reminder.setEnabled(!reminder.getEnabled());
        if (reminder.getEnabled()) {
            reminder.setNextReminderTime(calculateNextReminderTime(reminder));
        }
        
        return reminderRepository.save(reminder);
    }
    
    /**
     * 删除提醒
     */
    @Transactional
    public void deleteReminder(Long userId, Long reminderId) {
        HealthReminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new RuntimeException("提醒不存在"));
        
        if (!reminder.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权删除此提醒");
        }
        
        reminderRepository.delete(reminder);
    }
    
    /**
     * 计算下次提醒时间
     */
    private LocalDateTime calculateNextReminderTime(HealthReminder reminder) {
        if (reminder.getReminderTime() == null) {
            return null;
        }
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextTime = LocalDateTime.of(now.toLocalDate(), reminder.getReminderTime());
        
        // 如果今天的提醒时间已过，则设为明天
        if (nextTime.isBefore(now)) {
            nextTime = nextTime.plusDays(1);
        }
        
        return nextTime;
    }
}









