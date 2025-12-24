package com.health.controller;

import com.health.dto.ApiResponse;
import com.health.dto.chat.ChatRequest;
import com.health.dto.chat.ChatResponse;
import com.health.security.UserPrincipal;
import com.health.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 聊天控制器
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    
    private final ChatService chatService;
    
    /**
     * 发送消息
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatService.chat(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    /**
     * 分析病历图片
     */
    @PostMapping("/analyze-image/{recordId}")
    public ResponseEntity<ApiResponse<ChatResponse>> analyzeRecordImage(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long recordId,
            @RequestBody(required = false) ChatRequest request) {
        try {
            String message = (request != null && request.getMessage() != null) 
                    ? request.getMessage() 
                    : "请详细分析这张医疗图片的内容";
            ChatResponse response = chatService.analyzeRecordImage(user.getId(), recordId, message);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 获取对话历史
     */
    @GetMapping("/history/{sessionId}")
    public ResponseEntity<ApiResponse<List<ChatResponse>>> getChatHistory(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String sessionId) {
        List<ChatResponse> history = chatService.getChatHistory(user.getId(), sessionId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
    
    /**
     * 获取所有会话列表
     */
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<com.health.dto.chat.SessionInfo>>> getSessions(
            @AuthenticationPrincipal UserPrincipal user) {
        var sessions = chatService.getSessions(user.getId());
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }
    
    /**
     * 删除会话
     */
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String sessionId) {
        chatService.deleteSession(user.getId(), sessionId);
        return ResponseEntity.ok(ApiResponse.success("会话已删除", null));
    }
}
