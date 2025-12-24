package com.health.service;

import com.health.entity.MedicationRecord;
import com.health.entity.User;
import com.health.repository.MedicationRecordRepository;
import com.health.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * 用药管理服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MedicationService {
    
    private final MedicationRecordRepository medicationRepository;
    private final UserRepository userRepository;
    
    /**
     * 添加用药记录
     */
    @Transactional
    public MedicationRecord addMedication(Long userId, String medicationName, String dosage,
                                           String method, String frequency, LocalTime takeTime,
                                           LocalDate startDate, LocalDate endDate, String note) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        MedicationRecord record = MedicationRecord.builder()
                .user(user)
                .medicationName(medicationName)
                .dosage(dosage)
                .method(method)
                .frequency(frequency)
                .takeTime(takeTime)
                .startDate(startDate != null ? startDate : LocalDate.now())
                .endDate(endDate)
                .active(true)
                .note(note)
                .build();
        
        return medicationRepository.save(record);
    }
    
    /**
     * 获取所有用药记录
     */
    @Transactional(readOnly = true)
    public List<MedicationRecord> getMedications(Long userId) {
        return medicationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * 获取正在服用的药物
     */
    @Transactional(readOnly = true)
    public List<MedicationRecord> getActiveMedications(Long userId) {
        return medicationRepository.findByUserIdAndActiveOrderByCreatedAtDesc(userId, true);
    }
    
    /**
     * 更新用药记录
     */
    @Transactional
    public MedicationRecord updateMedication(Long userId, Long medicationId, String medicationName,
                                              String dosage, String method, String frequency,
                                              LocalTime takeTime, LocalDate startDate,
                                              LocalDate endDate, Boolean active, String note) {
        MedicationRecord record = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new RuntimeException("用药记录不存在"));
        
        if (!record.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权修改此记录");
        }
        
        if (medicationName != null) record.setMedicationName(medicationName);
        if (dosage != null) record.setDosage(dosage);
        if (method != null) record.setMethod(method);
        if (frequency != null) record.setFrequency(frequency);
        if (takeTime != null) record.setTakeTime(takeTime);
        if (startDate != null) record.setStartDate(startDate);
        if (endDate != null) record.setEndDate(endDate);
        if (active != null) record.setActive(active);
        if (note != null) record.setNote(note);
        
        return medicationRepository.save(record);
    }
    
    /**
     * 停止用药
     */
    @Transactional
    public MedicationRecord stopMedication(Long userId, Long medicationId) {
        MedicationRecord record = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new RuntimeException("用药记录不存在"));
        
        if (!record.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权修改此记录");
        }
        
        record.setActive(false);
        record.setEndDate(LocalDate.now());
        
        return medicationRepository.save(record);
    }
    
    /**
     * 删除用药记录
     */
    @Transactional
    public void deleteMedication(Long userId, Long medicationId) {
        MedicationRecord record = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new RuntimeException("用药记录不存在"));
        
        if (!record.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权删除此记录");
        }
        
        medicationRepository.delete(record);
    }
}









