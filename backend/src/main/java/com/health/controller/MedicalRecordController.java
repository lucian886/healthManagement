package com.health.controller;

import com.health.dto.ApiResponse;
import com.health.dto.record.RecordRequest;
import com.health.dto.record.RecordResponse;
import com.health.security.UserPrincipal;
import com.health.service.MedicalRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * 病历记录控制器
 */
@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
public class MedicalRecordController {
    
    private final MedicalRecordService recordService;
    
    /**
     * 获取所有病历
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<RecordResponse>>> getRecords(
            @AuthenticationPrincipal UserPrincipal user) {
        List<RecordResponse> records = recordService.getRecords(user.getId());
        return ResponseEntity.ok(ApiResponse.success(records));
    }
    
    /**
     * 获取单个病历
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecordResponse>> getRecord(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id) {
        try {
            RecordResponse record = recordService.getRecord(user.getId(), id);
            return ResponseEntity.ok(ApiResponse.success(record));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 创建病历记录
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RecordResponse>> createRecord(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody RecordRequest request) {
        RecordResponse record = recordService.createRecord(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("病历创建成功", record));
    }
    
    /**
     * 上传病历文件（单个）
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<RecordResponse>> uploadRecord(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam("title") String title,
            @RequestParam(value = "recordType", required = false) String recordType,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "hospital", required = false) String hospital,
            @RequestParam(value = "doctor", required = false) String doctor,
            @RequestParam(value = "recordDate", required = false) String recordDate,
            @RequestParam("file") MultipartFile file) {
        try {
            RecordRequest request = new RecordRequest();
            request.setTitle(title);
            request.setRecordType(recordType);
            request.setDescription(description);
            request.setHospital(hospital);
            request.setDoctor(doctor);
            if (recordDate != null && !recordDate.isEmpty()) {
                request.setRecordDate(java.time.LocalDate.parse(recordDate));
            }
            
            RecordResponse record = recordService.createRecordWithFile(user.getId(), request, file);
            return ResponseEntity.ok(ApiResponse.success("病历上传成功", record));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("文件上传失败: " + e.getMessage()));
        }
    }
    
    /**
     * 批量上传病历文件
     */
    @PostMapping(value = "/upload-batch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<RecordResponse>>> uploadBatchRecords(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(value = "recordType", required = false) String recordType,
            @RequestParam(value = "hospital", required = false) String hospital,
            @RequestParam(value = "doctor", required = false) String doctor,
            @RequestParam(value = "recordDate", required = false) String recordDate,
            @RequestParam("files") MultipartFile[] files) {
        try {
            List<RecordResponse> results = new ArrayList<>();
            java.time.LocalDate parsedDate = null;
            if (recordDate != null && !recordDate.isEmpty()) {
                parsedDate = java.time.LocalDate.parse(recordDate);
            }
            
            for (MultipartFile file : files) {
                String originalFilename = file.getOriginalFilename();
                String title = originalFilename != null ? 
                        originalFilename.substring(0, originalFilename.lastIndexOf(".")) : 
                        "病历-" + System.currentTimeMillis();
                
                RecordRequest request = new RecordRequest();
                request.setTitle(title);
                request.setRecordType(recordType);
                request.setHospital(hospital);
                request.setDoctor(doctor);
                request.setRecordDate(parsedDate);
                
                RecordResponse record = recordService.createRecordWithFile(user.getId(), request, file);
                results.add(record);
            }
            
            return ResponseEntity.ok(ApiResponse.success("批量上传成功，共 " + results.size() + " 份", results));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("批量上传失败: " + e.getMessage()));
        }
    }
    
    /**
     * 更新病历记录
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RecordResponse>> updateRecord(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id,
            @RequestBody RecordRequest request) {
        try {
            RecordResponse record = recordService.updateRecord(user.getId(), id, request);
            return ResponseEntity.ok(ApiResponse.success("病历更新成功", record));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 删除病历记录
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRecord(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id) {
        try {
            recordService.deleteRecord(user.getId(), id);
            return ResponseEntity.ok(ApiResponse.success("病历删除成功", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 向病历添加图片（支持批量）
     */
    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<RecordResponse>> addImages(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) {
        try {
            RecordResponse record = recordService.addImagesToRecord(user.getId(), id, files);
            return ResponseEntity.ok(ApiResponse.success("图片添加成功，共 " + files.size() + " 张", record));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("图片添加失败: " + e.getMessage()));
        }
    }
    
    /**
     * 删除病历中的某张图片
     */
    @DeleteMapping("/{recordId}/images/{imageId}")
    public ResponseEntity<ApiResponse<RecordResponse>> deleteImage(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long recordId,
            @PathVariable Long imageId) {
        try {
            RecordResponse record = recordService.deleteImage(user.getId(), recordId, imageId);
            return ResponseEntity.ok(ApiResponse.success("图片删除成功", record));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
