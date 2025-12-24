# 健康管理系统 - Nginx 部署快速指南

## 🎯 部署架构

不使用 Docker，采用传统的 Nginx + Systemd 部署方式：

```
┌─────────────────────────────────────────┐
│            Nginx (端口 80)               │
├─────────────────┬───────────────────────┤
│  前端静态文件    │    API 反向代理        │
│  /dist/         │    → 后端 (8081)      │
│                 │    → AI (8001)        │
└─────────────────┴───────────────────────┘

系统服务 (Systemd):
├── health-backend.service    (Spring Boot)
└── health-ai-service.service (Python FastAPI)
```

## 📦 已创建的文件

```
healthManagement/
├── nginx/
│   └── health-management.conf         # Nginx 完整配置
├── systemd/
│   ├── health-backend.service         # 后端系统服务
│   └── health-ai-service.service      # AI 服务系统服务
├── deploy-nginx.sh                    # 一键部署脚本 ⭐
└── DEPLOYMENT_NGINX.md               # 详细部署文档
```

---

## 🚀 三步快速部署

### 第一步：安装依赖（服务器上执行）

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk nginx python3 python3-pip python3-venv

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
java -version    # 应显示 17.x
node -v          # 应显示 18.x
nginx -v         # 显示版本号
python3 --version
```

### 第二步：上传代码并配置

```bash
# 1. 上传代码到服务器 /opt/health-management
# 可以用 Git 或 SCP

# 使用 Git（推荐）
cd /opt
sudo git clone <你的仓库地址> health-management

# 或使用 SCP
# 本地: tar -czf health.tar.gz healthManagement/ --exclude=node_modules
# 本地: scp health.tar.gz root@服务器IP:/opt/
# 服务器: cd /opt && tar -xzf health.tar.gz && mv healthManagement health-management

# 2. 配置环境变量
cd /opt/health-management
sudo cp env.example .env
sudo vi .env

# 填入以下配置:
# DASHSCOPE_API_KEY=你的通义千问API密钥
# ALIYUN_OSS_ACCESS_KEY_ID=你的OSS密钥ID
# ALIYUN_OSS_ACCESS_KEY_SECRET=你的OSS密钥Secret
```

### 第三步：执行一键部署

```bash
cd /opt/health-management

# 赋予执行权限
chmod +x deploy-nginx.sh

# 执行部署（需要 root 权限）
sudo ./deploy-nginx.sh
```

部署脚本会自动完成：
- ✅ 检查系统依赖
- ✅ 构建前端 (npm build)
- ✅ 构建后端 (Maven package)
- ✅ 安装 Python 依赖
- ✅ 配置并启动 Systemd 服务
- ✅ 配置并重启 Nginx

**部署完成后访问：** `http://你的服务器IP`

---

## 📊 服务管理命令

### 启动/停止服务

```bash
# 后端服务
sudo systemctl start health-backend
sudo systemctl stop health-backend
sudo systemctl restart health-backend
sudo systemctl status health-backend

# AI 服务
sudo systemctl start health-ai-service
sudo systemctl stop health-ai-service
sudo systemctl restart health-ai-service
sudo systemctl status health-ai-service

# Nginx
sudo systemctl restart nginx
sudo systemctl status nginx
```

### 查看日志

```bash
# 实时查看后端日志
sudo journalctl -u health-backend -f

# 实时查看 AI 服务日志
sudo journalctl -u health-ai-service -f

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/health-management-access.log
sudo tail -f /var/log/nginx/health-management-error.log

# 查看应用日志
tail -f /opt/health-management/logs/backend.log
tail -f /opt/health-management/logs/ai-service.log
```

### 更新代码

```bash
# 1. 拉取最新代码
cd /opt/health-management
sudo git pull

# 2. 重新构建前端
cd frontend
npm install
npm run build

# 3. 重新构建后端
cd ../backend
./mvnw clean package -DskipTests

# 4. 重启服务
sudo systemctl restart health-backend
sudo systemctl restart health-ai-service
sudo systemctl reload nginx
```

