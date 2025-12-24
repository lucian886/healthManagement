package com.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.entity.MedicationRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

/**
 * 用药记录Mapper
 */
@Mapper
public interface MedicationRecordMapper extends BaseMapper<MedicationRecord> {
    
    @Select("SELECT * FROM medication_records WHERE user_id = #{userId} ORDER BY start_date DESC")
    List<MedicationRecord> findByUserIdOrderByStartDateDesc(@Param("userId") Long userId);
    
    @Select("SELECT * FROM medication_records WHERE user_id = #{userId} AND active = #{active} " +
            "ORDER BY start_date DESC")
    List<MedicationRecord> findByUserIdAndActiveOrderByStartDateDesc(
            @Param("userId") Long userId, 
            @Param("active") Boolean active);
    
    @Select("SELECT * FROM medication_records WHERE user_id = #{userId} " +
            "AND start_date <= #{date} AND (end_date IS NULL OR end_date >= #{date}) " +
            "AND active = true ORDER BY start_date DESC")
    List<MedicationRecord> findActiveByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
}

