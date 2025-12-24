package com.health.service;

import com.health.dto.record.RecordRequest;
import com.health.dto.record.RecordResponse;
import com.health.entity.MedicalRecord;
import com.health.entity.MedicalRecordImage;
import com.health.entity.User;
import com.health.repository.MedicalRecordImageRepository;
import com.health.repository.MedicalRecordRepository;
import com.health.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 病历记录服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MedicalRecordService {
    
    private final MedicalRecordRepository recordRepository;
    private final MedicalRecordImageRepository imageRepository;
    private final UserRepository userRepository;
    private final OssService ossService;
    
    /**
     * 获取用户的所有病历
     */
    @Transactional(readOnly = true)
    public List<RecordResponse> getRecords(Long userId) {
        return recordRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(RecordResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * 获取单个病历
     */
    @Transactional(readOnly = true)
    public RecordResponse getRecord(Long userId, Long recordId) {
        MedicalRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("病历记录不存在"));
        
        if (!record.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权访问此病历");
        }
        
        return RecordResponse.fromEntity(record);
    }
    
    /**
     * 创建病历记录
     */
    @Transactional
    public RecordResponse createRecord(Long userId, RecordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        MedicalRecord record = MedicalRecord.builder()
                .user(user)
                .title(request.getTitle())
                .recordType(request.getRecordType())
                .description(request.getDescription())
                .hospital(request.getHospital())
                .doctor(request.getDoctor())
                .recordDate(request.getRecordDate())
                .build();
        
        record = recordRepository.save(record);
        
        return RecordResponse.fromEntity(record);
    }
    
    /**
     * 上传病历文件到 OSS
     */
    @Transactional
    public RecordResponse uploadFile(Long userId, Long recordId, MultipartFile file) throws IOException {
        MedicalRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("病历记录不存在"));
        
        if (!record.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权操作此病历");
        }
        
        // 删除旧文件
        if (record.getFilePath() != null) {
            ossService.deleteFile(record.getFilePath());
        }
        
        // 上传新文件到 OSS
        String folder = "medical-records/" + userId;
        String fileUrl = ossService.uploadFile(file, folder);
        
        // 更新记录
        record.setFilePath(fileUrl);
        record.setFileName(file.getOriginalFilename());
        record.setFileType(file.getContentType());
        record.setFileSize(file.getSize());
        
        record = recordRepository.save(record);
        
        return RecordResponse.fromEntity(record);
    }
    
    /**
     * 创建病历并上传文件
     */
    @Transactional
    public RecordResponse createRecordWithFile(Long userId, RecordRequest request, MultipartFile file) throws IOException {
        RecordResponse response = createRecord(userId, request);
        
        if (file != null && !file.isEmpty()) {
            response = uploadFile(userId, response.getId(), file);
        }
        
        return response;
    }
    
    /**
     * 更新病历
     */
    @Transactional
    public RecordResponse updateRecord(Long userId, Long recordId, RecordRequest request) {
        MedicalRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("病历记录不存在"));
        
        if (!record.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权操作此病历");
        }
        
        if (request.getTitle() != null) record.setTitle(request.getTitle());
        if (request.getRecordType() != null) record.setRecordType(request.getRecordType());
        if (request.getDescription() != null) record.setDescription(request.getDescription());
        if (request.getHospital() != null) record.setHospital(request.getHospital());
        if (request.getDoctor() != null) record.setDoctor(request.getDoctor());
        if (request.getRecordDate() != null) record.setRecordDate(request.getRecordDate());
        
        record = recordRepository.save(record);
        
        return RecordResponse.fromEntity(record);
    }
    
    /**
     * 删除病历
     */
    @Transactional
    public void deleteRecord(Long userId, Long recordId) {
        MedicalRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("病历记录不存在"));
        
        if (!record.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权操作此病历");
        }
        
        // 删除 OSS 文件（主文件）
        if (record.getFilePath() != null) {
            ossService.deleteFile(record.getFilePath());
        }
        
        // 删除所有关联图片
        for (MedicalRecordImage image : record.getImages()) {
            ossService.deleteFile(image.getFilePath());
        }
        
        recordRepository.delete(record);
    }
    
    /**
     * 向病历添加多张图片
     */
    @Transactional
    public RecordResponse addImagesToRecord(Long userId, Long recordId, List<MultipartFile> files) throws IOException {
        MedicalRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("病历记录不存在"));
        
        if (!record.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权操作此病历");
        }
        
        int currentOrder = record.getImages().size();
        
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                // 上传到 OSS
                String folder = "medical-records/" + userId;
                String fileUrl = ossService.uploadFile(file, folder);
                
                // 创建图片记录
                MedicalRecordImage image = MedicalRecordImage.builder()
                        .record(record)
                        .filePath(fileUrl)
                        .fileName(file.getOriginalFilename())
                        .fileType(file.getContentType())
                        .fileSize(file.getSize())
                        .sortOrder(currentOrder++)
                        .build();
                
                record.getImages().add(image);
            }
        }
        
        // 如果是第一张图片，也设置为主图
        if (record.getFilePath() == null && !record.getImages().isEmpty()) {
            MedicalRecordImage firstImage = record.getImages().get(0);
            record.setFilePath(firstImage.getFilePath());
            record.setFileName(firstImage.getFileName());
            record.setFileType(firstImage.getFileType());
            record.setFileSize(firstImage.getFileSize());
        }
        
        record = recordRepository.save(record);
        
        return RecordResponse.fromEntity(record);
    }
    
    /**
     * 删除病历中的某张图片
     */
    @Transactional
    public RecordResponse deleteImage(Long userId, Long recordId, Long imageId) {
        MedicalRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("病历记录不存在"));
        
        if (!record.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权操作此病历");
        }
        
        MedicalRecordImage imageToDelete = record.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("图片不存在"));
        
        // 删除 OSS 文件
        ossService.deleteFile(imageToDelete.getFilePath());
        
        // 从列表中移除
        record.getImages().remove(imageToDelete);
        
        // 如果删除的是主图，更新主图
        if (imageToDelete.getFilePath().equals(record.getFilePath())) {
            if (!record.getImages().isEmpty()) {
                MedicalRecordImage newMain = record.getImages().get(0);
                record.setFilePath(newMain.getFilePath());
                record.setFileName(newMain.getFileName());
                record.setFileType(newMain.getFileType());
                record.setFileSize(newMain.getFileSize());
            } else {
                record.setFilePath(null);
                record.setFileName(null);
                record.setFileType(null);
                record.setFileSize(null);
            }
        }
        
        record = recordRepository.save(record);
        
        return RecordResponse.fromEntity(record);
    }
    
    /**
     * 获取病历的所有图片
     */
    @Transactional(readOnly = true)
    public List<MedicalRecordImage> getRecordImages(Long userId, Long recordId) {
        MedicalRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("病历记录不存在"));
        
        if (!record.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权访问此病历");
        }
        
        return record.getImages();
    }
}
