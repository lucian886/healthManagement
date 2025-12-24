package com.health.repository;

import com.health.entity.MedicalRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 病历记录仓库
 */
@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    
    List<MedicalRecord> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Page<MedicalRecord> findByUserId(Long userId, Pageable pageable);
    
    List<MedicalRecord> findByUserIdAndRecordType(Long userId, String recordType);
}











