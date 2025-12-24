package com.health.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.health.entity.MedicationRecord;
import com.health.entity.User;
import com.health.mapper.MedicationRecordMapper;
import com.health.mapper.UserMapper;
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
    
    private final MedicationRecordMapper medicationMapper;
    private final UserMapper userMapper;
    
    /**
     * 添加用药记录
     */
    @Transactional
    public MedicationRecord addMedication(Long userId, String medicationName, String dosage,
                                           String method, String frequency, LocalTime takeTime,
                                           LocalDate startDate, LocalDate endDate, String note) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        MedicationRecord record = MedicationRecord.builder()
                .userId(userId)
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
        
        medicationMapper.insert(record);
        return record;
    }
    
    /**
     * 获取所有用药记录
     */
    @Transactional(readOnly = true)
    public List<MedicationRecord> getMedications(Long userId) {
        LambdaQueryWrapper<MedicationRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MedicationRecord::getUserId, userId)
               .orderByDesc(MedicationRecord::getCreatedAt);
        return medicationMapper.selectList(wrapper);
    }
    
    /**
     * 获取正在服用的药物
     */
    @Transactional(readOnly = true)
    public List<MedicationRecord> getActiveMedications(Long userId) {
        LambdaQueryWrapper<MedicationRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MedicationRecord::getUserId, userId)
               .eq(MedicationRecord::getActive, true)
               .orderByDesc(MedicationRecord::getCreatedAt);
        return medicationMapper.selectList(wrapper);
    }
    
    /**
     * 更新用药记录
     */
    @Transactional
    public MedicationRecord updateMedication(Long userId, Long medicationId, String medicationName,
                                              String dosage, String method, String frequency,
                                              LocalTime takeTime, LocalDate startDate,
                                              LocalDate endDate, Boolean active, String note) {
        MedicationRecord record = medicationMapper.selectById(medicationId);
        if (record == null) {
            throw new RuntimeException("用药记录不存在");
        }
        
        if (!record.getUserId().equals(userId)) {
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
        
        medicationMapper.updateById(record);
        return record;
    }
    
    /**
     * 停止用药
     */
    @Transactional
    public MedicationRecord stopMedication(Long userId, Long medicationId) {
        MedicationRecord record = medicationMapper.selectById(medicationId);
        if (record == null) {
            throw new RuntimeException("用药记录不存在");
        }
        
        if (!record.getUserId().equals(userId)) {
            throw new RuntimeException("无权修改此记录");
        }
        
        record.setActive(false);
        record.setEndDate(LocalDate.now());
        
        medicationMapper.updateById(record);
        return record;
    }
    
    /**
     * 删除用药记录
     */
    @Transactional
    public void deleteMedication(Long userId, Long medicationId) {
        MedicationRecord record = medicationMapper.selectById(medicationId);
        if (record == null) {
            throw new RuntimeException("用药记录不存在");
        }
        
        if (!record.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除此记录");
        }
        
        medicationMapper.deleteById(medicationId);
    }
}









