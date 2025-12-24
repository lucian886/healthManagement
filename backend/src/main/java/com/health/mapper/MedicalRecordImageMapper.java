package com.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.entity.MedicalRecordImage;
import org.apache.ibatis.annotations.Mapper;

/**
 * 病历图片Mapper
 */
@Mapper
public interface MedicalRecordImageMapper extends BaseMapper<MedicalRecordImage> {
    // 使用 LambdaQueryWrapper 在 Service 层进行查询
}
