package com.health.controller;

import com.health.dto.ApiResponse;
import com.health.dto.health.HealthDataRequest;
import com.health.dto.health.HealthDataResponse;
import com.health.entity.HealthData;
import com.health.security.UserPrincipal;
import com.health.service.HealthDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 健康数据控制器
 */
@RestController
@RequestMapping("/api/health-data")
@RequiredArgsConstructor
@Slf4j
public class HealthDataController {
    
    private final HealthDataService healthDataService;
    
    /**
     * 记录健康数据
     */
    @PostMapping
    public ApiResponse<?> recordData(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody HealthDataRequest request) {
        try {
            HealthData data = healthDataService.recordData(
                    user.getId(),
                    request.getDataType(),
                    request.getValue(),
                    request.getNote(),
                    request.getRecordDate(),
                    request.getRecordTime(),
                    request.getSystolicPressure(),
                    request.getDiastolicPressure()
            );
            return ApiResponse.success(HealthDataResponse.from(data));
        } catch (Exception e) {
            log.error("记录健康数据失败", e);
            return ApiResponse.error("记录失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取最新健康数据（各类型）
     */
    @GetMapping("/latest")
    public ApiResponse<?> getLatestData(@AuthenticationPrincipal UserPrincipal user) {
        try {
            List<HealthDataResponse> data = healthDataService.getLatestData(user.getId())
                    .stream()
                    .map(HealthDataResponse::from)
                    .collect(Collectors.toList());
            return ApiResponse.success(data);
        } catch (Exception e) {
            log.error("获取最新数据失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取健康数据趋势
     */
    @GetMapping("/trend/{dataType}")
    public ApiResponse<?> getTrend(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String dataType,
            @RequestParam(defaultValue = "30") int days) {
        try {
            List<HealthDataResponse> data = healthDataService.getTrend(user.getId(), dataType, days)
                    .stream()
                    .map(HealthDataResponse::from)
                    .collect(Collectors.toList());
            return ApiResponse.success(data);
        } catch (Exception e) {
            log.error("获取趋势数据失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取某天的所有数据
     */
    @GetMapping("/daily")
    public ApiResponse<?> getDailyData(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<HealthDataResponse> data = healthDataService.getDailyData(user.getId(), date)
                    .stream()
                    .map(HealthDataResponse::from)
                    .collect(Collectors.toList());
            return ApiResponse.success(data);
        } catch (Exception e) {
            log.error("获取每日数据失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取指定类型的历史数据
     */
    @GetMapping("/history/{dataType}")
    public ApiResponse<?> getHistory(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String dataType,
            @RequestParam(defaultValue = "30") int limit) {
        try {
            List<HealthDataResponse> data = healthDataService.getHistory(user.getId(), dataType, limit)
                    .stream()
                    .map(HealthDataResponse::from)
                    .collect(Collectors.toList());
            return ApiResponse.success(data);
        } catch (Exception e) {
            log.error("获取历史数据失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除数据
     */
    @DeleteMapping("/{id}")
    public ApiResponse<?> deleteData(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id) {
        try {
            healthDataService.deleteData(user.getId(), id);
            return ApiResponse.success("删除成功");
        } catch (Exception e) {
            log.error("删除数据失败", e);
            return ApiResponse.error("删除失败: " + e.getMessage());
        }
    }
}









