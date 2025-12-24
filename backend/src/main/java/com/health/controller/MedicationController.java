package com.health.controller;

import com.health.dto.ApiResponse;
import com.health.dto.medication.MedicationRequest;
import com.health.dto.medication.MedicationResponse;
import com.health.entity.MedicationRecord;
import com.health.security.UserPrincipal;
import com.health.service.MedicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 用药管理控制器
 */
@RestController
@RequestMapping("/api/medications")
@RequiredArgsConstructor
@Slf4j
public class MedicationController {
    
    private final MedicationService medicationService;
    
    /**
     * 添加用药记录
     */
    @PostMapping
    public ApiResponse<?> addMedication(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody MedicationRequest request) {
        try {
            MedicationRecord record = medicationService.addMedication(
                    user.getId(),
                    request.getMedicationName(),
                    request.getDosage(),
                    request.getMethod(),
                    request.getFrequency(),
                    request.getTakeTime(),
                    request.getStartDate(),
                    request.getEndDate(),
                    request.getNote()
            );
            return ApiResponse.success(MedicationResponse.from(record));
        } catch (Exception e) {
            log.error("添加用药记录失败", e);
            return ApiResponse.error("添加失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取所有用药记录
     */
    @GetMapping
    public ApiResponse<?> getMedications(@AuthenticationPrincipal UserPrincipal user) {
        try {
            List<MedicationResponse> medications = medicationService.getMedications(user.getId())
                    .stream()
                    .map(MedicationResponse::from)
                    .collect(Collectors.toList());
            return ApiResponse.success(medications);
        } catch (Exception e) {
            log.error("获取用药记录失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取正在服用的药物
     */
    @GetMapping("/active")
    public ApiResponse<?> getActiveMedications(@AuthenticationPrincipal UserPrincipal user) {
        try {
            List<MedicationResponse> medications = medicationService.getActiveMedications(user.getId())
                    .stream()
                    .map(MedicationResponse::from)
                    .collect(Collectors.toList());
            return ApiResponse.success(medications);
        } catch (Exception e) {
            log.error("获取活跃用药记录失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新用药记录
     */
    @PutMapping("/{id}")
    public ApiResponse<?> updateMedication(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id,
            @RequestBody MedicationRequest request) {
        try {
            MedicationRecord record = medicationService.updateMedication(
                    user.getId(),
                    id,
                    request.getMedicationName(),
                    request.getDosage(),
                    request.getMethod(),
                    request.getFrequency(),
                    request.getTakeTime(),
                    request.getStartDate(),
                    request.getEndDate(),
                    request.getActive(),
                    request.getNote()
            );
            return ApiResponse.success(MedicationResponse.from(record));
        } catch (Exception e) {
            log.error("更新用药记录失败", e);
            return ApiResponse.error("更新失败: " + e.getMessage());
        }
    }
    
    /**
     * 停止用药
     */
    @PatchMapping("/{id}/stop")
    public ApiResponse<?> stopMedication(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id) {
        try {
            MedicationRecord record = medicationService.stopMedication(user.getId(), id);
            return ApiResponse.success(MedicationResponse.from(record));
        } catch (Exception e) {
            log.error("停止用药失败", e);
            return ApiResponse.error("操作失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除用药记录
     */
    @DeleteMapping("/{id}")
    public ApiResponse<?> deleteMedication(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id) {
        try {
            medicationService.deleteMedication(user.getId(), id);
            return ApiResponse.success("删除成功");
        } catch (Exception e) {
            log.error("删除用药记录失败", e);
            return ApiResponse.error("删除失败: " + e.getMessage());
        }
    }
}









