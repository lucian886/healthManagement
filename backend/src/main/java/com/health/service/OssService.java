package com.health.service;

import com.aliyun.oss.OSS;
import com.aliyun.oss.model.ObjectMetadata;
import com.aliyun.oss.model.PutObjectRequest;
import com.health.config.OssConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

/**
 * 阿里云 OSS 服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OssService {
    
    private final OSS ossClient;
    private final OssConfig ossConfig;
    
    /**
     * 上传文件到 OSS
     *
     * @param file   文件
     * @param folder 文件夹路径
     * @return 文件访问 URL
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        // 生成唯一文件名
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = folder + "/" + UUID.randomUUID().toString() + extension;
        
        // 设置文件元信息
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());
        
        // 上传文件
        try (InputStream inputStream = file.getInputStream()) {
            PutObjectRequest putObjectRequest = new PutObjectRequest(
                    ossConfig.getBucketName(),
                    fileName,
                    inputStream,
                    metadata
            );
            ossClient.putObject(putObjectRequest);
        }
        
        // 返回文件访问 URL
        String fileUrl = ossConfig.getUrlPrefix() + "/" + fileName;
        log.info("文件上传成功: {}", fileUrl);
        
        return fileUrl;
    }
    
    /**
     * 删除 OSS 文件
     *
     * @param fileUrl 文件 URL
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith(ossConfig.getUrlPrefix())) {
            return;
        }
        
        String fileName = fileUrl.replace(ossConfig.getUrlPrefix() + "/", "");
        ossClient.deleteObject(ossConfig.getBucketName(), fileName);
        log.info("文件删除成功: {}", fileUrl);
    }
}
