package com.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.entity.ChatHistory;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 聊天历史Mapper
 */
@Mapper
public interface ChatHistoryMapper extends BaseMapper<ChatHistory> {
    
    /**
     * 获取用户的所有不同会话ID（需要用到 DISTINCT，使用 XML 实现）
     */
    List<String> findDistinctSessionIdsByUserId(Long userId);
    
    /**
     * 获取会话摘要信息（需要GROUP BY，使用 XML 实现）
     * 返回: [sessionId, firstMessage, lastTime, messageCount]
     */
    List<Object[]> findSessionsSummary(Long userId);
}
