package com.health.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.health.entity.LifeRecord;
import com.health.entity.User;
import com.health.mapper.LifeRecordMapper;
import com.health.mapper.UserMapper;
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
    
    private final LifeRecordMapper lifeRecordMapper;
    private final UserMapper userMapper;
    
    /**
     * 添加饮食记录
     */
    @Transactional
    public LifeRecord addDietRecord(Long userId, LocalDate recordDate, LocalTime recordTime,
                                     String mealType, String foodContent, BigDecimal calories,
                                     String mood, String note) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        LifeRecord record = LifeRecord.builder()
                .userId(userId)
                .recordType("diet")
                .recordDate(recordDate != null ? recordDate : LocalDate.now())
                .recordTime(recordTime)
                .mealType(mealType)
                .foodContent(foodContent)
                .calories(calories)
                .mood(mood)
                .note(note)
                .build();
        
        lifeRecordMapper.insert(record);
        return record;
    }
    
    /**
     * 添加运动记录
     */
    @Transactional
    public LifeRecord addExerciseRecord(Long userId, LocalDate recordDate, LocalTime recordTime,
                                         String exerciseType, Integer durationMinutes,
                                         BigDecimal caloriesBurned, BigDecimal distance,
                                         Integer steps, String mood, String note) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        LifeRecord record = LifeRecord.builder()
                .userId(userId)
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
        
        lifeRecordMapper.insert(record);
        return record;
    }
    
    /**
     * 添加睡眠记录
     */
    @Transactional
    public LifeRecord addSleepRecord(Long userId, LocalDate recordDate,
                                      LocalTime sleepStart, LocalTime sleepEnd,
                                      BigDecimal sleepDuration, String sleepQuality,
                                      String mood, String note) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        LifeRecord record = LifeRecord.builder()
                .userId(userId)
                .recordType("sleep")
                .recordDate(recordDate != null ? recordDate : LocalDate.now())
                .sleepStart(sleepStart)
                .sleepEnd(sleepEnd)
                .sleepDuration(sleepDuration)
                .sleepQuality(sleepQuality)
                .mood(mood)
                .note(note)
                .build();
        
        lifeRecordMapper.insert(record);
        return record;
    }
    
    /**
     * 获取某天的所有记录
     */
    @Transactional(readOnly = true)
    public List<LifeRecord> getDailyRecords(Long userId, LocalDate date) {
        LambdaQueryWrapper<LifeRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LifeRecord::getUserId, userId)
               .eq(LifeRecord::getRecordDate, date)
               .orderByDesc(LifeRecord::getRecordTime);
        return lifeRecordMapper.selectList(wrapper);
    }
    
    /**
     * 获取指定类型的记录
     */
    @Transactional(readOnly = true)
    public List<LifeRecord> getRecordsByType(Long userId, String recordType) {
        LambdaQueryWrapper<LifeRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LifeRecord::getUserId, userId)
               .eq(LifeRecord::getRecordType, recordType)
               .orderByDesc(LifeRecord::getRecordDate);
        return lifeRecordMapper.selectList(wrapper);
    }
    
    /**
     * 获取最近的记录
     */
    @Transactional(readOnly = true)
    public List<LifeRecord> getRecentRecords(Long userId, String recordType) {
        LambdaQueryWrapper<LifeRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LifeRecord::getUserId, userId)
               .eq(LifeRecord::getRecordType, recordType)
               .orderByDesc(LifeRecord::getRecordDate)
               .last("LIMIT 30");
        return lifeRecordMapper.selectList(wrapper);
    }
    
    /**
     * 删除记录
     */
    @Transactional
    public void deleteRecord(Long userId, Long recordId) {
        LifeRecord record = lifeRecordMapper.selectById(recordId);
        if (record == null) {
            throw new RuntimeException("记录不存在");
        }
        
        if (!record.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除此记录");
        }
        
        lifeRecordMapper.deleteById(recordId);
    }
}
