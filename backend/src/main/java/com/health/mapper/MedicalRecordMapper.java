package com.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.entity.MedicalRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

/**
 * 病历记录Mapper
 */
@Mapper
public interface MedicalRecordMapper extends BaseMapper<MedicalRecord> {
    
    @Select("SELECT * FROM medical_records WHERE user_id = #{userId} ORDER BY record_date DESC, created_at DESC")
    List<MedicalRecord> findByUserIdOrderByRecordDateDesc(@Param("userId") Long userId);
    
    @Select("SELECT * FROM medical_records WHERE user_id = #{userId} AND record_type = #{recordType} " +
            "ORDER BY record_date DESC")
    List<MedicalRecord> findByUserIdAndRecordType(@Param("userId") Long userId, @Param("recordType") String recordType);
    
    @Select("SELECT * FROM medical_records WHERE user_id = #{userId} " +
            "AND record_date BETWEEN #{startDate} AND #{endDate} ORDER BY record_date DESC")
    List<MedicalRecord> findByUserIdAndRecordDateBetween(
            @Param("userId") Long userId, 
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate);
}

