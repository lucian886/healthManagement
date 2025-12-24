package com.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.entity.HealthData;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

/**
 * 健康数据Mapper
 */
@Mapper
public interface HealthDataMapper extends BaseMapper<HealthData> {
    
    @Select("SELECT * FROM health_data WHERE user_id = #{userId} AND data_type = #{dataType} ORDER BY record_date DESC")
    List<HealthData> findByUserIdAndDataType(@Param("userId") Long userId, @Param("dataType") String dataType);
    
    @Select("SELECT * FROM health_data WHERE user_id = #{userId} AND data_type = #{dataType} " +
            "AND record_date BETWEEN #{startDate} AND #{endDate} ORDER BY record_date ASC")
    List<HealthData> findByUserIdAndDataTypeAndDateRange(
            @Param("userId") Long userId, 
            @Param("dataType") String dataType, 
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate);
    
    @Select("SELECT * FROM health_data WHERE user_id = #{userId} AND data_type = #{dataType} " +
            "ORDER BY record_date DESC LIMIT 30")
    List<HealthData> findTop30ByUserIdAndDataType(@Param("userId") Long userId, @Param("dataType") String dataType);
    
    @Select("SELECT * FROM health_data WHERE user_id = #{userId} AND record_date = #{recordDate}")
    List<HealthData> findByUserIdAndRecordDate(@Param("userId") Long userId, @Param("recordDate") LocalDate recordDate);
    
    @Select("SELECT h.* FROM health_data h WHERE h.user_id = #{userId} AND h.record_date = " +
            "(SELECT MAX(h2.record_date) FROM health_data h2 WHERE h2.user_id = #{userId} AND h2.data_type = h.data_type)")
    List<HealthData> findLatestByUserId(@Param("userId") Long userId);
}

