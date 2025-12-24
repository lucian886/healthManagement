# 健康管理系统 - Nginx 传统部署文档

## 📋 部署架构

```
用户浏览器
    ↓
Nginx (端口 80)
├── /          → 前端静态文件 (dist/)
├── /api/      → 反向代理到后端 (8081)
└── /ai/       → 反向代理到 AI 服务 (8001)

系统服务:
├── health-backend.service     → Spring Boot (8081)
└── health-ai-service.service  → FastAPI (8001)
```

## 🔧 前置要求

### 服务器要求
- **操作系统**: Linux (Ubuntu 20.04+, CentOS 7+)
- **内存**: 至少 4GB RAM
- **磁盘**: 至少 20GB
- **权限**: Root 或 sudo 权限

### 软件要求
- **Java**: OpenJDK 17+
- **Node.js**: 18+
- **Python**: 3.8+
- **Nginx**: 最新稳定版
- **PostgreSQL**: 数据库已安装并运行

### 安装依赖 (Ubuntu/Debian)

```bash
# 更新包索引
sudo apt-get update

# 安装 Java 17
sudo apt-get install -y openjdk-17-jdk

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Python 3 和 venv
sudo apt-get install -y python3 python3-pip python3-venv

# 安装 Nginx
sudo apt-get install -y nginx

# 安装 PostgreSQL 客户端（用于备份）
sudo apt-get install -y postgresql-client

# 验证安装
java -version
node -v
python3 --version
nginx -v
```

### 安装依赖 (CentOS/RHEL)

```bash
# 安装 Java 17
sudo yum install -y java-17-openjdk-devel

# 安装 Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 安装 Python 3
sudo yum install -y python3 python3-pip

# 安装 Nginx
sudo yum install -y nginx

# 安装 PostgreSQL 客户端
sudo yum install -y postgresql

# 验证安装
java -version
node -v
python3 --version
nginx -v
```

## 🚀 快速部署

### 1. 上传代码到服务器

```bash
# 在服务器上创建目录
sudo mkdir -p /opt/health-management
sudo chown $USER:$USER /opt/health-management

# 方式一: Git 克隆（推荐）
cd /opt
git clone <你的仓库地址> health-management

# 方式二: SCP 上传
# 本地执行:
cd /Users/liuzixuan/
tar -czf health.tar.gz healthManagement/ --exclude=node_modules --exclude=target --exclude=logs
scp health.tar.gz root@服务器IP:/opt/

# 服务器执行:
cd /opt
tar -xzf health.tar.gz
mv healthManagement health-management
```

### 2. 配置环境变量

```bash
cd /opt/health-management

# 复制环境变量模板
cp env.example .env

# 编辑配置
sudo vi .env
```

填入以下配置：

```bash
# 通义千问 API Key
DASHSCOPE_API_KEY=sk-你的API密钥

# 阿里云 OSS 配置
ALIYUN_OSS_ACCESS_KEY_ID=你的AccessKeyId
ALIYUN_OSS_ACCESS_KEY_SECRET=你的AccessKeySecret

# 服务配置
HOST=0.0.0.0
PORT=8001
MODEL_NAME=qwen-plus
```

### 3. 修改 AI 服务配置

编辑 AI 服务的 systemd 配置文件：

```bash
sudo vi /opt/health-management/systemd/health-ai-service.service
```

在 `[Service]` 部分，确保 Python 路径正确。如果使用虚拟环境：

```ini
[Service]
# 使用虚拟环境的 Python
ExecStart=/opt/health-management/ai-service/venv/bin/python /opt/health-management/ai-service/main.py
```

### 4. 执行一键部署脚本

```bash
cd /opt/health-management

# 赋予执行权限
chmod +x deploy-nginx.sh

# 执行部署（需要 root 权限）
sudo ./deploy-nginx.sh
```

