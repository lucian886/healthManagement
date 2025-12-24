package com.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.entity.MedicationRecord;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用药记录Mapper
 */
@Mapper
public interface MedicationRecordMapper extends BaseMapper<MedicationRecord> {
    // 使用 LambdaQueryWrapper 在 Service 层进行查询
}
