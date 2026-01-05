package com.health.controller;

import com.health.dto.ApiResponse;
import com.health.dto.life.LifeRecordRequest;
import com.health.dto.life.LifeRecordResponse;
import com.health.entity.LifeRecord;
import com.health.security.UserPrincipal;
import com.health.service.LifeRecordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 生活记录控制器
 */
@RestController
@RequestMapping("/api/life-records")
@RequiredArgsConstructor
@Slf4j
public class LifeRecordController extends BaseController {
    
    private final LifeRecordService lifeRecordService;
    
    /**
     * 添加生活记录
     */
    @PostMapping
    public ApiResponse<?> addRecord(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody LifeRecordRequest request) {
        try {
            LifeRecord record;
            switch (request.getRecordType()) {
                case "diet":
                    record = lifeRecordService.addDietRecord(
                            getCurrentUserId(user),
                            request.getRecordDate(),
                            request.getRecordTime(),
                            request.getMealType(),
                            request.getFoodContent(),
                            request.getCalories(),
                            request.getMood(),
                            request.getNote()
                    );
                    break;
                case "exercise":
                    record = lifeRecordService.addExerciseRecord(
                            getCurrentUserId(user),
                            request.getRecordDate(),
                            request.getRecordTime(),
                            request.getExerciseType(),
                            request.getDurationMinutes(),
                            request.getCaloriesBurned(),
                            request.getDistance(),
                            request.getSteps(),
                            request.getMood(),
                            request.getNote()
                    );
                    break;
                case "sleep":
                    record = lifeRecordService.addSleepRecord(
                            getCurrentUserId(user),
                            request.getRecordDate(),
                            request.getSleepStart(),
                            request.getSleepEnd(),
                            request.getSleepDuration(),
                            request.getSleepQuality(),
                            request.getMood(),
                            request.getNote()
                    );
                    break;
                default:
                    return ApiResponse.error("不支持的记录类型");
            }
            return ApiResponse.success(LifeRecordResponse.from(record));
        } catch (Exception e) {
            log.error("添加生活记录失败", e);
            return ApiResponse.error("添加失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取某天的所有记录
     */
    @GetMapping("/daily")
    public ApiResponse<?> getDailyRecords(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<LifeRecordResponse> records = lifeRecordService.getDailyRecords(getCurrentUserId(user), date)
                    .stream()
                    .map(LifeRecordResponse::from)
                    .collect(Collectors.toList());
            return ApiResponse.success(records);
        } catch (Exception e) {
            log.error("获取每日记录失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取指定类型的记录
     */
    @GetMapping("/type/{recordType}")
    public ApiResponse<?> getRecordsByType(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String recordType) {
        try {
            List<LifeRecordResponse> records = lifeRecordService.getRecordsByType(getCurrentUserId(user), recordType)
                    .stream()
                    .map(LifeRecordResponse::from)
                    .collect(Collectors.toList());
            return ApiResponse.success(records);
        } catch (Exception e) {
            log.error("获取类型记录失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取最近的记录
     */
    @GetMapping("/recent/{recordType}")
    public ApiResponse<?> getRecentRecords(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String recordType) {
        try {
            List<LifeRecordResponse> records = lifeRecordService.getRecentRecords(getCurrentUserId(user), recordType)
                    .stream()
                    .map(LifeRecordResponse::from)
                    .collect(Collectors.toList());
            return ApiResponse.success(records);
        } catch (Exception e) {
            log.error("获取最近记录失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除记录
     */
    @DeleteMapping("/{id}")
    public ApiResponse<?> deleteRecord(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id) {
        try {
            lifeRecordService.deleteRecord(getCurrentUserId(user), id);
            return ApiResponse.success("删除成功");
        } catch (Exception e) {
            log.error("删除记录失败", e);
            return ApiResponse.error("删除失败: " + e.getMessage());
        }
    }
}












