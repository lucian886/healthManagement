package com.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.entity.LifeRecord;
import org.apache.ibatis.annotations.Mapper;

/**
 * 生活记录Mapper
 */
@Mapper
public interface LifeRecordMapper extends BaseMapper<LifeRecord> {
    // 使用 LambdaQueryWrapper 在 Service 层进行查询
}
