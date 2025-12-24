# 🏥 健康管理智能体应用

一个基于 AI 的全栈健康管理系统，提供智能健康咨询、档案管理、病历上传、健康数据追踪等功能。

## ✨ 核心功能

### 👤 用户管理
- 🔐 安全的注册/登录系统（JWT Token 认证）
- 📝 完整的用户健康档案管理
- 🔑 密码加密存储（BCrypt）

### 📊 健康数据管理
- 📈 多维度健康数据记录（血压、血糖、心率、体重等）
- 📅 健康数据趋势分析和可视化
- 📋 生活记录（饮食、运动、睡眠）
- 💊 用药记录管理
- ⏰ 健康提醒功能

### 🏥 病历管理
- 📷 病历图片和文件上传（阿里云OSS存储）
- 📁 多种病历类型支持（检查报告、处方单、诊断书等）
- 🖼️ 病历图片多图管理
- 🔍 病历搜索和筛选

### 🤖 AI 智能助手
- 💬 基于通义千问的智能健康咨询
- 🖼️ 医疗图像AI分析（VL-Chat模型）
- 📱 多轮对话支持
- 🧠 上下文理解（结合用户档案和病历）
- 📚 会话历史管理

## 🏗️ 项目架构

```
healthManagement/
├── backend/                    # Java Spring Boot 后端
│   ├── src/main/java/com/health/
│   │   ├── config/            # 配置类（Security, MyBatis Plus, OSS等）
│   │   ├── controller/        # REST API 控制器
│   │   ├── dto/               # 数据传输对象
│   │   ├── entity/            # MyBatis Plus 实体类
│   │   ├── mapper/            # MyBatis Plus Mapper 接口
│   │   ├── security/          # Spring Security 配置
│   │   ├── service/           # 业务逻辑层
│   │   ├── exception/         # 全局异常处理
│   │   └── util/              # 工具类
│   ├── src/main/resources/
│   │   ├── mapper/            # MyBatis Plus XML 映射文件
│   │   ├── application.yml    # 应用配置
│   │   └── application-prod.yml  # 生产环境配置
│   └── pom.xml
├── ai-service/                # Python FastAPI AI 服务
│   ├── agent.py               # LangChain 智能体实现
│   ├── main.py                # FastAPI 应用入口
│   ├── config.py              # 配置管理
│   └── requirements.txt       # Python 依赖
├── frontend/                  # React 前端应用
│   ├── src/
│   │   ├── api/              # API 调用封装
│   │   ├── components/       # React 组件
│   │   ├── pages/            # 页面组件
│   │   └── store/            # Zustand 状态管理
│   └── package.json
├── scripts/                   # 部署脚本
│   ├── start-backend.sh      # 启动后端
│   ├── start-frontend.sh     # 启动前端
│   ├── start-ai.sh           # 启动 AI 服务
│   ├── check-status.sh       # 检查服务状态
│   ├── build-frontend.sh     # 构建前端
│   └── log-viewer.sh         # 查看日志
├── nginx/                     # Nginx 配置
│   └── health.conf
└── README.md
```

## 🛠️ 技术栈

### 后端 (Java Spring Boot 3.2)
- **框架**: Spring Boot 3.2, Spring MVC
- **安全**: Spring Security + JWT
- **数据库**: PostgreSQL 15
- **ORM**: MyBatis Plus 3.5.5 (使用 LambdaQueryWrapper)
- **云存储**: 阿里云 OSS
- **工具**: Lombok, MapStruct
- **构建**: Maven 3

### AI 服务 (Python 3.11+)
- **Web框架**: FastAPI
- **AI框架**: LangChain
- **大模型**: 阿里云通义千问 (qwen-plus, qwen-vl-chat-v1)
- **HTTP客户端**: HTTPX
- **数据验证**: Pydantic

### 前端 (React 18)
- **构建工具**: Vite 5
- **路由**: React Router 6
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **HTTP客户端**: Axios
- **图标**: Lucide React
- **图表**: Recharts
- **UI组件**: 自定义组件库

### 基础设施
- **Web服务器**: Nginx
- **容器化**: Docker, Docker Compose
- **进程管理**: Systemd
- **数据库**: PostgreSQL 15

## 🚀 快速开始

### 前置要求

- Java 17+
- Maven 3.8+
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- 阿里云账号（用于 OSS 和通义千问 API）

### 1. 环境配置

