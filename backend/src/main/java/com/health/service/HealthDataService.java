package com.health.service;

import com.health.entity.HealthData;
import com.health.entity.User;
import com.health.repository.HealthDataRepository;
import com.health.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 健康数据服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HealthDataService {
    
    private final HealthDataRepository healthDataRepository;
    private final UserRepository userRepository;
    
    /**
     * 记录健康数据（完整版本）
     */
    @Transactional
    public HealthData recordData(Long userId, String dataType, String value, String note,
                                  LocalDate recordDate, String recordTime,
                                  Integer systolicPressure, Integer diastolicPressure) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        HealthData data = HealthData.builder()
                .user(user)
                .dataType(dataType)
                .recordDate(recordDate != null ? recordDate : LocalDate.now())
                .recordTime(recordTime)
                .note(note)
                .build();
        
        // 根据数据类型解析值
        switch (dataType) {
            case "weight":
                data.setValue(parseDecimal(value));
                data.setUnit("kg");
                break;
            case "blood_pressure":
                // 优先使用传入的收缩压/舒张压
                if (systolicPressure != null && diastolicPressure != null) {
                    data.setSystolicPressure(systolicPressure);
                    data.setDiastolicPressure(diastolicPressure);
                } else if (value != null && value.contains("/")) {
                    // 格式：130/80
                    String[] bp = value.split("/");
                    if (bp.length == 2) {
                        data.setSystolicPressure(Integer.parseInt(bp[0].trim()));
                        data.setDiastolicPressure(Integer.parseInt(bp[1].trim()));
                    }
                }
                data.setUnit("mmHg");
                break;
            case "blood_sugar":
                data.setValue(parseDecimal(value));
                data.setUnit("mmol/L");
                break;
            case "heart_rate":
                data.setValue(parseDecimal(value));
                data.setUnit("次/分");
                break;
            case "temperature":
                data.setValue(parseDecimal(value));
                data.setUnit("℃");
                break;
            case "sleep":
                data.setValue(parseDecimal(value));
                data.setUnit("小时");
                break;
            case "exercise":
                data.setValue(parseDecimal(value));
                data.setUnit("分钟");
                break;
            case "water":
                data.setValue(parseDecimal(value));
                data.setUnit("ml");
                break;
            case "calories":
                data.setValue(parseDecimal(value));
                data.setUnit("kcal");
                break;
            case "steps":
                data.setValue(parseDecimal(value));
                data.setUnit("步");
                break;
            default:
                data.setValue(parseDecimal(value));
        }
        
        return healthDataRepository.save(data);
    }
    
    /**
     * 记录健康数据（简化版本，保持兼容）
     */
    @Transactional
    public HealthData recordData(Long userId, String dataType, String value, String note) {
        return recordData(userId, dataType, value, note, null, null, null, null);
    }
    
    private BigDecimal parseDecimal(String value) {
        if (value == null) return null;
        try {
            // 移除单位
            String numStr = value.replaceAll("[^0-9.]", "");
            return new BigDecimal(numStr);
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * 获取健康数据趋势
     */
    @Transactional(readOnly = true)
    public List<HealthData> getTrend(Long userId, String dataType, int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        
        return healthDataRepository.findByUserIdAndDataTypeAndRecordDateBetweenOrderByRecordDateAsc(
                userId, dataType, startDate, endDate);
    }
    
    /**
     * 获取用户所有类型的最新数据
     */
    @Transactional(readOnly = true)
    public List<HealthData> getLatestData(Long userId) {
        return healthDataRepository.findLatestByUserId(userId);
    }
    
    /**
     * 获取某天的所有数据
     */
    @Transactional(readOnly = true)
    public List<HealthData> getDailyData(Long userId, LocalDate date) {
        return healthDataRepository.findByUserIdAndRecordDate(userId, date);
    }
    
    /**
     * 获取历史数据
     */
    @Transactional(readOnly = true)
    public List<HealthData> getHistory(Long userId, String dataType, int limit) {
        return healthDataRepository.findByUserIdAndDataTypeOrderByRecordDateDesc(userId, dataType)
                .stream()
                .limit(limit)
                .toList();
    }
    
    /**
     * 删除数据
     */
    @Transactional
    public void deleteData(Long userId, Long dataId) {
        HealthData data = healthDataRepository.findById(dataId)
                .orElseThrow(() -> new RuntimeException("数据不存在"));
        
        if (!data.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权删除此数据");
        }
        
        healthDataRepository.delete(data);
    }
}
