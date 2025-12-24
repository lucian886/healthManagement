package com.health.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 对话历史实体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("chat_histories")
public class ChatHistory {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    @TableField("user_id")
    private Long userId;
    
    // 对话内容
    @TableField("role")
    private String role;  // user / assistant
    
    @TableField("content")
    private String content;
    
    // 会话ID，用于区分不同对话
    @TableField("session_id")
    private String sessionId;
    
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}











