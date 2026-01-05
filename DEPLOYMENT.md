# 健康管理系统 - 部署文档

## 📋 目录

- [系统架构](#系统架构)
- [前置要求](#前置要求)
- [快速部署](#快速部署)
- [详细部署步骤](#详细部署步骤)
- [配置说明](#配置说明)
- [常见问题](#常见问题)
- [运维命令](#运维命令)

## 🏗️ 系统架构

本系统采用微服务架构，包含三个独立服务：

```
┌─────────────────────────────────────────────────┐
│                   用户访问                        │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
           ┌──────────────────┐
           │   Frontend (80)   │  React + Vite + Nginx
           │   前端服务         │
           └──────────┬────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌──────────────┐           ┌──────────────┐
│Backend (8081)│           │AI-Service    │  FastAPI + 通义千问
│ 后端服务      │◄─────────►│  (8001)      │
│Spring Boot   │           │AI 智能体服务  │
└──────┬───────┘           └──────────────┘
       │
       ▼
┌──────────────┐
│  PostgreSQL  │  (外部数据库)
│   数据库      │
└──────────────┘
```

### 服务说明

- **Frontend (端口 80)**: React 前端应用，使用 Nginx 托管静态文件
- **Backend (端口 8081)**: Spring Boot 后端服务，提供 REST API
- **AI-Service (端口 8001)**: Python FastAPI AI 智能体服务

## 🔧 前置要求

### 服务器要求

- **操作系统**: Linux (推荐 Ubuntu 20.04+, CentOS 7+)
- **内存**: 至少 4GB RAM (推荐 8GB+)
- **磁盘**: 至少 20GB 可用空间
- **CPU**: 2核以上

### 软件要求

1. **Docker** (20.10+)
2. **Docker Compose** (1.29+)
3. **Git** (用于拉取代码)

### 安装 Docker (Ubuntu/Debian)

```bash
# 更新包索引
sudo apt-get update

# 安装依赖
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加 Docker 官方 GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 设置稳定版仓库
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker compose version
```

### 安装 Docker (CentOS/RHEL)

```bash
# 安装依赖
sudo yum install -y yum-utils

# 添加 Docker 仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker compose version
```

## 🚀 快速部署

### 1. 克隆代码

```bash
# 克隆仓库
git clone <your-repository-url> health-management
cd health-management
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp env.example .env

# 编辑 .env 文件，填入真实配置
nano .env
```

需要配置的环境变量：

```bash
# 通义千问 API Key (必填)
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxx

# 阿里云 OSS 配置 (必填)
ALIYUN_OSS_ACCESS_KEY_ID=LTAI5txxxxxxxxxxxxxx
ALIYUN_OSS_ACCESS_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. 运行部署脚本

```bash
# 赋予执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

选择 **选项 1 - 全新部署**，脚本会自动完成以下操作：

1. 构建 Docker 镜像
2. 启动所有服务
3. 执行健康检查

### 4. 验证部署

部署完成后，访问：

- **前端应用**: http://your-server-ip
- **后端 API**: http://your-server-ip:8081
- **AI 服务**: http://your-server-ip:8001

## 📝 详细部署步骤

### 方式一：使用部署脚本（推荐）

```bash
./deploy.sh
```

脚本提供以下选项：

1. **全新部署** - 首次部署或完全重建
2. **重启服务** - 快速重启所有服务
3. **更新并重启** - 代码更新后重新构建
4. **停止所有服务** - 停止并移除容器
5. **查看服务状态** - 检查服务运行状态
6. **查看日志** - 查看服务日志

### 方式二：手动使用 Docker Compose

#### 1. 构建镜像

```bash
docker-compose build
```

#### 2. 启动服务

```bash
# 后台启动
docker-compose up -d

# 前台启动（查看日志）
docker-compose up
```

#### 3. 查看状态

```bash
docker-compose ps
```

#### 4. 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f ai-service
docker-compose logs -f frontend
```

#### 5. 停止服务

```bash
# 停止服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器和数据卷
docker-compose down -v
```

## ⚙️ 配置说明

### 环境变量配置

创建 `.env` 文件（从 `env.example` 复制）：

```bash
# 必填配置
DASHSCOPE_API_KEY=your_api_key          # 通义千问 API Key
ALIYUN_OSS_ACCESS_KEY_ID=your_key_id    # 阿里云 OSS Access Key ID
ALIYUN_OSS_ACCESS_KEY_SECRET=your_secret # 阿里云 OSS Access Key Secret
```

### 数据库配置

数据库配置在 `backend/src/main/resources/application-prod.yml` 中：

```yaml
spring:
  datasource:
    url: jdbc:postgresql://47.94.41.55:5432/health_db
    username: health_user
    password: Health@2024
```

**注意**：生产环境建议修改数据库密码并使用环境变量。

### 端口配置

默认端口配置：

- Frontend: `80`
- Backend: `8081`
- AI Service: `8001`

如需修改端口，编辑 `docker-compose.yml`：

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # 修改为 8080:80
```

### Nginx 配置

前端 Nginx 配置文件：`frontend/nginx.conf`

- 支持 SPA 路由
- API 代理到后端
- 静态资源缓存
- Gzip 压缩

## 🔍 健康检查

### 自动健康检查

Docker Compose 配置了自动健康检查：

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### 手动检查

```bash
# AI 服务
curl http://localhost:8001/health

# 后端服务
curl http://localhost:8081/api/auth/health

# 前端服务
curl http://localhost/health
```

## 🛠️ 运维命令

### 启动/停止服务

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose stop

# 重启所有服务
docker-compose restart

# 重启单个服务
docker-compose restart backend
```

### 查看日志

```bash
# 实时查看所有日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend

# 查看最近 100 行日志
docker-compose logs --tail=100 ai-service
```

### 进入容器

```bash
# 进入后端容器
docker-compose exec backend bash

# 进入 AI 服务容器
docker-compose exec ai-service bash

# 进入前端容器
docker-compose exec frontend sh
```

### 更新服务

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 或使用部署脚本
./deploy.sh  # 选择选项 3
```

### 清理资源

```bash
# 删除停止的容器
docker-compose rm

# 删除未使用的镜像
docker image prune -a

# 删除未使用的数据卷
docker volume prune

# 完全清理
docker system prune -a --volumes
```

## ❓ 常见问题

### 1. 端口被占用

```bash
# 查看端口占用
sudo lsof -i :80
sudo lsof -i :8081
sudo lsof -i :8001

# 修改 docker-compose.yml 中的端口映射
```

### 2. 内存不足

```bash
# 增加 Docker 内存限制
docker-compose.yml 中添加：
services:
  backend:
    mem_limit: 2g
```

### 3. 构建失败

```bash
# 清理 Docker 缓存重新构建
docker-compose build --no-cache

# 检查 Dockerfile 和依赖文件
```

### 4. 服务无法连接

```bash
# 检查 Docker 网络
docker network ls
docker network inspect health-network

# 检查服务状态
docker-compose ps

# 查看详细日志
docker-compose logs -f
```

### 5. 数据库连接失败

```bash
# 检查数据库配置
cat backend/src/main/resources/application-prod.yml

# 测试数据库连接
docker-compose exec backend bash
apt-get update && apt-get install -y postgresql-client
psql -h 47.94.41.55 -U health_user -d health_db
```

### 6. AI 服务调用失败

```bash
# 检查 API Key 配置
docker-compose exec ai-service env | grep DASHSCOPE

# 测试 AI 服务
curl http://localhost:8001/health
```

## 🔐 安全建议

1. **修改默认密码**: 修改数据库密码和 JWT Secret
2. **使用 HTTPS**: 配置 SSL 证书（推荐使用 Let's Encrypt）
3. **防火墙配置**: 只开放必要端口（80, 443）
4. **定期更新**: 及时更新系统和 Docker 镜像
5. **备份数据**: 定期备份数据库和上传文件

## 📊 监控和日志

### 日志位置

- **前端日志**: `docker-compose logs frontend`
- **后端日志**: `docker-compose logs backend`
- **AI 服务日志**: `docker-compose logs ai-service`

### 持久化日志

编辑 `docker-compose.yml` 添加日志卷：

```yaml
services:
  backend:
    volumes:
      - ./logs/backend:/app/logs
```

## 🌐 生产环境优化

### 1. 使用 Nginx 反向代理

在服务器上安装 Nginx 作为统一入口：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
    }

    location /api/ {
        proxy_pass http://localhost:8081;
    }
}
```

### 2. 配置 SSL

```bash
# 使用 Certbot 申请证书
sudo certbot --nginx -d your-domain.com
```

### 3. 性能优化

- 启用 CDN 加速静态资源
- 配置 Redis 缓存
- 数据库连接池优化
- 启用 Gzip 压缩

## 📞 技术支持

如遇到问题，请：

1. 查看日志: `docker-compose logs -f`
2. 检查服务状态: `docker-compose ps`
3. 查看本文档的常见问题部分

---

最后更新: 2024-12-23







