package com.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.entity.HealthReminder;
import org.apache.ibatis.annotations.Mapper;

/**
 * 健康提醒Mapper
 */
@Mapper
public interface HealthReminderMapper extends BaseMapper<HealthReminder> {
    // 使用 LambdaQueryWrapper 在 Service 层进行查询
}
