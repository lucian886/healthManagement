package com.health.dto.profile;

import lombok.Data;

import java.time.LocalDate;

/**
 * 档案请求 DTO
 */
@Data
public class ProfileRequest {
    
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
}