脚本会自动完成：
1. ✅ 检查系统依赖
2. ✅ 构建前端（npm build）
3. ✅ 构建后端（Maven package）
4. ✅ 安装 Python 依赖
5. ✅ 配置系统服务（systemd）
6. ✅ 配置 Nginx
7. ✅ 启动所有服务

### 5. 验证部署

```bash
# 检查服务状态
sudo systemctl status health-backend
sudo systemctl status health-ai-service
sudo systemctl status nginx

# 访问应用
# 在浏览器打开: http://服务器IP
```

## 📊 服务管理

### Systemd 服务管理

```bash
# 后端服务
sudo systemctl start health-backend      # 启动
sudo systemctl stop health-backend       # 停止
sudo systemctl restart health-backend    # 重启
sudo systemctl status health-backend     # 状态
sudo systemctl enable health-backend     # 开机自启

# AI 服务
sudo systemctl start health-ai-service
sudo systemctl stop health-ai-service
sudo systemctl restart health-ai-service
sudo systemctl status health-ai-service
sudo systemctl enable health-ai-service

# Nginx
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl status nginx
```

### 查看日志

```bash
# 后端日志（systemd）
sudo journalctl -u health-backend -f
sudo journalctl -u health-backend --since today

# AI 服务日志
sudo journalctl -u health-ai-service -f

# 应用日志文件
tail -f /opt/health-management/logs/backend.log
tail -f /opt/health-management/logs/ai-service.log

# Nginx 日志
tail -f /var/log/nginx/health-management-access.log
tail -f /var/log/nginx/health-management-error.log
```

### 更新代码

```bash
# 1. 拉取最新代码
cd /opt/health-management
git pull

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

## ⚙️ 配置文件位置

### 系统服务配置
- `/etc/systemd/system/health-backend.service` - 后端服务配置
- `/etc/systemd/system/health-ai-service.service` - AI 服务配置

### Nginx 配置
- `/etc/nginx/sites-available/health-management.conf` - 主配置文件
- `/etc/nginx/sites-enabled/health-management.conf` - 启用的配置（软链接）

### 应用配置
- `/opt/health-management/.env` - 环境变量
- `/opt/health-management/backend/src/main/resources/application-prod.yml` - 后端配置

### 日志文件
- `/opt/health-management/logs/backend.log` - 后端日志
- `/opt/health-management/logs/ai-service.log` - AI 服务日志
- `/var/log/nginx/health-management-*.log` - Nginx 日志

### 静态文件
- `/opt/health-management/frontend/dist/` - 前端构建产物
- `/opt/health-management/backend/uploads/` - 上传文件目录

## 🔍 故障排查

### 1. 服务无法启动

```bash
# 查看详细错误信息
sudo journalctl -u health-backend -n 50 --no-pager
sudo journalctl -u health-ai-service -n 50 --no-pager

# 检查配置文件
sudo systemctl cat health-backend
sudo systemctl cat health-ai-service

# 手动测试启动
cd /opt/health-management/backend
java -jar target/health-management-0.0.1-SNAPSHOT.jar

cd /opt/health-management/ai-service
source venv/bin/activate
python main.py
```

### 2. Nginx 配置错误

```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 检查配置文件语法
sudo cat /etc/nginx/sites-available/health-management.conf
```

### 3. 端口被占用

```bash
# 查看端口占用
sudo lsof -i :80
sudo lsof -i :8081
sudo lsof -i :8001

# 杀死占用进程
sudo kill -9 <PID>
```

### 4. 前端页面空白

```bash
# 检查前端构建产物
ls -la /opt/health-management/frontend/dist/

# 检查 Nginx 是否能访问文件
sudo -u www-data ls -la /opt/health-management/frontend/dist/

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/health-management-error.log

# 重新构建前端
cd /opt/health-management/frontend
npm run build
sudo systemctl reload nginx
```

### 5. API 请求失败

```bash
# 测试后端服务
curl http://localhost:8081/api/auth/health

