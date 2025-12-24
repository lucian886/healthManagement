#!/bin/bash

# ============================================
# 健康管理系统 - Nginx 传统部署脚本
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 配置
PROJECT_DIR="/opt/health-management"
FRONTEND_DIST="$PROJECT_DIR/frontend/dist"
BACKEND_JAR="$PROJECT_DIR/backend/target/health-management-0.0.1-SNAPSHOT.jar"
LOG_DIR="$PROJECT_DIR/logs"

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║     健康管理系统 - Nginx 部署脚本          ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ 请使用 root 权限运行此脚本${NC}"
    echo -e "${YELLOW}使用: sudo $0${NC}"
    exit 1
fi

# 检查依赖
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ 错误: $1 未安装${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ $1 已安装${NC}"
    return 0
}

echo -e "\n${PURPLE}[1/7] 检查系统依赖...${NC}\n"

check_command "java" || exit 1
check_command "node" || exit 1
check_command "npm" || exit 1
check_command "python3" || exit 1
check_command "nginx" || (echo -e "${YELLOW}请先安装 Nginx: sudo apt-get install nginx${NC}" && exit 1)

# 检查 Maven
if [ ! -f "$PROJECT_DIR/backend/mvnw" ]; then
    echo -e "${RED}❌ 未找到 Maven Wrapper${NC}"
    exit 1
fi

echo -e "\n${PURPLE}[2/7] 创建必要目录...${NC}"

mkdir -p $LOG_DIR
mkdir -p $PROJECT_DIR/backend/uploads
echo -e "${GREEN}✅ 目录创建完成${NC}"

# 构建前端
echo -e "\n${PURPLE}[3/7] 构建前端...${NC}\n"

cd $PROJECT_DIR/frontend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 安装前端依赖...${NC}"
    npm install
fi

echo -e "${BLUE}🔨 构建生产版本...${NC}"
npm run build

if [ ! -d "$FRONTEND_DIST" ]; then
    echo -e "${RED}❌ 前端构建失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 前端构建完成: $FRONTEND_DIST${NC}"

# 构建后端
echo -e "\n${PURPLE}[4/7] 构建后端...${NC}\n"

cd $PROJECT_DIR/backend

echo -e "${BLUE}🔨 Maven 构建中...${NC}"
./mvnw clean package -DskipTests

if [ ! -f "$BACKEND_JAR" ]; then
    echo -e "${RED}❌ 后端构建失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 后端构建完成: $BACKEND_JAR${NC}"

# 安装 Python 依赖
echo -e "\n${PURPLE}[5/7] 安装 AI 服务依赖...${NC}\n"

cd $PROJECT_DIR/ai-service

# 检查是否有虚拟环境
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 创建 Python 虚拟环境...${NC}"
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt
deactivate

echo -e "${GREEN}✅ Python 依赖安装完成${NC}"

# 配置 Systemd 服务
echo -e "\n${PURPLE}[6/7] 配置系统服务...${NC}\n"

# 停止旧服务
systemctl stop health-backend 2>/dev/null || true
systemctl stop health-ai-service 2>/dev/null || true

# 安装服务文件
cp $PROJECT_DIR/systemd/health-backend.service /etc/systemd/system/
cp $PROJECT_DIR/systemd/health-ai-service.service /etc/systemd/system/

# 重新加载 systemd
systemctl daemon-reload

# 启用服务
systemctl enable health-backend
systemctl enable health-ai-service

# 启动服务
echo -e "${BLUE}🚀 启动后端服务...${NC}"
systemctl start health-backend

echo -e "${BLUE}🚀 启动 AI 服务...${NC}"
systemctl start health-ai-service

# 等待服务启动
sleep 5

echo -e "${GREEN}✅ 系统服务配置完成${NC}"

# 配置 Nginx
echo -e "\n${PURPLE}[7/7] 配置 Nginx...${NC}\n"

# 备份旧配置
if [ -f "/etc/nginx/sites-available/health-management.conf" ]; then
    cp /etc/nginx/sites-available/health-management.conf \
       /etc/nginx/sites-available/health-management.conf.bak
    echo -e "${YELLOW}⚠️  已备份旧配置${NC}"
fi

# 复制新配置
cp $PROJECT_DIR/nginx/health-management.conf /etc/nginx/sites-available/

# 创建软链接
ln -sf /etc/nginx/sites-available/health-management.conf \
       /etc/nginx/sites-enabled/health-management.conf

# 删除默认配置（如果存在）
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
echo -e "${BLUE}🔍 测试 Nginx 配置...${NC}"
nginx -t

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx 配置测试失败${NC}"
    exit 1
fi

# 重启 Nginx
echo -e "${BLUE}🔄 重启 Nginx...${NC}"
systemctl restart nginx

echo -e "${GREEN}✅ Nginx 配置完成${NC}"

# 检查服务状态
echo -e "\n${PURPLE}检查服务状态...${NC}\n"

check_service() {
    local service=$1
    if systemctl is-active --quiet $service; then
        echo -e "${GREEN}✅ $service 运行正常${NC}"
        return 0
    else
        echo -e "${RED}❌ $service 运行异常${NC}"
        return 1
    fi
}

check_service "health-backend"
check_service "health-ai-service"
check_service "nginx"

# 显示访问信息
SERVER_IP=$(hostname -I | awk '{print $1}')

echo -e "\n${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║            🎉 部署完成！                   ║"
echo "╠════════════════════════════════════════════╣"
echo "║  访问地址: http://$SERVER_IP"
echo "║  本地访问: http://localhost"
echo "╠════════════════════════════════════════════╣"
echo "║  服务管理命令:"
echo "║  - 后端: systemctl status health-backend"
echo "║  - AI:   systemctl status health-ai-service"
echo "║  - Nginx: systemctl status nginx"
echo "╠════════════════════════════════════════════╣"
echo "║  日志位置: $LOG_DIR"
echo "║  前端文件: $FRONTEND_DIST"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# 显示服务日志
echo -e "\n${YELLOW}查看实时日志:${NC}"
echo -e "  journalctl -u health-backend -f"
echo -e "  journalctl -u health-ai-service -f"
echo -e "  tail -f /var/log/nginx/health-management-access.log"

echo -e "\n${GREEN}🎉 部署成功！现在可以访问: http://$SERVER_IP${NC}\n"




