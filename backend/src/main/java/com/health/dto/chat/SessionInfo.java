package com.health.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 会话信息 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionInfo {
    
    private String sessionId;
    private String title;  // 第一条用户消息作为标题
    private LocalDateTime lastMessageTime;
    private int messageCount;
}











