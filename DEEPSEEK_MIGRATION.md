# DeepSeek AI 模型迁移指南

## 🎯 迁移概述

本次更新将 AI 服务从阿里云通义千问迁移到 **DeepSeek**，并实现了**流式输出**功能。

### 版本信息
- **新版本**: v3.0.0
- **更新日期**: 2026-01-05
- **主要变更**: 通义千问 → DeepSeek + 流式输出

---

## 🔄 核心变更

### 1. AI 模型切换

#### 之前（通义千问）
- 文本模型: `qwen-plus`
- 视觉模型: `qwen-vl-plus`
- API: DashScope SDK
- 输出方式: 一次性返回

#### 现在（DeepSeek）
- 文本模型: `deepseek-chat`
- 视觉模型: `deepseek-vl`
- API: OpenAI 兼容接口
- 输出方式: 流式输出（SSE）

### 2. 依赖变更

#### requirements.txt
```diff
- dashscope
+ openai
```

### 3. 配置变更

#### 环境变量
```bash
# 旧配置
- DASHSCOPE_API_KEY=your_api_key

# 新配置
+ DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

#### config.py
```python
# 新增配置
deepseek_api_key: str = os.getenv("DEEPSEEK_API_KEY", "")
deepseek_base_url: str = "https://api.deepseek.com"
model_name: str = "deepseek-chat"
vision_model_name: str = "deepseek-vl"
```

---

## ✨ 新功能

### 1. 流式输出（Server-Sent Events）

**特性：**
- ✅ 实时返回 AI 生成的内容
- ✅ 更好的用户体验
- ✅ 降低首字延迟
- ✅ 支持工具调用过程可视化

**API 格式：**
```python
# 流式响应（默认）
POST /api/chat
{
  "message": "你好",
  "stream": true  # 默认为 true
}

# 响应格式（SSE）
data: {"chunk": "你", "done": false}
data: {"chunk": "好", "done": false}
data: {"done": true}
```

**前端接收示例：**
```javascript
const eventSource = new EventSource('/api/chat');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.chunk) {
    // 实时显示内容
    console.log(data.chunk);
  }
  if (data.done) {
    eventSource.close();
  }
};
```

### 2. 图片分析（DeepSeek-VL）

**支持的功能：**
- ✅ 医疗报告图片识别
- ✅ 检查结果智能解读
- ✅ 化验单数据提取
- ✅ 多图片批量分析

**API 接口：**
```python
# 上传图片分析
POST /api/analyze-image
Content-Type: multipart/form-data
file: <图片文件>
message: "请分析这张检查报告"

# URL 图片分析
POST /api/analyze-image-url
{
  "imageUrl": "https://example.com/image.jpg",
  "message": "请分析这张检查报告",
  "userProfile": {...}
}
```

### 3. Function Calling 工具（18+）

**新增/恢复工具：**
- `view_latest_record` - 查看并分析最近病历图片
- `analyze_medical_image` - 分析指定病历图片
- `analyze_all_images` - 分析所有病历图片

**完整工具列表：**
1. 病历管理（7个）
   - get_medical_records
   - view_latest_record ✨
   - analyze_medical_image ✨
   - analyze_all_images ✨
   - get_medical_record_stats
   - search_medical_records
   - compare_medical_records

2. 健康数据（4个）
   - get_user_profile
   - calculate_health_metrics
   - record_health_data
   - get_health_trend

3. 健康咨询（7个）
   - analyze_symptoms
   - search_drug_info
   - recommend_department
   - provide_health_advice
   - generate_health_summary
   - suggest_followup
   - set_health_reminder

---

## 📋 迁移步骤

### 1. 更新依赖

```bash
cd ai-service
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
# 编辑 .env 文件
vim .env

# 添加 DeepSeek API Key
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# 可选：自定义模型
MODEL_NAME=deepseek-chat
VISION_MODEL_NAME=deepseek-vl
```

### 3. 启动服务

```bash
# 开发模式
python main.py

# 或使用 uvicorn
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 4. 测试验证

```bash
# 健康检查
curl http://localhost:8001/health

# 测试对话
curl -X POST http://localhost:8001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好",
    "stream": false
  }'

# 测试图片分析
curl -X POST http://localhost:8001/api/analyze-image-url \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/medical-report.jpg",
    "message": "请分析这张检查报告"
  }'
```

---

## ⚠️ 注意事项

### 1. API 费用
- DeepSeek API 需要充值使用
- 建议监控 API 调用量和费用
- 可以通过 DeepSeek 官网查看额度

### 2. 流式输出兼容性
- 前端需要支持 SSE（Server-Sent Events）
- 旧版客户端可设置 `stream: false` 兼容

### 3. 图片分析限制
- 支持的图片格式：JPEG, PNG, GIF, WebP
- 图片大小限制：请参考 DeepSeek API 文档
- Base64 编码的图片需要包含 `data:image/...` 前缀

### 4. 性能优化
- 流式输出降低了首字延迟
- 但总体处理时间可能略有增加
- 建议设置合理的超时时间

---

## 🔧 故障排查

### 问题1：API Key 无效
**症状：** 返回 401 Unauthorized  
**解决：** 
- 检查 `.env` 文件中的 `DEEPSEEK_API_KEY`
- 确认 API Key 是否正确
- 检查 DeepSeek 账户余额

### 问题2：流式输出无响应
**症状：** 前端收不到流式数据  
**解决：**
- 检查前端是否支持 SSE
- 确认网络代理/CDN 配置
- 尝试设置 `stream: false` 测试

### 问题3：图片分析失败
**症状：** 返回图片分析错误  
**解决：**
- 确认图片 URL 可访问
- 检查图片格式是否支持
- 验证 DeepSeek-VL 模型是否可用

### 问题4：工具调用失败
**症状：** Function Calling 不工作  
**解决：**
- 检查 `tools.py` 中的工具定义
- 确认 DeepSeek API 支持 Function Calling
- 查看后端日志排查具体错误

---

## 📊 性能对比

| 指标 | 通义千问 | DeepSeek |
|------|---------|----------|
| 首字延迟 | 较高 | 低（流式输出） |
| 响应质量 | 优秀 | 优秀 |
| 成本 | 中等 | 较低 |
| 图片识别 | qwen-vl-plus | deepseek-vl |
| Function Calling | ✅ | ✅ |
| 流式输出 | ❌ | ✅ |

---

## 🎉 总结

本次迁移成功实现了：
- ✅ 从通义千问切换到 DeepSeek
- ✅ 实现流式输出功能
- ✅ 保留并增强图片分析能力
- ✅ 优化用户体验
- ✅ 降低 API 成本

如有问题，请查看日志或联系开发团队。

---

**更新日期**: 2026-01-05  
**文档版本**: v1.0

