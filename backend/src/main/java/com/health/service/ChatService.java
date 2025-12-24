package com.health.service;

import com.health.dto.chat.ChatRequest;
import com.health.dto.chat.ChatResponse;
import com.health.entity.ChatHistory;
import com.health.entity.MedicalRecord;
import com.health.entity.User;
import com.health.entity.UserProfile;
import com.health.repository.ChatHistoryRepository;
import com.health.repository.MedicalRecordRepository;
import com.health.repository.UserProfileRepository;
import com.health.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 聊天服务 - 调用 Python AI 服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    
    private final ChatHistoryRepository chatHistoryRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final RestTemplate restTemplate;
    
    @Value("${ai.service.url:http://localhost:8001}")
    private String aiServiceUrl;
    
    /**
     * 发送消息并获取 AI 响应
     */
    @Transactional
    public ChatResponse chat(Long userId, ChatRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 生成或使用会话ID
        String sessionId = request.getSessionId();
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = UUID.randomUUID().toString();
        }
        
        // 保存用户消息
        ChatHistory userMessage = ChatHistory.builder()
                .user(user)
                .role("user")
                .content(request.getMessage())
                .sessionId(sessionId)
                .build();
        chatHistoryRepository.save(userMessage);
        
        // 获取用户档案作为上下文
        UserProfile profile = profileRepository.findByUserId(userId).orElse(null);
        
        // 获取用户的病历记录
        List<MedicalRecord> medicalRecords = medicalRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        // 获取历史对话
        List<ChatHistory> history = chatHistoryRepository
                .findByUserIdAndSessionIdOrderByCreatedAtAsc(userId, sessionId);
        
        // 调用 AI 服务
        String aiResponse = callAiService(request.getMessage(), profile, medicalRecords, history);
        
        // 保存 AI 响应
        ChatHistory assistantMessage = ChatHistory.builder()
                .user(user)
                .role("assistant")
                .content(aiResponse)
                .sessionId(sessionId)
                .build();
        chatHistoryRepository.save(assistantMessage);
        
        return ChatResponse.builder()
                .role("assistant")
                .content(aiResponse)
                .sessionId(sessionId)
                .createdAt(LocalDateTime.now())
                .build();
    }
    
    /**
     * 分析指定病历的图片
     */
    @Transactional
    public ChatResponse analyzeRecordImage(Long userId, Long recordId, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("病历记录不存在"));
        
        if (!record.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权访问此病历");
        }
        
        if (record.getFilePath() == null || record.getFilePath().isEmpty()) {
            throw new RuntimeException("该病历没有上传图片");
        }
        
        // 获取用户档案
        UserProfile profile = profileRepository.findByUserId(userId).orElse(null);
        
        // 调用 AI 图片分析
        String aiResponse = callAiImageAnalysis(message, record.getFilePath(), profile);
        
        return ChatResponse.builder()
                .role("assistant")
                .content(aiResponse)
                .sessionId(UUID.randomUUID().toString())
                .createdAt(LocalDateTime.now())
                .build();
    }
    
    /**
     * 调用 Python AI 服务
     */
    private String callAiService(String message, UserProfile profile, List<MedicalRecord> records, List<ChatHistory> history) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("message", message);
            
            // 添加用户健康档案信息
            if (profile != null) {
                Map<String, Object> profileData = new HashMap<>();
                profileData.put("realName", profile.getRealName());
                profileData.put("gender", profile.getGender());
                profileData.put("birthDate", profile.getBirthDate() != null ? profile.getBirthDate().toString() : null);
                profileData.put("height", profile.getHeight());
                profileData.put("weight", profile.getWeight());
                profileData.put("bloodType", profile.getBloodType());
                profileData.put("allergies", profile.getAllergies());
                profileData.put("medicalHistory", profile.getMedicalHistory());
                profileData.put("familyHistory", profile.getFamilyHistory());
                requestBody.put("userProfile", profileData);
            }
            
            // 添加病历记录信息（包含图片 URL）
            if (records != null && !records.isEmpty()) {
                List<Map<String, Object>> recordsData = records.stream()
                        .map(r -> {
                            Map<String, Object> record = new HashMap<>();
                            record.put("id", r.getId());
                            record.put("title", r.getTitle());
                            record.put("recordType", r.getRecordType());
                            record.put("description", r.getDescription());
                            record.put("hospital", r.getHospital());
                            record.put("doctor", r.getDoctor());
                            record.put("recordDate", r.getRecordDate() != null ? r.getRecordDate().toString() : null);
                            record.put("fileName", r.getFileName());
                            record.put("imageUrl", r.getFilePath()); // OSS 图片 URL
                            return record;
                        })
                        .collect(Collectors.toList());
                requestBody.put("medicalRecords", recordsData);
            }
            
            // 添加对话历史
            List<Map<String, String>> historyData = history.stream()
                    .map(h -> {
                        Map<String, String> msg = new HashMap<>();
                        msg.put("role", h.getRole());
                        msg.put("content", h.getContent());
                        return msg;
                    })
                    .collect(Collectors.toList());
            requestBody.put("history", historyData);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    aiServiceUrl + "/api/chat",
                    entity,
                    Map.class
            );
            
            if (response != null && response.containsKey("response")) {
                return (String) response.get("response");
            }
            
            return "抱歉，AI 服务暂时不可用，请稍后再试。";
            
        } catch (Exception e) {
            log.error("调用 AI 服务失败: {}", e.getMessage());
            return "抱歉，AI 服务暂时不可用，请稍后再试。错误信息: " + e.getMessage();
        }
    }
    
    /**
     * 调用 AI 图片分析服务
     */
    private String callAiImageAnalysis(String message, String imageUrl, UserProfile profile) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("message", message != null ? message : "请分析这张医疗图片");
            requestBody.put("imageUrl", imageUrl);
            
            // 添加用户档案
            if (profile != null) {
                Map<String, Object> profileData = new HashMap<>();
                profileData.put("realName", profile.getRealName());
                profileData.put("gender", profile.getGender());
                profileData.put("height", profile.getHeight());
                profileData.put("weight", profile.getWeight());
                profileData.put("bloodType", profile.getBloodType());
                profileData.put("allergies", profile.getAllergies());
                profileData.put("medicalHistory", profile.getMedicalHistory());
                requestBody.put("userProfile", profileData);
            }
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    aiServiceUrl + "/api/analyze-image-url",
                    entity,
                    Map.class
            );
            
            if (response != null && response.containsKey("response")) {
                return (String) response.get("response");
            }
            
            return "抱歉，图片分析服务暂时不可用。";
            
        } catch (Exception e) {
            log.error("调用图片分析服务失败: {}", e.getMessage());
            return "抱歉，图片分析服务暂时不可用。错误信息: " + e.getMessage();
        }
    }
    
    /**
     * 获取对话历史
     */
    @Transactional(readOnly = true)
    public List<ChatResponse> getChatHistory(Long userId, String sessionId) {
        return chatHistoryRepository
                .findByUserIdAndSessionIdOrderByCreatedAtAsc(userId, sessionId)
                .stream()
                .map(h -> ChatResponse.builder()
                        .role(h.getRole())
                        .content(h.getContent())
                        .sessionId(h.getSessionId())
                        .createdAt(h.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
    
    /**
     * 获取所有会话列表（包含标题）
     * 优化：使用单次查询替代 N+1 查询
     */
    @Transactional(readOnly = true)
    public List<com.health.dto.chat.SessionInfo> getSessions(Long userId) {
        // 一次查询获取所有会话信息
        List<Object[]> results = chatHistoryRepository.findSessionsSummary(userId);
        
        return results.stream().map(row -> {
            String sessionId = (String) row[0];
            String firstMessage = (String) row[1];
            java.sql.Timestamp lastTime = (java.sql.Timestamp) row[2];
            Number count = (Number) row[3];
            
            // 生成标题
            String title = "新对话";
            if (firstMessage != null && !firstMessage.isEmpty()) {
                title = firstMessage.length() > 30 
                    ? firstMessage.substring(0, 30) + "..." 
                    : firstMessage;
            }
            
            return com.health.dto.chat.SessionInfo.builder()
                    .sessionId(sessionId)
                    .title(title)
                    .lastMessageTime(lastTime != null ? lastTime.toLocalDateTime() : null)
                    .messageCount(count != null ? count.intValue() : 0)
                    .build();
        }).collect(Collectors.toList());
    }
    
    /**
     * 删除会话
     */
    @Transactional
    public void deleteSession(Long userId, String sessionId) {
        chatHistoryRepository.deleteByUserIdAndSessionId(userId, sessionId);
    }
}
