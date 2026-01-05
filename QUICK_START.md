# 健康管理系统 - 快速部署指南

## 🚀 5分钟快速部署

### 1️⃣ 准备服务器

确保服务器已安装 Docker 和 Docker Compose：

```bash
# 检查 Docker
docker --version

# 检查 Docker Compose
docker compose version
```

如未安装，请参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 中的安装说明。

### 2️⃣ 上传代码到服务器

```bash
# 方式一：Git 克隆（推荐）
git clone <your-repository-url> health-management
cd health-management

# 方式二：使用 scp 上传
scp -r ./health-management root@your-server-ip:/opt/
ssh root@your-server-ip
cd /opt/health-management
```

### 3️⃣ 配置环境变量

```bash
# 复制环境变量模板
cp env.example .env

# 编辑配置文件
vi .env
```

填入以下必需信息：

```bash
# 通义千问 API Key (https://dashscope.console.aliyun.com/)
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxx

# 阿里云 OSS 配置 (https://oss.console.aliyun.com/)
ALIYUN_OSS_ACCESS_KEY_ID=LTAI5txxxxxxxxxxxxxx
ALIYUN_OSS_ACCESS_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4️⃣ 一键部署

```bash
# 赋予执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

选择 **选项 1 - 全新部署**

### 5️⃣ 验证部署

等待 2-3 分钟后，访问：

```
http://your-server-ip
```

## 🎯 端口说明

- **80** - 前端应用（主要访问入口）
- **8081** - 后端 API
- **8001** - AI 服务

## 🔥 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新服务（代码更新后）
git pull
docker-compose up -d --build
```

## ⚠️ 注意事项

1. **防火墙配置**：确保开放 80、8081、8001 端口

```bash
# Ubuntu/Debian
sudo ufw allow 80
sudo ufw allow 8081
sudo ufw allow 8001

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --permanent --add-port=8001/tcp
sudo firewall-cmd --reload
```

2. **数据库连接**：确保服务器可以访问数据库 `47.94.41.55:5432`

3. **内存要求**：建议至少 4GB RAM

## 🆘 遇到问题？

### 服务启动失败

```bash
# 查看详细日志
docker-compose logs -f

# 检查某个服务
docker-compose logs backend
```

### 端口被占用

```bash
# 查看端口占用
sudo lsof -i :80
sudo lsof -i :8081
sudo lsof -i :8001

# 修改端口（编辑 docker-compose.yml）
```

### 重新部署

```bash
# 完全清理并重新部署
docker-compose down -v
./deploy.sh  # 选择选项 1
```

## 📚 更多文档

- [完整部署文档](./DEPLOYMENT.md) - 详细的部署说明
- [README.md](./README.md) - 项目介绍

---

需要帮助？请查看日志文件或联系技术支持。







