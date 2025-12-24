package com.health.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.health.dto.profile.ProfileRequest;
import com.health.dto.profile.ProfileResponse;
import com.health.entity.User;
import com.health.entity.UserProfile;
import com.health.mapper.UserMapper;
import com.health.mapper.UserProfileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 档案服务
 */
@Service
@RequiredArgsConstructor
public class ProfileService {
    
    private final UserProfileMapper userProfileMapper;
    private final UserMapper userMapper;
    
    /**
     * 获取用户档案
     */
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        LambdaQueryWrapper<UserProfile> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserProfile::getUserId, userId);
        UserProfile profile = userProfileMapper.selectOne(wrapper);
        
        return ProfileResponse.fromEntity(profile);
    }
    
    /**
     * 更新用户档案
     */
    @Transactional
    public ProfileResponse updateProfile(Long userId, ProfileRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        LambdaQueryWrapper<UserProfile> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserProfile::getUserId, userId);
        UserProfile profile = userProfileMapper.selectOne(wrapper);
        
        if (profile == null) {
            profile = UserProfile.builder().userId(userId).build();
        }
        
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
        
        if (profile.getId() == null) {
            userProfileMapper.insert(profile);
        } else {
            userProfileMapper.updateById(profile);
        }
        
        return ProfileResponse.fromEntity(profile);
    }
}
