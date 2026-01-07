# 流式输出功能部署指南

## 🌊 功能说明

实现了完整的端到端流式输出：**AI 服务 → 后端 → 前端**

用户可以实时看到 AI 生成的内容，就像 ChatGPT 一样逐字显示！

---

## 🏗️ 架构流程

```
用户输入
    ↓
前端 (fetch SSE)
    ↓
后端 (SseEmitter)
    ↓
AI 服务 (DeepSeek Stream)
    ↓
实时显示！
```

---

## 📦 完整部署步骤

### 1. 服务器准备

```bash
# 进入项目目录
cd /root/healthManagement

# 拉取最新代码
git pull origin main

# 查看最新提交
git log --oneline -5
```

### 2. 部署 AI 服务

```bash
cd /root/healthManagement/ai-service

# 停止旧服务
pkill -9 -f "python.*main.py"

# 确保环境变量正确
cat > .env << 'EOF'
DEEPSEEK_API_KEY=sk-65144ea3981e49bb884c42c115ef0a2c
HOST=0.0.0.0
PORT=8001
MODEL_NAME=deepseek-chat
VISION_MODEL_NAME=deepseek-chat
EOF

# 验证配置
python3 test_config.py

# 启动服务
nohup python3 main.py > ../logs/ai-service.log 2>&1 &

# 验证启动
sleep 3
curl http://localhost:8001/health

# 测试流式输出
curl -N -X POST http://localhost:8001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"你好","stream":true}'
```

### 3. 部署后端

```bash
cd /root/healthManagement/backend

# 重新打包
mvn clean package -DskipTests

# 停止旧服务
pkill -f "health-management"

# 启动新服务
nohup java -jar target/health-management-1.0.0.jar > ../logs/backend.log 2>&1 &

# 查看启动日志
tail -f ../logs/backend.log

# 看到 "Started HealthManagementApplication" 后按 Ctrl+C 退出
```

### 4. 部署前端

```bash
cd /root/healthManagement/frontend

# 安装依赖（如果有新包）
npm install

# 重新构建
npm run build

# 如果使用 nginx，刷新配置
sudo nginx -s reload
```

---

## 🧪 测试流式输出

### 测试 1: AI 服务直接测试

```bash
# 应该看到内容一个字一个字地输出
curl -N -X POST http://localhost:8001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "请用50个字介绍一下你自己",
    "stream": true
  }'
```

**预期输出：**
```
data: {"chunk": "你", "done": false}

data: {"chunk": "好", "done": false}

data: {"chunk": "！", "done": false}

... (持续输出)

data: {"done": true}
```

### 测试 2: 后端转发测试

```bash
# 测试后端流式接口
curl -N -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好",
    "sessionId": "test-stream-001"
  }'
```

**预期输出：**
```
event: message
data: 你

event: message
data: 好

... (持续输出)
```

### 测试 3: 前端浏览器测试

1. 打开浏览器访问：`http://your-server-ip`
2. 进入 AI 聊天页面
3. 输入："请详细介绍一下你的功能"
4. 观察是否一个字一个字地显示

---

## 🔍 故障排查

### 问题 1: 前端没有流式效果

**检查：**
```bash
# 查看浏览器控制台（F12）
# 应该看到 fetch 请求
# Network 标签中查看 /api/chat 请求是否成功
```

**解决：**
- 检查后端是否正常启动
- 检查 /api/chat 是否在白名单
- 清除浏览器缓存

### 问题 2: 后端报错

**检查：**
```bash
# 查看后端日志
tail -100 /root/healthManagement/logs/backend.log | grep -i error
```

**常见错误：**
- `No bean of type 'WebClient'` → 检查 pom.xml 是否包含 webflux 依赖
- `No bean of type 'ObjectMapper'` → ObjectMapper 应该自动注入

### 问题 3: AI 服务返回错误

**检查：**
```bash
# 查看 AI 服务日志
tail -50 /root/healthManagement/logs/ai-service.log
```

**常见错误：**
- `Model Not Exist` → API Key 无效或模型名称错误
- 连接超时 → 网络问题或 DeepSeek API 限流

### 问题 4: 数据库连接失败

**解决：**
```bash
# 检查 PostgreSQL 是否运行
sudo systemctl status postgresql

# 或启动 PostgreSQL
sudo systemctl start postgresql

# 测试连接
psql -h localhost -U health_user -d health_db
```

---

## 📊 性能优化建议

### 1. 后端超时配置
```yaml
# application.yml
spring:
  webflux:
    timeout: 300s  # WebClient 超时
```

### 2. Nginx 配置（如果使用）
```nginx
# 禁用缓冲，支持 SSE
location /api/chat {
    proxy_pass http://localhost:8080;
    proxy_buffering off;
    proxy_cache off;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    chunked_transfer_encoding off;
}
```

### 3. 前端优化
- 使用虚拟滚动优化长对话
- 添加断线重连机制
- 实现对话保存草稿

---

## 🎯 关键检查清单

部署完成后，请确认：

- [ ] AI 服务 (8001) 正常运行
- [ ] 后端服务 (8080) 正常运行
- [ ] 前端构建成功
- [ ] 数据库连接正常
- [ ] curl 测试 AI 服务流式输出正常
- [ ] curl 测试后端流式转发正常
- [ ] 浏览器测试前端流式显示正常
- [ ] 对话历史正确保存到数据库
- [ ] 会话列表正常显示

---

## 🐛 已修复的问题

1. ✅ MyBatis Plus 版本兼容性
2. ✅ Spring Security 配置错误
3. ✅ ChatHistoryMapper 类型转换
4. ✅ UserPrincipal 空指针
5. ✅ SSE 数据解析和缓冲
6. ✅ WebClient 流式接收
7. ✅ 前端 fetch 流式处理

---

## 📝 使用说明

### 前端使用

用户在聊天页面输入问题后：

1. **消息立即显示**在聊天框
2. **AI 回复**一个字一个字地出现
3. **光标闪烁**表示正在生成中 `|`
4. **生成完成**后光标消失，显示时间戳

### API 接口

- **流式接口**: `POST /api/chat` （默认，推荐）
- **非流式接口**: `POST /api/chat/sync` （兼容）

---

**部署时间**: 2026-01-05  
**版本**: v3.0.0 - 流式输出版

