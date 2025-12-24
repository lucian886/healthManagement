# 🏥 健康管理智能体应用

一个基于 AI 的健康管理系统，提供用户档案管理、病历上传、智能健康咨询等功能。

## ✨ 功能特性

- 🔐 **用户认证**: 安全的登录/注册系统，JWT Token 认证
- 📁 **档案管理**: 完整的用户健康档案管理（身高、体重、血型、过敏史等）
- 📷 **病历上传**: 支持上传病历、检查报告等图片和文件
- 🤖 **AI 智能问答**: 基于 LangChain 的健康咨询智能体

## 🏗️ 项目架构

```
healthManagement/
├── backend/                 # Java Spring Boot 后端
│   ├── src/main/java/com/health/
│   │   ├── config/         # 配置类
│   │   ├── controller/     # 控制器
│   │   ├── dto/            # 数据传输对象
│   │   ├── entity/         # 实体类
│   │   ├── repository/     # 数据仓库
│   │   ├── security/       # 安全配置
│   │   ├── service/        # 服务层
│   │   └── exception/      # 异常处理
│   └── pom.xml
├── ai-service/             # Python AI 智能体服务
│   ├── agent.py            # LangChain 智能体
│   ├── main.py             # FastAPI 入口
│   ├── config.py           # 配置
│   └── requirements.txt
├── frontend/               # React 前端
│   ├── src/
│   │   ├── api/            # API 调用
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   └── store/          # 状态管理
│   └── package.json
└── README.md
```

## 🛠️ 技术栈

### Java 后端 (Spring Boot)
- Spring Boot 3.2
- Spring Security + JWT
- Spring Data JPA
- H2 Database (开发) / MySQL (生产)
- Lombok

### Python AI 服务
- FastAPI
- LangChain + OpenAI
- Pydantic

### React 前端
- React 18 + Vite
- React Router 6
- Tailwind CSS
- Zustand (状态管理)
- Axios
- Lucide React (图标)

## 🚀 快速开始

### 1. 后端设置 (Java)

```bash
cd backend

# 使用 Maven 构建
mvn clean install

# 启动服务 (默认端口 8080)
mvn spring-boot:run
```

### 2. AI 服务设置 (Python)

```bash
cd ai-service

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 设置环境变量
export OPENAI_API_KEY=sk-your-openai-api-key

# 启动服务 (默认端口 8001)
python main.py
```

### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器 (默认端口 5173)
npm run dev
```

### 4. 访问应用

- 前端: http://localhost:5173
- Java 后端 API: http://localhost:8080
- AI 服务: http://localhost:8001
- H2 数据库控制台: http://localhost:8080/h2-console

## 📖 API 文档

### 认证接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |

### 档案接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/profile` | GET | 获取用户档案 |
| `/api/profile` | PUT | 更新用户档案 |

### 病历接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/records` | GET | 获取病历列表 |
| `/api/records` | POST | 创建病历 |
| `/api/records/upload` | POST | 上传病历文件 |
| `/api/records/{id}` | PUT | 更新病历 |
| `/api/records/{id}` | DELETE | 删除病历 |

### AI 聊天接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/chat` | POST | 发送消息 |
| `/api/chat/history/{sessionId}` | GET | 获取对话历史 |
| `/api/chat/sessions` | GET | 获取会话列表 |

## 🤖 AI 智能体功能

智能体具备以下能力：
- **健康咨询**: 回答用户健康相关问题
- **BMI 计算**: 计算并解读用户的 BMI 指数
- **热量计算**: 计算每日所需热量
- **健康建议**: 提供睡眠、饮食、运动、压力管理等建议
- **个性化服务**: 结合用户健康档案提供个性化建议

## 🔒 安全说明

- 所有密码使用 BCrypt 加密存储
- API 使用 JWT Token 认证
- 文件上传有大小和类型限制
- 敏感配置使用环境变量

## ⚠️ 免责声明

本系统仅供健康信息管理和参考，AI 提供的建议不能替代专业医疗诊断。如有健康问题，请咨询专业医生。

## 📝 License

MIT License