# 测试 AI 服务
curl http://localhost:8001/health

# 检查 Nginx 代理配置
sudo nginx -t
curl http://localhost/api/auth/health
```

### 6. 数据库连接失败

```bash
# 测试数据库连接
psql -h 47.94.41.55 -U health_user -d health_db

# 检查后端配置
cat /opt/health-management/backend/src/main/resources/application-prod.yml

# 查看后端日志
sudo journalctl -u health-backend | grep -i database
```

## 🔒 安全配置

### 1. 防火墙配置

```bash
# Ubuntu (UFW)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 2. 配置 HTTPS (Let's Encrypt)

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加: 0 0 * * * certbot renew --quiet
```

### 3. 修改默认密码

编辑 `application-prod.yml`：

```yaml
spring:
  datasource:
    password: 新的数据库密码

jwt:
  secret: 新的JWT密钥（Base64编码）
```

重启服务：

```bash
sudo systemctl restart health-backend
```

### 4. 限制文件权限

```bash
# 设置合适的文件权限
sudo chown -R www-data:www-data /opt/health-management/frontend/dist
sudo chown -R root:root /opt/health-management/backend
sudo chmod 600 /opt/health-management/.env
```

## 📈 性能优化

### 1. 后端 JVM 优化

编辑 `/etc/systemd/system/health-backend.service`：

```ini
[Service]
Environment="JAVA_OPTS=-Xms1g -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

重新加载：

```bash
sudo systemctl daemon-reload
sudo systemctl restart health-backend
```

### 2. Nginx 优化

编辑 `/etc/nginx/nginx.conf`：

```nginx
worker_processes auto;
worker_connections 2048;

http {
    # 启用 HTTP/2
    # 在 server 块中: listen 443 ssl http2;
    
    # 连接优化
    keepalive_timeout 65;
    keepalive_requests 100;
    
    # 缓存优化
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

### 3. 数据库连接池

编辑 `application-prod.yml`：

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
```

## 🔄 备份和恢复

### 数据库备份

```bash
# 手动备份
cd /opt/health-management
./scripts/backup.sh

# 定时备份（每天凌晨 3 点）
sudo crontab -e
# 添加: 0 3 * * * /opt/health-management/scripts/backup.sh
```

### 数据库恢复

```bash
./scripts/restore.sh ./backups/db_backup_20241223_120000.dump
```

## 📊 监控

### 系统资源监控

```bash
# 实时监控
htop

# 磁盘使用
df -h

# 内存使用
free -h

# 服务状态
systemctl status health-backend health-ai-service nginx
```

### 日志监控

```bash
# 实时监控所有日志
sudo tail -f /opt/health-management/logs/*.log

# 监控 Nginx 访问日志
sudo tail -f /var/log/nginx/health-management-access.log | grep -v "health"
```

## 📝 部署检查清单

- [ ] 服务器满足最低配置要求
- [ ] 已安装所有依赖（Java, Node, Python, Nginx）
- [ ] 已上传代码到 `/opt/health-management`
- [ ] 已配置环境变量 `.env`
- [ ] 已执行 `deploy-nginx.sh` 脚本
- [ ] 后端服务正常运行（`systemctl status health-backend`）
- [ ] AI 服务正常运行（`systemctl status health-ai-service`）
- [ ] Nginx 正常运行（`systemctl status nginx`）
- [ ] 可以访问前端页面
- [ ] API 接口正常响应
- [ ] 用户可以注册登录
- [ ] 已配置防火墙
- [ ] 已配置 HTTPS（生产环境）
- [ ] 已设置自动备份

---

**部署完成！** 🎉

如有问题，请查看日志：
- 后端: `sudo journalctl -u health-backend -f`
- AI: `sudo journalctl -u health-ai-service -f`
- Nginx: `sudo tail -f /var/log/nginx/health-management-error.log`




