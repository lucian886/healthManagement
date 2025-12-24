package com.health.repository;

import com.health.entity.MedicalRecordImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 病历图片仓库
 */
@Repository
public interface MedicalRecordImageRepository extends JpaRepository<MedicalRecordImage, Long> {
    
    List<MedicalRecordImage> findByRecordIdOrderBySortOrderAsc(Long recordId);
    
    void deleteByRecordId(Long recordId);
    
    int countByRecordId(Long recordId);
}