复制环境变量示例文件并配置：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置以下必需的环境变量：

```bash
# AI 服务配置
DASHSCOPE_API_KEY=your_dashscope_api_key

# 阿里云 OSS 配置
ALIYUN_OSS_ACCESS_KEY_ID=your_access_key_id
ALIYUN_OSS_ACCESS_KEY_SECRET=your_access_key_secret

# 数据库配置
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/health_db
SPRING_DATASOURCE_USERNAME=your_db_username
SPRING_DATASOURCE_PASSWORD=your_db_password

# JWT 配置
JWT_SECRET=your_jwt_secret_key

# AI 服务地址
AI_SERVICE_URL=http://localhost:8001

# 文件上传目录
FILE_UPLOAD_DIR=./uploads
```

### 2. 数据库初始化

```bash
# 创建数据库
createdb health_db

# 应用会自动创建表结构（MyBatis Plus）
```

### 3. 启动后端服务

```bash
cd backend

# 编译打包
mvn clean package -DskipTests

# 启动服务（端口 8080）
java -jar target/health-backend-1.0.0.jar

# 或使用 Maven 直接运行
mvn spring-boot:run
```

### 4. 启动 AI 服务

```bash
cd ai-service

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动服务（端口 8001）
uvicorn main:app --host 0.0.0.0 --port 8001
```

### 5. 启动前端服务

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器（端口 5173）
npm run dev

# 或构建生产版本
npm run build
```

### 6. 访问应用

- 🌐 **前端界面**: http://localhost:5173
- 🔧 **后端API**: http://localhost:8080
- 🤖 **AI服务**: http://localhost:8001
- 📚 **API文档**: http://localhost:8001/docs (FastAPI自动生成)

## 📖 API 文档

### 认证接口 (无需Token)

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |

### 用户档案接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/profile` | GET | 获取用户档案 |
| `/api/profile` | POST | 创建用户档案 |
| `/api/profile` | PUT | 更新用户档案 |

### 健康数据接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/health-data` | POST | 添加健康数据 |
| `/api/health-data` | GET | 查询健康数据 |
| `/api/health-data/latest` | GET | 获取最新数据 |
| `/api/health-data/stats` | GET | 获取统计数据 |
| `/api/health-data/{id}` | DELETE | 删除数据 |

### 病历管理接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/records` | GET | 获取病历列表 |
| `/api/records` | POST | 创建病历记录 |
| `/api/records/{id}` | GET | 获取病历详情 |
| `/api/records/{id}` | PUT | 更新病历 |
| `/api/records/{id}` | DELETE | 删除病历 |
| `/api/records/{id}/upload` | POST | 上传病历文件 |
| `/api/records/{id}/images` | POST | 批量上传图片 |
| `/api/records/{id}/images/{imageId}` | DELETE | 删除图片 |

### 生活记录接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/life/diet` | POST | 添加饮食记录 |
| `/api/life/exercise` | POST | 添加运动记录 |
| `/api/life/sleep` | POST | 添加睡眠记录 |
| `/api/life/records` | GET | 查询生活记录 |

### 用药管理接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/medications` | GET | 获取用药列表 |
| `/api/medications` | POST | 添加用药记录 |
| `/api/medications/{id}` | PUT | 更新用药记录 |
| `/api/medications/{id}` | DELETE | 删除用药记录 |

### 健康提醒接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/reminders` | GET | 获取提醒列表 |
| `/api/reminders` | POST | 创建提醒 |
| `/api/reminders/{id}` | PUT | 更新提醒 |
| `/api/reminders/{id}/toggle` | POST | 切换提醒状态 |
| `/api/reminders/{id}` | DELETE | 删除提醒 |

### AI 聊天接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/chat` | POST | 发送聊天消息 |
| `/api/chat/history/{sessionId}` | GET | 获取对话历史 |
| `/api/chat/sessions` | GET | 获取会话列表 |
| `/api/chat/sessions/{sessionId}` | DELETE | 删除会话 |
| `/api/chat/analyze-image/{recordId}` | POST | AI分析病历图片 |

### Python AI 服务接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/chat` | POST | 智能对话 |
| `/api/analyze-image-url` | POST | 分析图片URL |

## 🤖 AI 功能详解

### 智能对话能力
- ✅ 基于用户健康档案的个性化咨询
- ✅ 结合病历记录的深度分析
- ✅ 多轮对话上下文理解
- ✅ 健康指标解读（BMI、血压、血糖等）
- ✅ 健康建议生成

