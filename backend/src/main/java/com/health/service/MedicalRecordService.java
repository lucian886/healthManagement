package com.health.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.health.dto.record.RecordRequest;
import com.health.dto.record.RecordResponse;
import com.health.entity.MedicalRecord;
import com.health.entity.MedicalRecordImage;
import com.health.entity.User;
import com.health.mapper.MedicalRecordImageMapper;
import com.health.mapper.MedicalRecordMapper;
import com.health.mapper.UserMapper;
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
    
    private final MedicalRecordMapper medicalRecordMapper;
    private final MedicalRecordImageMapper medicalRecordImageMapper;
    private final UserMapper userMapper;
    private final OssService ossService;
    
    /**
     * 获取用户的所有病历
     */
    @Transactional(readOnly = true)
    public List<RecordResponse> getRecords(Long userId) {
        LambdaQueryWrapper<MedicalRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MedicalRecord::getUserId, userId)
               .orderByDesc(MedicalRecord::getCreatedAt);
        return medicalRecordMapper.selectList(wrapper).stream()
                .map(RecordResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * 获取单个病历
     */
    @Transactional(readOnly = true)
    public RecordResponse getRecord(Long userId, Long recordId) {
        MedicalRecord record = medicalRecordMapper.selectById(recordId);
        if (record == null) {
            throw new RuntimeException("病历记录不存在");
        }
        
        if (!record.getUserId().equals(userId)) {
            throw new RuntimeException("无权访问此病历");
        }
        
        return RecordResponse.fromEntity(record);
    }
    
    /**
     * 创建病历记录
     */
    @Transactional
    public RecordResponse createRecord(Long userId, RecordRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        MedicalRecord record = MedicalRecord.builder()
                .userId(userId)
                .title(request.getTitle())
                .recordType(request.getRecordType())
                .description(request.getDescription())
                .hospital(request.getHospital())
                .doctor(request.getDoctor())
                .recordDate(request.getRecordDate())
                .build();
        
        medicalRecordMapper.insert(record);
        
        return RecordResponse.fromEntity(record);
    }
    
    /**
     * 上传病历文件到 OSS
     */
    @Transactional
    public RecordResponse uploadFile(Long userId, Long recordId, MultipartFile file) throws IOException {
        MedicalRecord record = medicalRecordMapper.selectById(recordId);
        if (record == null) {
            throw new RuntimeException("病历记录不存在");
        }
        
        if (!record.getUserId().equals(userId)) {
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
        
        medicalRecordMapper.updateById(record);
        
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
        MedicalRecord record = medicalRecordMapper.selectById(recordId);
        if (record == null) {
            throw new RuntimeException("病历记录不存在");
        }
        
        if (!record.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作此病历");
        }
        
        if (request.getTitle() != null) record.setTitle(request.getTitle());
        if (request.getRecordType() != null) record.setRecordType(request.getRecordType());
        if (request.getDescription() != null) record.setDescription(request.getDescription());
        if (request.getHospital() != null) record.setHospital(request.getHospital());
        if (request.getDoctor() != null) record.setDoctor(request.getDoctor());
        if (request.getRecordDate() != null) record.setRecordDate(request.getRecordDate());
        
        medicalRecordMapper.updateById(record);
        
        return RecordResponse.fromEntity(record);
    }
    
    /**
     * 删除病历
     */
    @Transactional
    public void deleteRecord(Long userId, Long recordId) {
        MedicalRecord record = medicalRecordMapper.selectById(recordId);
        if (record == null) {
            throw new RuntimeException("病历记录不存在");
        }
        
        if (!record.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作此病历");
        }
        
        // 删除 OSS 文件（主文件）
        if (record.getFilePath() != null) {
            ossService.deleteFile(record.getFilePath());
        }
        
        // 删除所有关联图片
        LambdaQueryWrapper<MedicalRecordImage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MedicalRecordImage::getRecordId, recordId);
        List<MedicalRecordImage> images = medicalRecordImageMapper.selectList(wrapper);
        for (MedicalRecordImage image : images) {
            ossService.deleteFile(image.getFilePath());
        }
        
        medicalRecordMapper.deleteById(recordId);
    }
    
    /**
     * 向病历添加多张图片
     */
    @Transactional
    public RecordResponse addImagesToRecord(Long userId, Long recordId, List<MultipartFile> files) throws IOException {
        MedicalRecord record = medicalRecordMapper.selectById(recordId);
        if (record == null) {
            throw new RuntimeException("病历记录不存在");
        }
        
        if (!record.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作此病历");
        }
        
        LambdaQueryWrapper<MedicalRecordImage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MedicalRecordImage::getRecordId, recordId);
        Long count = medicalRecordImageMapper.selectCount(wrapper);
        int currentOrder = count != null ? count.intValue() : 0;
        
        List<MedicalRecordImage> newImages = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                // 上传到 OSS
                String folder = "medical-records/" + userId;
                String fileUrl = ossService.uploadFile(file, folder);
                
                // 创建图片记录
                MedicalRecordImage image = MedicalRecordImage.builder()
                        .recordId(recordId)
                        .filePath(fileUrl)
                        .fileName(file.getOriginalFilename())
                        .fileType(file.getContentType())
                        .fileSize(file.getSize())
                        .sortOrder(currentOrder++)
                        .build();
                
                medicalRecordImageMapper.insert(image);
                newImages.add(image);
            }
        }
        
        // 如果是第一张图片，也设置为主图
        if (record.getFilePath() == null && !newImages.isEmpty()) {
            MedicalRecordImage firstImage = newImages.get(0);
            record.setFilePath(firstImage.getFilePath());
            record.setFileName(firstImage.getFileName());
            record.setFileType(firstImage.getFileType());
            record.setFileSize(firstImage.getFileSize());
            medicalRecordMapper.updateById(record);
        }
        
        return RecordResponse.fromEntity(record);
    }
    
    /**
     * 删除病历中的某张图片
     */
    @Transactional
    public RecordResponse deleteImage(Long userId, Long recordId, Long imageId) {
        MedicalRecord record = medicalRecordMapper.selectById(recordId);
        if (record == null) {
            throw new RuntimeException("病历记录不存在");
        }
        
        if (!record.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作此病历");
        }
        
        MedicalRecordImage imageToDelete = medicalRecordImageMapper.selectById(imageId);
        if (imageToDelete == null || !imageToDelete.getRecordId().equals(recordId)) {
            throw new RuntimeException("图片不存在");
        }
        
        // 删除 OSS 文件
        ossService.deleteFile(imageToDelete.getFilePath());
        
        // 从数据库中删除
        medicalRecordImageMapper.deleteById(imageId);
        
        // 如果删除的是主图，更新主图
        if (imageToDelete.getFilePath().equals(record.getFilePath())) {
            LambdaQueryWrapper<MedicalRecordImage> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(MedicalRecordImage::getRecordId, recordId)
                   .orderByAsc(MedicalRecordImage::getSortOrder);
            List<MedicalRecordImage> remainingImages = medicalRecordImageMapper.selectList(wrapper);
            
            if (!remainingImages.isEmpty()) {
                MedicalRecordImage newMain = remainingImages.get(0);
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
            medicalRecordMapper.updateById(record);
        }
        
        return RecordResponse.fromEntity(record);
    }
    
    /**
     * 获取病历的所有图片
     */
    @Transactional(readOnly = true)
    public List<MedicalRecordImage> getRecordImages(Long userId, Long recordId) {
        MedicalRecord record = medicalRecordMapper.selectById(recordId);
        if (record == null) {
            throw new RuntimeException("病历记录不存在");
        }
        
        if (!record.getUserId().equals(userId)) {
            throw new RuntimeException("无权访问此病历");
        }
        
        LambdaQueryWrapper<MedicalRecordImage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MedicalRecordImage::getRecordId, recordId)
               .orderByAsc(MedicalRecordImage::getSortOrder);
        return medicalRecordImageMapper.selectList(wrapper);
    }
}
