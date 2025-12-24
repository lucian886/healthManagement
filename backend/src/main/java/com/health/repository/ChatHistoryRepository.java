package com.health.repository;

import com.health.entity.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 对话历史仓库
 */
@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    
    List<ChatHistory> findByUserIdAndSessionIdOrderByCreatedAtAsc(Long userId, String sessionId);
    
    List<ChatHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT c.sessionId FROM ChatHistory c WHERE c.user.id = :userId GROUP BY c.sessionId ORDER BY MAX(c.createdAt) DESC")
    List<String> findDistinctSessionIdsByUserId(Long userId);
    
    // 获取会话的第一条用户消息
    ChatHistory findFirstByUserIdAndSessionIdAndRoleOrderByCreatedAtAsc(Long userId, String sessionId, String role);
    
    // 获取会话的最后消息时间
    @Query("SELECT MAX(c.createdAt) FROM ChatHistory c WHERE c.user.id = :userId AND c.sessionId = :sessionId")
    LocalDateTime findLastMessageTime(Long userId, String sessionId);
    
    // 获取会话消息数量
    @Query("SELECT COUNT(c) FROM ChatHistory c WHERE c.user.id = :userId AND c.sessionId = :sessionId")
    int countByUserIdAndSessionId(Long userId, String sessionId);
    
    void deleteByUserIdAndSessionId(Long userId, String sessionId);
    
    /**
     * 一次性获取所有会话的统计信息（解决 N+1 问题）
     * 返回：sessionId, firstUserMessage, lastMessageTime, messageCount
     */
    @Query(value = """
        SELECT 
            c.session_id as sessionId,
            (SELECT content FROM chat_histories c2 
             WHERE c2.user_id = :userId AND c2.session_id = c.session_id AND c2.role = 'user' 
             ORDER BY c2.created_at ASC LIMIT 1) as firstMessage,
            MAX(c.created_at) as lastMessageTime,
            COUNT(*) as messageCount
        FROM chat_histories c 
        WHERE c.user_id = :userId 
        GROUP BY c.session_id 
        ORDER BY MAX(c.created_at) DESC
        """, nativeQuery = true)
    List<Object[]> findSessionsSummary(Long userId);
}

