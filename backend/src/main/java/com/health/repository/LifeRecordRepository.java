package com.health.repository;

import com.health.entity.LifeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * 生活记录仓库
 */
@Repository
public interface LifeRecordRepository extends JpaRepository<LifeRecord, Long> {
    
    // 获取用户指定日期的记录
    List<LifeRecord> findByUserIdAndRecordDateOrderByRecordTimeDesc(Long userId, LocalDate date);
    
    // 获取用户指定类型的记录
    List<LifeRecord> findByUserIdAndRecordTypeOrderByRecordDateDesc(Long userId, String recordType);
    
    // 获取用户指定日期范围内的记录
    List<LifeRecord> findByUserIdAndRecordTypeAndRecordDateBetweenOrderByRecordDateAsc(
            Long userId, String recordType, LocalDate startDate, LocalDate endDate);
    
    // 获取用户某天某类型的记录
    List<LifeRecord> findByUserIdAndRecordTypeAndRecordDate(Long userId, String recordType, LocalDate date);
    
    // 获取用户最近N条记录
    List<LifeRecord> findTop30ByUserIdAndRecordTypeOrderByRecordDateDesc(Long userId, String recordType);
    
    // 统计用户某日期范围内的运动总时长
    @Query("SELECT SUM(l.durationMinutes) FROM LifeRecord l WHERE l.user.id = :userId " +
           "AND l.recordType = 'exercise' AND l.recordDate BETWEEN :startDate AND :endDate")
    Integer sumExerciseDuration(Long userId, LocalDate startDate, LocalDate endDate);
    
    // 统计用户某日期范围内的卡路里摄入
    @Query("SELECT SUM(l.calories) FROM LifeRecord l WHERE l.user.id = :userId " +
           "AND l.recordType = 'diet' AND l.recordDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal sumCaloriesIntake(Long userId, LocalDate startDate, LocalDate endDate);
}

