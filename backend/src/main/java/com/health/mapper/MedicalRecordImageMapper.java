package com.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.entity.MedicalRecordImage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 病历图片Mapper
 */
@Mapper
public interface MedicalRecordImageMapper extends BaseMapper<MedicalRecordImage> {
    
    @Select("SELECT * FROM medical_record_images WHERE record_id = #{recordId} ORDER BY sort_order ASC")
    List<MedicalRecordImage> findByRecordIdOrderBySortOrder(@Param("recordId") Long recordId);
    
    @Select("DELETE FROM medical_record_images WHERE record_id = #{recordId}")
    void deleteByRecordId(@Param("recordId") Long recordId);
}

