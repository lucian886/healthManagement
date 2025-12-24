package com.health.repository;

import com.health.entity.HealthReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 健康提醒仓库
 */
@Repository
public interface HealthReminderRepository extends JpaRepository<HealthReminder, Long> {
    
    // 获取用户所有提醒
    List<HealthReminder> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // 获取用户启用的提醒
    List<HealthReminder> findByUserIdAndEnabledOrderByReminderTimeAsc(Long userId, Boolean enabled);
    
    // 根据类型获取提醒
    List<HealthReminder> findByUserIdAndReminderType(Long userId, String reminderType);
}