### 图像识别能力
- ✅ 医疗报告图片识别
- ✅ 检查结果解读
- ✅ 处方单识别
- ✅ 结合用户信息的综合分析

### 内置工具
智能体配备了以下工具：
- 📊 BMI 计算器
- 🔥 每日热量需求计算器
- 💪 健康建议生成器

## 🔒 安全特性

- ✅ **密码加密**: BCrypt 加密存储
- ✅ **JWT认证**: 无状态token验证
- ✅ **CORS配置**: 跨域请求控制
- ✅ **文件验证**: 上传文件类型和大小限制
- ✅ **环境变量**: 敏感信息环境变量管理
- ✅ **SQL注入防护**: MyBatis Plus参数化查询
- ✅ **XSS防护**: 前端输入验证和转义

## 📦 部署指南

### 使用脚本部署（推荐）

```bash
# 1. 启动所有服务
./scripts/start-all.sh

# 2. 检查服务状态
./scripts/check-status.sh

# 3. 查看日志
./scripts/log-viewer.sh

# 4. 停止所有服务
./scripts/stop-all.sh
```

### 使用 Docker Compose

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境部署

1. **配置 Nginx 反向代理** (参考 `nginx/health.conf`)
2. **配置 Systemd 服务** (自动启动)
3. **配置环境变量** (生产环境密钥)
4. **配置数据库备份** (定期备份)
5. **配置SSL证书** (HTTPS)

## 📊 数据库设计

### 核心表结构

- **users**: 用户账户信息
- **user_profiles**: 用户健康档案
- **health_data**: 健康数据记录
- **medical_records**: 病历记录
- **medical_record_images**: 病历图片
- **chat_histories**: 聊天历史
- **life_records**: 生活记录（饮食/运动/睡眠）
- **medication_records**: 用药记录
- **health_reminders**: 健康提醒

## 🧪 测试

```bash
# 后端测试
cd backend
mvn test

# 前端测试
cd frontend
npm run test

# AI 服务测试
cd ai-service
pytest
```

## 📝 开发指南

### 代码风格
- Java: 遵循阿里巴巴Java开发规范
- Python: 遵循 PEP 8
- JavaScript/React: ESLint + Prettier

### Git 提交规范
- `feat`: 新功能
- `fix`: 修复bug
- `refactor`: 重构
- `docs`: 文档更新
- `style`: 代码格式调整
- `test`: 测试相关
- `chore`: 构建/工具相关

### MyBatis Plus 最佳实践
- 优先使用 `LambdaQueryWrapper` 进行类型安全查询
- 复杂查询使用 XML Mapper
- 避免在 Java 代码中编写 SQL 字符串
- 使用 `@TableField` 注解配置字段映射

## 🐛 常见问题

### Q: 后端启动失败，提示数据库连接错误
A: 检查 PostgreSQL 是否运行，数据库是否已创建，`.env` 中的数据库配置是否正确。

### Q: AI 服务返回错误
A: 确认 `DASHSCOPE_API_KEY` 是否正确配置，检查网络连接是否正常。

### Q: 文件上传失败
A: 检查阿里云 OSS 配置是否正确，AccessKey 权限是否足够。

### Q: 前端无法连接后端
A: 检查后端服务是否启动，CORS 配置是否正确，前端 API 地址配置是否匹配。

## 🔄 更新日志

### v2.0.0 (2024-12-24)
- ✨ 完成从 JPA 到 MyBatis Plus 的迁移
- ✨ 使用 LambdaQueryWrapper 替代原生 SQL
- ✨ 优化数据库查询性能
- 🔧 重构所有 Service 层代码
- 📝 更新文档和部署脚本

### v1.0.0 (初始版本)
- ✨ 基础用户认证系统
- ✨ 健康档案管理
- ✨ 病历上传功能
- ✨ AI 智能问答
- ✨ 基于通义千问的对话系统

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## ⚠️ 免责声明

本系统仅供健康信息管理和参考使用。AI 提供的所有建议和分析**不能替代专业医疗诊断**。如有健康问题，请及时咨询专业医生。

## 📄 开源协议

MIT License

## 👥 联系方式

- 项目地址: https://github.com/lucian886/healthManagement
- Issue: https://github.com/lucian886/healthManagement/issues

---

⭐ 如果这个项目对你有帮助，请给个 Star！
