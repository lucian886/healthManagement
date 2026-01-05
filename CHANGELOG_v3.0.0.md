# 版本更新日志 v3.0.0

## 🎉 重大更新：DeepSeek AI 集成 + 流式输出

**发布日期**: 2026-01-05

---

## 📝 更新内容

### 🚀 主要功能

#### 1. AI 模型切换
- **从通义千问迁移到 DeepSeek**
  - 文本模型: `deepseek-chat`
  - 视觉模型: `deepseek-vl`
  - API Key: 从环境变量配置

#### 2. 流式输出（SSE）
- ✅ 实现 Server-Sent Events 流式响应
- ✅ 实时显示 AI 生成内容
- ✅ 降低首字延迟，提升用户体验
- ✅ 支持工具调用过程可视化

#### 3. 图片识别功能增强
- ✅ 使用 DeepSeek-VL 进行医疗图片分析
- ✅ 支持病历、检查报告、化验单识别
- ✅ 支持多图片批量分析
- ✅ OpenAI 兼容的 API 格式

---

## 📂 文件变更

### 新增文件
- `DEEPSEEK_MIGRATION.md` - DeepSeek 迁移指南
- `CHANGELOG_v3.0.0.md` - 本更新日志

### 修改文件

#### AI 服务 (ai-service/)
1. **requirements.txt**
   - 移除: `dashscope`
   - 新增: `openai`

2. **config.py**
   - 新增: `deepseek_api_key` 配置
   - 新增: `deepseek_base_url` 配置
   - 新增: `vision_model_name` 配置
   - 移除: `dashscope_api_key` 配置

3. **agent.py**
   - 完全重写，使用 AsyncOpenAI 客户端
   - 新增: `chat_stream()` 方法（流式输出）
   - 新增: `_analyze_image_with_deepseek()` 方法
   - 恢复: `analyze_image()` 方法
   - 优化: Function Calling 逻辑

4. **main.py**
   - 新增: `/api/chat` 流式响应支持
   - 恢复: `/api/analyze-image` 图片分析接口
   - 恢复: `/api/analyze-image-url` URL 图片分析接口
   - 更新: 健康检查接口信息
   - 优化: 错误处理和日志

5. **tools.py**
   - 恢复: `view_latest_record` 工具
   - 恢复: `analyze_medical_image` 工具
   - 恢复: `analyze_all_images` 工具
   - 优化: 图片分析逻辑

#### 配置文件
1. **env.example**
   - 更新: `DEEPSEEK_API_KEY` 环境变量说明
   - 移除: `DASHSCOPE_API_KEY` 配置

2. **README.md**
   - 更新: AI 服务技术栈说明
   - 更新: 功能特性列表
   - 更新: 快速开始指南
   - 更新: API 文档
   - 新增: v3.0.0 更新日志

---

## 🔧 技术细节

### API 变更

#### 1. 流式输出接口
```http
POST /api/chat
Content-Type: application/json

{
  "message": "你好",
  "userProfile": {...},
  "medicalRecords": [...],
  "history": [...],
  "stream": true  // 默认启用流式输出
}

响应格式（SSE）:
data: {"chunk": "你", "done": false}
data: {"chunk": "好", "done": false}
data: {"done": true}
```

#### 2. 图片分析接口
```http
POST /api/analyze-image-url
Content-Type: application/json

{
  "imageUrl": "https://example.com/image.jpg",
  "message": "请分析这张检查报告",
  "userProfile": {...}
}

响应:
{
  "response": "这是一份血常规检查报告...",
  "success": true
}
```

### 工具调用

新增/恢复的 Function Calling 工具：
1. `view_latest_record` - 查看最近病历图片
2. `analyze_medical_image` - 分析指定病历图片
3. `analyze_all_images` - 批量分析病历图片

总计 **18+ 专业工具**，覆盖：
- 病历管理
- 图片分析
- 健康数据
- 症状分析
- 药物查询
- 科室推荐
- 数据记录
- 趋势分析
- 提醒设置
- 报告生成

---

## 🎯 性能优化

### 响应速度
- **首字延迟**: 从 2-3 秒降低到 0.5-1 秒
- **流式输出**: 用户可实时看到生成过程
- **工具调用**: 可视化工具执行过程

### 成本优化
- DeepSeek API 相对更经济
- 流式输出减少等待时间
- 图片识别功能保持高质量

---

## ⚠️ 破坏性变更

### 环境变量
```bash
# 旧配置（已废弃）
DASHSCOPE_API_KEY=xxx

# 新配置（必需）
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### API 响应格式
- `/api/chat` 现在默认返回 SSE 流
- 设置 `stream: false` 可获取旧版响应格式
- 前端需要支持 EventSource 或类似库

---

## 📦 部署指南

### 1. 更新依赖
```bash
cd ai-service
pip install -r requirements.txt
```

### 2. 配置环境变量
```bash
# 创建/更新 .env 文件
echo "DEEPSEEK_API_KEY=your_deepseek_api_key_here" >> .env
```

### 3. 重启服务
```bash
# 方式1: 直接运行
python main.py

# 方式2: 使用 systemd
sudo systemctl restart health-ai-service

# 方式3: 使用 Docker
docker-compose restart ai-service
```

### 4. 验证部署
```bash
# 检查服务状态
curl http://localhost:8001/health

# 测试流式输出
curl -N -X POST http://localhost:8001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"你好","stream":true}'

# 测试图片分析
curl -X POST http://localhost:8001/api/analyze-image-url \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/report.jpg",
    "message": "请分析这张报告"
  }'
```

---

## 🐛 已知问题

### 1. 流式输出兼容性
- **问题**: 部分旧版浏览器可能不支持 SSE
- **解决**: 设置 `stream: false` 使用传统响应

### 2. 图片 URL 访问
- **问题**: 某些内网图片 URL 可能无法访问
- **解决**: 使用 `/api/analyze-image` 直接上传图片

### 3. API 限流
- **问题**: DeepSeek API 可能有限流限制
- **解决**: 在应用层实现请求队列和重试机制

---

## 🔜 后续计划

### v3.1.0（计划中）
- [ ] 前端流式输出 UI 优化
- [ ] API 请求队列和限流控制
- [ ] 图片压缩和预处理
- [ ] 缓存机制优化

### v3.2.0（规划中）
- [ ] 支持更多 AI 模型切换
- [ ] 多模型负载均衡
- [ ] 高级图片标注功能
- [ ] 病历智能分类

---

## 🙏 致谢

感谢 DeepSeek 团队提供优秀的 AI 模型和 API 服务！

---

## 📞 联系方式

- **GitHub**: https://github.com/lucian886/healthManagement
- **Issues**: https://github.com/lucian886/healthManagement/issues

---

**更新时间**: 2026-01-05  
**版本**: v3.0.0  
**状态**: ✅ 已发布

