package com.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.entity.MedicalRecord;
import org.apache.ibatis.annotations.Mapper;

/**
 * 病历记录Mapper
 */
@Mapper
public interface MedicalRecordMapper extends BaseMapper<MedicalRecord> {
    // 使用 LambdaQueryWrapper 在 Service 层进行查询
}
