package com.health.dto.record;

import com.health.entity.MedicalRecord;
import com.health.entity.MedicalRecordImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 病历记录响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordResponse {
    
    private Long id;
    private Long userId;
    private String title;
    private String recordType;
    private String description;
    private String hospital;
    private String doctor;
    private LocalDate recordDate;
    private String filePath;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private List<ImageInfo> images;  // 多图片列表
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * 图片信息
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageInfo {
        private Long id;
        private String filePath;
        private String fileName;
        private String fileType;
        private Long fileSize;
        private Integer sortOrder;
    }
    
    public static RecordResponse fromEntity(MedicalRecord record) {
        List<ImageInfo> imageList = null;
        if (record.getImages() != null && !record.getImages().isEmpty()) {
            imageList = record.getImages().stream()
                    .map(img -> ImageInfo.builder()
                            .id(img.getId())
                            .filePath(img.getFilePath())
                            .fileName(img.getFileName())
                            .fileType(img.getFileType())
                            .fileSize(img.getFileSize())
                            .sortOrder(img.getSortOrder())
                            .build())
                    .collect(Collectors.toList());
        }
        
        return RecordResponse.builder()
                .id(record.getId())
                .userId(record.getUser().getId())
                .title(record.getTitle())
                .recordType(record.getRecordType())
                .description(record.getDescription())
                .hospital(record.getHospital())
                .doctor(record.getDoctor())
                .recordDate(record.getRecordDate())
                .filePath(record.getFilePath())
                .fileName(record.getFileName())
                .fileType(record.getFileType())
                .fileSize(record.getFileSize())
                .images(imageList)
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}

