package com.health.repository;

import com.health.entity.HealthData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * 健康数据仓库
 */
@Repository
public interface HealthDataRepository extends JpaRepository<HealthData, Long> {
    
    // 获取用户指定类型的健康数据
    List<HealthData> findByUserIdAndDataTypeOrderByRecordDateDesc(Long userId, String dataType);
    
    // 获取用户指定日期范围内的数据
    List<HealthData> findByUserIdAndDataTypeAndRecordDateBetweenOrderByRecordDateAsc(
            Long userId, String dataType, LocalDate startDate, LocalDate endDate);
    
    // 获取用户最近N条数据
    List<HealthData> findTop30ByUserIdAndDataTypeOrderByRecordDateDesc(Long userId, String dataType);
    
    // 获取用户某天的数据
    List<HealthData> findByUserIdAndRecordDate(Long userId, LocalDate recordDate);
    
    // 获取用户所有类型的最新数据
    @Query("SELECT h FROM HealthData h WHERE h.user.id = :userId AND h.recordDate = " +
           "(SELECT MAX(h2.recordDate) FROM HealthData h2 WHERE h2.user.id = :userId AND h2.dataType = h.dataType)")
    List<HealthData> findLatestByUserId(Long userId);
}











