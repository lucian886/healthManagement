package com.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.entity.ChatHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 聊天历史Mapper
 */
@Mapper
public interface ChatHistoryMapper extends BaseMapper<ChatHistory> {
    
    @Select("SELECT * FROM chat_histories WHERE user_id = #{userId} ORDER BY created_at ASC")
    List<ChatHistory> findByUserIdOrderByCreatedAtAsc(@Param("userId") Long userId);
    
    @Select("SELECT * FROM chat_histories WHERE user_id = #{userId} AND session_id = #{sessionId} " +
            "ORDER BY created_at ASC")
    List<ChatHistory> findByUserIdAndSessionIdOrderByCreatedAtAsc(
            @Param("userId") Long userId, 
            @Param("sessionId") String sessionId);
    
    @Select("SELECT DISTINCT session_id FROM chat_histories WHERE user_id = #{userId} ORDER BY created_at DESC")
    List<String> findDistinctSessionIdsByUserId(@Param("userId") Long userId);
    
    @Select("DELETE FROM chat_histories WHERE user_id = #{userId}")
    void deleteByUserId(@Param("userId") Long userId);
    
    @Select("DELETE FROM chat_histories WHERE user_id = #{userId} AND session_id = #{sessionId}")
    void deleteByUserIdAndSessionId(@Param("userId") Long userId, @Param("sessionId") String sessionId);
}

