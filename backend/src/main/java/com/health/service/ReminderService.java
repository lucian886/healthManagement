package com.health.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.health.entity.HealthReminder;
import com.health.entity.User;
import com.health.mapper.HealthReminderMapper;
import com.health.mapper.UserMapper;
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
    
    private final HealthReminderMapper healthReminderMapper;
    private final UserMapper userMapper;
    
    /**
     * 创建提醒
     */
    @Transactional
    public HealthReminder createReminder(Long userId, String reminderType, String content,
                                          LocalTime reminderTime, String repeatType, String repeatDays) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        HealthReminder reminder = HealthReminder.builder()
                .userId(userId)
                .reminderType(reminderType)
                .content(content)
                .reminderTime(reminderTime)
                .repeatType(repeatType != null ? repeatType : "daily")
                .repeatDays(repeatDays)
                .enabled(true)
                .build();
        
        // 计算下次提醒时间
        reminder.setNextReminderTime(calculateNextReminderTime(reminder));
        
        healthReminderMapper.insert(reminder);
        return reminder;
    }
    
    /**
     * 获取用户所有提醒
     */
    @Transactional(readOnly = true)
    public List<HealthReminder> getReminders(Long userId) {
        LambdaQueryWrapper<HealthReminder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HealthReminder::getUserId, userId)
               .orderByDesc(HealthReminder::getCreatedAt);
        return healthReminderMapper.selectList(wrapper);
    }
    
    /**
     * 获取用户启用的提醒
     */
    @Transactional(readOnly = true)
    public List<HealthReminder> getActiveReminders(Long userId) {
        LambdaQueryWrapper<HealthReminder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HealthReminder::getUserId, userId)
               .eq(HealthReminder::getEnabled, true)
               .orderByAsc(HealthReminder::getReminderTime);
        return healthReminderMapper.selectList(wrapper);
    }
    
    /**
     * 更新提醒
     */
    @Transactional
    public HealthReminder updateReminder(Long userId, Long reminderId, String content,
                                          LocalTime reminderTime, String repeatType,
                                          String repeatDays, Boolean enabled) {
        HealthReminder reminder = healthReminderMapper.selectById(reminderId);
        if (reminder == null) {
            throw new RuntimeException("提醒不存在");
        }
        
        if (!reminder.getUserId().equals(userId)) {
            throw new RuntimeException("无权修改此提醒");
        }
        
        if (content != null) reminder.setContent(content);
        if (reminderTime != null) reminder.setReminderTime(reminderTime);
        if (repeatType != null) reminder.setRepeatType(repeatType);
        if (repeatDays != null) reminder.setRepeatDays(repeatDays);
        if (enabled != null) reminder.setEnabled(enabled);
        
        // 重新计算下次提醒时间
        reminder.setNextReminderTime(calculateNextReminderTime(reminder));
        
        healthReminderMapper.updateById(reminder);
        return reminder;
    }
    
    /**
     * 切换提醒启用状态
     */
    @Transactional
    public HealthReminder toggleReminder(Long userId, Long reminderId) {
        HealthReminder reminder = healthReminderMapper.selectById(reminderId);
        if (reminder == null) {
            throw new RuntimeException("提醒不存在");
        }
        
        if (!reminder.getUserId().equals(userId)) {
            throw new RuntimeException("无权修改此提醒");
        }
        
        reminder.setEnabled(!reminder.getEnabled());
        if (reminder.getEnabled()) {
            reminder.setNextReminderTime(calculateNextReminderTime(reminder));
        }
        
        healthReminderMapper.updateById(reminder);
        return reminder;
    }
    
    /**
     * 删除提醒
     */
    @Transactional
    public void deleteReminder(Long userId, Long reminderId) {
        HealthReminder reminder = healthReminderMapper.selectById(reminderId);
        if (reminder == null) {
            throw new RuntimeException("提醒不存在");
        }
        
        if (!reminder.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除此提醒");
        }
        
        healthReminderMapper.deleteById(reminderId);
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
