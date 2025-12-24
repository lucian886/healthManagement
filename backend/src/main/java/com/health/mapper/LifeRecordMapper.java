package com.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.entity.LifeRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

/**
 * 生活记录Mapper
 */
@Mapper
public interface LifeRecordMapper extends BaseMapper<LifeRecord> {
    
    @Select("SELECT * FROM life_records WHERE user_id = #{userId} ORDER BY record_date DESC, created_at DESC")
    List<LifeRecord> findByUserIdOrderByRecordDateDesc(@Param("userId") Long userId);
    
    @Select("SELECT * FROM life_records WHERE user_id = #{userId} AND category = #{category} " +
            "ORDER BY record_date DESC")
    List<LifeRecord> findByUserIdAndCategoryOrderByRecordDateDesc(
            @Param("userId") Long userId, 
            @Param("category") String category);
    
    @Select("SELECT * FROM life_records WHERE user_id = #{userId} " +
            "AND record_date BETWEEN #{startDate} AND #{endDate} ORDER BY record_date DESC")
    List<LifeRecord> findByUserIdAndRecordDateBetween(
            @Param("userId") Long userId, 
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate);
}

