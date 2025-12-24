package com.health.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 病历记录实体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "medical_records")
public class MedicalRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // 记录信息
    @Column(nullable = false, length = 100)
    private String title;
    
    @Column(name = "record_type", length = 50)
    private String recordType;  // 类型：检查报告、处方、病历等
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(length = 100)
    private String hospital;  // 医院
    
    @Column(length = 50)
    private String doctor;  // 医生
    
    @Column(name = "record_date")
    private LocalDate recordDate;  // 就诊日期
    
    // 文件信息（保留单文件字段，兼容旧数据）
    @Column(name = "file_path")
    private String filePath;
    
    @Column(name = "file_name")
    private String fileName;
    
    @Column(name = "file_type", length = 20)
    private String fileType;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    // 多图片关联
    @OneToMany(mappedBy = "record", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<MedicalRecordImage> images = new ArrayList<>();
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

