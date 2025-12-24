package com.health.controller;

import com.health.dto.ApiResponse;
import com.health.dto.reminder.ReminderRequest;
import com.health.dto.reminder.ReminderResponse;
import com.health.entity.HealthReminder;
import com.health.security.UserPrincipal;
import com.health.service.ReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 健康提醒控制器
 */
@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
@Slf4j
public class ReminderController {
    
    private final ReminderService reminderService;
    
    /**
     * 创建提醒
     */
    @PostMapping
    public ApiResponse<?> createReminder(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody ReminderRequest request) {
        try {
            HealthReminder reminder = reminderService.createReminder(
                    user.getId(),
                    request.getReminderType(),
                    request.getContent(),
                    request.getReminderTime(),
                    request.getRepeatType(),
                    request.getRepeatDays()
            );
            return ApiResponse.success(ReminderResponse.from(reminder));
        } catch (Exception e) {
            log.error("创建提醒失败", e);
            return ApiResponse.error("创建失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取所有提醒
     */
    @GetMapping
    public ApiResponse<?> getReminders(@AuthenticationPrincipal UserPrincipal user) {
        try {
            List<ReminderResponse> reminders = reminderService.getReminders(user.getId())
                    .stream()
                    .map(ReminderResponse::from)
                    .collect(Collectors.toList());
            return ApiResponse.success(reminders);
        } catch (Exception e) {
            log.error("获取提醒列表失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取启用的提醒
     */
    @GetMapping("/active")
    public ApiResponse<?> getActiveReminders(@AuthenticationPrincipal UserPrincipal user) {
        try {
            List<ReminderResponse> reminders = reminderService.getActiveReminders(user.getId())
                    .stream()
                    .map(ReminderResponse::from)
                    .collect(Collectors.toList());
            return ApiResponse.success(reminders);
        } catch (Exception e) {
            log.error("获取活跃提醒失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新提醒
     */
    @PutMapping("/{id}")
    public ApiResponse<?> updateReminder(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id,
            @RequestBody ReminderRequest request) {
        try {
            HealthReminder reminder = reminderService.updateReminder(
                    user.getId(),
                    id,
                    request.getContent(),
                    request.getReminderTime(),
                    request.getRepeatType(),
                    request.getRepeatDays(),
                    request.getEnabled()
            );
            return ApiResponse.success(ReminderResponse.from(reminder));
        } catch (Exception e) {
            log.error("更新提醒失败", e);
            return ApiResponse.error("更新失败: " + e.getMessage());
        }
    }
    
    /**
     * 切换提醒状态
     */
    @PatchMapping("/{id}/toggle")
    public ApiResponse<?> toggleReminder(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id) {
        try {
            HealthReminder reminder = reminderService.toggleReminder(user.getId(), id);
            return ApiResponse.success(ReminderResponse.from(reminder));
        } catch (Exception e) {
            log.error("切换提醒状态失败", e);
            return ApiResponse.error("操作失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除提醒
     */
    @DeleteMapping("/{id}")
    public ApiResponse<?> deleteReminder(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id) {
        try {
            reminderService.deleteReminder(user.getId(), id);
            return ApiResponse.success("删除成功");
        } catch (Exception e) {
            log.error("删除提醒失败", e);
            return ApiResponse.error("删除失败: " + e.getMessage());
        }
    }
}









