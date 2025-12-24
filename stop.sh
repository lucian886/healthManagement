#!/bin/bash

# ============================================
# 健康管理系统 - 停止服务脚本
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$PROJECT_DIR/logs"

# 端口配置
FRONTEND_PORT=5173
BACKEND_PORT=8081
AI_SERVICE_PORT=8001

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║       健康管理系统 - 停止服务脚本          ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# 函数：停止服务
stop_service() {
    local name=$1
    local port=$2
    local pid_file="$LOG_DIR/$3.pid"
    
    echo -e "${YELLOW}🛑 停止 $name...${NC}"
    
    # 先尝试从 PID 文件停止
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            kill $pid 2>/dev/null
            sleep 1
            # 如果还在运行，强制杀掉
            if kill -0 $pid 2>/dev/null; then
                kill -9 $pid 2>/dev/null
            fi
        fi
        rm -f "$pid_file"
    fi
    
    # 再检查端口是否还有进程
    local port_pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$port_pid" ]; then
        kill -9 $port_pid 2>/dev/null
    fi
    
    echo -e "${GREEN}✅ $name 已停止${NC}"
}

# 停止所有服务
stop_service "前端服务" $FRONTEND_PORT "frontend"
stop_service "后端服务" $BACKEND_PORT "backend"
stop_service "AI 服务" $AI_SERVICE_PORT "ai-service"

echo -e "\n${GREEN}✅ 所有服务已停止${NC}"









