package com.health.repository;

import com.health.entity.MedicationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 用药记录仓库
 */
@Repository
public interface MedicationRecordRepository extends JpaRepository<MedicationRecord, Long> {
    
    // 获取用户所有用药记录
    List<MedicationRecord> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // 获取用户正在服用的药物
    List<MedicationRecord> findByUserIdAndActiveOrderByCreatedAtDesc(Long userId, Boolean active);
    
    // 按药品名称搜索
    List<MedicationRecord> findByUserIdAndMedicationNameContainingIgnoreCase(Long userId, String name);
}









