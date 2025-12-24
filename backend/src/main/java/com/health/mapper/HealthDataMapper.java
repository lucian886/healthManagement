package com.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.entity.HealthData;
import org.apache.ibatis.annotations.Mapper;

/**
 * 健康数据Mapper
 */
@Mapper
public interface HealthDataMapper extends BaseMapper<HealthData> {
    // 使用 LambdaQueryWrapper 在 Service 层进行查询
}
