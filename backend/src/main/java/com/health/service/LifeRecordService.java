package com.health.service;

import com.health.entity.LifeRecord;
import com.health.entity.User;
import com.health.repository.LifeRecordRepository;
import com.health.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * 生活记录服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LifeRecordService {
    
    private final LifeRecordRepository lifeRecordRepository;
    private final UserRepository userRepository;
    
    /**
     * 添加饮食记录
     */
    @Transactional
    public LifeRecord addDietRecord(Long userId, LocalDate recordDate, LocalTime recordTime,
                                     String mealType, String foodContent, BigDecimal calories,
                                     String mood, String note) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        LifeRecord record = LifeRecord.builder()
                .user(user)
                .recordType("diet")
                .recordDate(recordDate != null ? recordDate : LocalDate.now())
                .recordTime(recordTime)
                .mealType(mealType)
                .foodContent(foodContent)
                .calories(calories)
                .mood(mood)
                .note(note)
                .build();
        
        return lifeRecordRepository.save(record);
    }
    
    /**
     * 添加运动记录
     */
    @Transactional
    public LifeRecord addExerciseRecord(Long userId, LocalDate recordDate, LocalTime recordTime,
                                         String exerciseType, Integer durationMinutes,
                                         BigDecimal caloriesBurned, BigDecimal distance,
                                         Integer steps, String mood, String note) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        LifeRecord record = LifeRecord.builder()
                .user(user)
                .recordType("exercise")
                .recordDate(recordDate != null ? recordDate : LocalDate.now())
                .recordTime(recordTime)
                .exerciseType(exerciseType)
                .durationMinutes(durationMinutes)
                .caloriesBurned(caloriesBurned)
                .distance(distance)
                .steps(steps)
                .mood(mood)
                .note(note)
                .build();
        
        return lifeRecordRepository.save(record);
    }
    
    /**
     * 添加睡眠记录
     */
    @Transactional
    public LifeRecord addSleepRecord(Long userId, LocalDate recordDate,
                                      LocalTime sleepStart, LocalTime sleepEnd,
                                      BigDecimal sleepDuration, String sleepQuality,
                                      String mood, String note) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        LifeRecord record = LifeRecord.builder()
                .user(user)
                .recordType("sleep")
                .recordDate(recordDate != null ? recordDate : LocalDate.now())
                .sleepStart(sleepStart)
                .sleepEnd(sleepEnd)
                .sleepDuration(sleepDuration)
                .sleepQuality(sleepQuality)
                .mood(mood)
                .note(note)
                .build();
        
        return lifeRecordRepository.save(record);
    }
    
    /**
     * 获取某天的所有记录
     */
    @Transactional(readOnly = true)
    public List<LifeRecord> getDailyRecords(Long userId, LocalDate date) {
        return lifeRecordRepository.findByUserIdAndRecordDateOrderByRecordTimeDesc(userId, date);
    }
    
    /**
     * 获取指定类型的记录
     */
    @Transactional(readOnly = true)
    public List<LifeRecord> getRecordsByType(Long userId, String recordType) {
        return lifeRecordRepository.findByUserIdAndRecordTypeOrderByRecordDateDesc(userId, recordType);
    }
    
    /**
     * 获取最近的记录
     */
    @Transactional(readOnly = true)
    public List<LifeRecord> getRecentRecords(Long userId, String recordType) {
        return lifeRecordRepository.findTop30ByUserIdAndRecordTypeOrderByRecordDateDesc(userId, recordType);
    }
    
    /**
     * 删除记录
     */
    @Transactional
    public void deleteRecord(Long userId, Long recordId) {
        LifeRecord record = lifeRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("记录不存在"));
        
        if (!record.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权删除此记录");
        }
        
        lifeRecordRepository.delete(record);
    }
}









