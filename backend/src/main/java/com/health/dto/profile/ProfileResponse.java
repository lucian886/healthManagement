package com.health.dto.profile;

import com.health.entity.UserProfile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 档案响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    
    private Long id;
    private Long userId;
    private String realName;
    private String gender;
    private LocalDate birthDate;
    private String phone;
    private String address;
    private Double height;
    private Double weight;
    private String bloodType;
    private String allergies;
    private String medicalHistory;
    private String familyHistory;
    private String emergencyContact;
    private String emergencyPhone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static ProfileResponse fromEntity(UserProfile profile) {
        if (profile == null) return null;
        
        return ProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .realName(profile.getRealName())
                .gender(profile.getGender())
                .birthDate(profile.getBirthDate())
                .phone(profile.getPhone())
                .address(profile.getAddress())
                .height(profile.getHeight())
                .weight(profile.getWeight())
                .bloodType(profile.getBloodType())
                .allergies(profile.getAllergies())
                .medicalHistory(profile.getMedicalHistory())
                .familyHistory(profile.getFamilyHistory())
                .emergencyContact(profile.getEmergencyContact())
                .emergencyPhone(profile.getEmergencyPhone())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}