---

## 🗂️ 重要文件位置

### 配置文件
- **Nginx 配置**: `/etc/nginx/sites-available/health-management.conf`
- **后端服务**: `/etc/systemd/system/health-backend.service`
- **AI 服务**: `/etc/systemd/system/health-ai-service.service`
- **环境变量**: `/opt/health-management/.env`
- **后端配置**: `/opt/health-management/backend/src/main/resources/application-prod.yml`

### 应用文件
- **前端静态文件**: `/opt/health-management/frontend/dist/`
- **后端 JAR 文件**: `/opt/health-management/backend/target/health-management-0.0.1-SNAPSHOT.jar`
- **上传文件目录**: `/opt/health-management/backend/uploads/`

### 日志文件
- **应用日志**: `/opt/health-management/logs/`
- **Nginx 日志**: `/var/log/nginx/health-management-*.log`
- **系统日志**: 使用 `journalctl` 查看

---

## 🔧 常见问题

### 1. 端口被占用

```bash
# 查看端口占用
sudo lsof -i :80
sudo lsof -i :8081
sudo lsof -i :8001

# 停止占用进程或修改端口
```

### 2. 服务启动失败

```bash
# 查看详细错误
sudo journalctl -u health-backend -n 50
sudo journalctl -u health-ai-service -n 50

# 手动测试
cd /opt/health-management/backend
java -jar target/health-management-0.0.1-SNAPSHOT.jar
```

### 3. Nginx 配置错误

```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 4. 前端页面空白

```bash
# 检查构建产物
ls -la /opt/health-management/frontend/dist/

# 重新构建
cd /opt/health-management/frontend
npm run build
sudo systemctl reload nginx
```

### 5. API 无法访问

```bash
# 测试后端
curl http://localhost:8081/api/auth/health

# 测试 Nginx 代理
curl http://localhost/api/auth/health

# 检查 Nginx 配置
sudo nginx -t
```

---

## 🔒 安全配置

### 开放防火墙端口

```bash
# Ubuntu (UFW)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS (Firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 配置 HTTPS（生产环境推荐）

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 申请免费证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加: 0 0 * * * certbot renew --quiet
```

---

## 📈 性能优化

### JVM 参数优化

编辑 `/etc/systemd/system/health-backend.service`：

```ini
Environment="JAVA_OPTS=-Xms1g -Xmx2g -XX:+UseG1GC"
```

然后重新加载：

```bash
sudo systemctl daemon-reload
sudo systemctl restart health-backend
```

---

## 📞 获取帮助

### 查看详细文档
```bash
cat /opt/health-management/DEPLOYMENT_NGINX.md
```

### 检查服务状态
```bash
# 快速检查所有服务
sudo systemctl status health-backend health-ai-service nginx

# 查看实时日志
sudo journalctl -u health-backend -u health-ai-service -f
```

---

## ✅ 部署验证清单

部署完成后，请确认：

- [ ] 后端服务正常运行: `sudo systemctl status health-backend`
- [ ] AI 服务正常运行: `sudo systemctl status health-ai-service`
- [ ] Nginx 正常运行: `sudo systemctl status nginx`
- [ ] 可以访问前端页面: `http://服务器IP`
- [ ] 用户可以注册登录
- [ ] 聊天功能正常
- [ ] 病历上传功能正常
- [ ] 已配置防火墙
- [ ] 已设置开机自启动

---

## 🎉 部署完成

访问地址：**http://你的服务器IP**

- 前端页面：`http://服务器IP/`
- 后端 API：`http://服务器IP/api/`
- 健康检查：`http://服务器IP/api/auth/health`

**技术支持**：如遇问题，请查看 `DEPLOYMENT_NGINX.md` 详细文档。

---

**最后更新**: 2024-12-23




