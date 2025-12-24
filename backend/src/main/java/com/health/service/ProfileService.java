package com.health.service;

import com.health.dto.profile.ProfileRequest;
import com.health.dto.profile.ProfileResponse;
import com.health.entity.User;
import com.health.entity.UserProfile;
import com.health.repository.UserProfileRepository;
import com.health.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 档案服务
 */
@Service
@RequiredArgsConstructor
public class ProfileService {
    
    private final UserProfileRepository profileRepository;
    private final UserRepository userRepository;
    
    /**
     * 获取用户档案
     */
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElse(null);
        
        return ProfileResponse.fromEntity(profile);
    }
    
    /**
     * 更新用户档案
     */
    @Transactional
    public ProfileResponse updateProfile(Long userId, ProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> UserProfile.builder().user(user).build());
        
        // 更新档案信息
        if (request.getRealName() != null) profile.setRealName(request.getRealName());
        if (request.getGender() != null) profile.setGender(request.getGender());
        if (request.getBirthDate() != null) profile.setBirthDate(request.getBirthDate());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getHeight() != null) profile.setHeight(request.getHeight());
        if (request.getWeight() != null) profile.setWeight(request.getWeight());
        if (request.getBloodType() != null) profile.setBloodType(request.getBloodType());
        if (request.getAllergies() != null) profile.setAllergies(request.getAllergies());
        if (request.getMedicalHistory() != null) profile.setMedicalHistory(request.getMedicalHistory());
        if (request.getFamilyHistory() != null) profile.setFamilyHistory(request.getFamilyHistory());
        if (request.getEmergencyContact() != null) profile.setEmergencyContact(request.getEmergencyContact());
        if (request.getEmergencyPhone() != null) profile.setEmergencyPhone(request.getEmergencyPhone());
        
        profile = profileRepository.save(profile);
        
        return ProfileResponse.fromEntity(profile);
    }
}











