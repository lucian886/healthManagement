package com.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.entity.HealthReminder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 健康提醒Mapper
 */
@Mapper
public interface HealthReminderMapper extends BaseMapper<HealthReminder> {
    
    @Select("SELECT * FROM health_reminders WHERE user_id = #{userId} ORDER BY reminder_time ASC")
    List<HealthReminder> findByUserIdOrderByReminderTimeAsc(@Param("userId") Long userId);
    
    @Select("SELECT * FROM health_reminders WHERE user_id = #{userId} AND completed = #{completed} " +
            "ORDER BY reminder_time ASC")
    List<HealthReminder> findByUserIdAndCompletedOrderByReminderTimeAsc(
            @Param("userId") Long userId, 
            @Param("completed") Boolean completed);
    
    @Select("SELECT * FROM health_reminders WHERE reminder_time BETWEEN #{startTime} AND #{endTime} " +
            "AND completed = false AND enabled = true")
    List<HealthReminder> findUpcomingReminders(
            @Param("startTime") LocalDateTime startTime, 
            @Param("endTime") LocalDateTime endTime);
}

