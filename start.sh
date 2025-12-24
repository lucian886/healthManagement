#!/bin/bash

# ============================================
# 健康管理系统 - 一键启动脚本
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 端口配置
FRONTEND_PORT=5173
BACKEND_PORT=8081
AI_SERVICE_PORT=8001

# 日志目录
LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║       健康管理系统 - 一键启动脚本          ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# 函数：杀掉占用指定端口的进程
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}⚠️  端口 $port 被占用 (PID: $pid)，正在终止...${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
        echo -e "${GREEN}✅ 端口 $port 已释放${NC}"
    else
        echo -e "${GREEN}✅ 端口 $port 可用${NC}"
    fi
}

# 函数：检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ 错误: $1 未安装${NC}"
        return 1
    fi
    return 0
}

# 函数：等待服务启动
wait_for_service() {
    local port=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}⏳ 等待 $name 启动...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port" > /dev/null 2>&1 || \
           curl -s "http://localhost:$port/health" > /dev/null 2>&1 || \
           lsof -ti:$port > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $name 已启动 (端口: $port)${NC}"
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    
    echo -e "${YELLOW}⚠️  $name 启动超时，请检查日志${NC}"
    return 1
}

# ============================================
# 1. 检查依赖
# ============================================
echo -e "\n${PURPLE}[1/4] 检查环境依赖...${NC}"

check_command "java" || exit 1
check_command "node" || exit 1
check_command "python3" || exit 1
check_command "npm" || exit 1

echo -e "${GREEN}✅ 环境检查通过${NC}"

# ============================================
# 2. 释放端口
# ============================================
echo -e "\n${PURPLE}[2/4] 检查并释放端口...${NC}"

kill_port $FRONTEND_PORT
kill_port $BACKEND_PORT
kill_port $AI_SERVICE_PORT

# ============================================
# 3. 启动服务
# ============================================
echo -e "\n${PURPLE}[3/4] 启动服务...${NC}"

# 3.1 启动后端 (Spring Boot)
echo -e "\n${BLUE}🚀 启动后端服务 (Spring Boot)...${NC}"
cd "$PROJECT_DIR/backend"

# 检查是否需要编译
if [ ! -d "target" ] || [ ! -f "target/health-management-0.0.1-SNAPSHOT.jar" ]; then
    echo -e "${YELLOW}📦 首次运行，编译项目...${NC}"
    ./mvnw clean package -DskipTests > "$LOG_DIR/backend-build.log" 2>&1
fi

# 启动后端
nohup java -jar target/health-management-0.0.1-SNAPSHOT.jar > "$LOG_DIR/backend.log" 2>&1 &
echo $! > "$LOG_DIR/backend.pid"
echo -e "${GREEN}   后端服务启动中... (日志: logs/backend.log)${NC}"

# 3.2 启动 AI 服务 (Python FastAPI)
echo -e "\n${BLUE}🤖 启动 AI 服务 (FastAPI)...${NC}"
cd "$PROJECT_DIR/ai-service"

# 检查虚拟环境
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

nohup python3 main.py > "$LOG_DIR/ai-service.log" 2>&1 &
echo $! > "$LOG_DIR/ai-service.pid"
echo -e "${GREEN}   AI 服务启动中... (日志: logs/ai-service.log)${NC}"

# 3.3 启动前端 (Vite)
echo -e "\n${BLUE}🎨 启动前端服务 (Vite)...${NC}"
cd "$PROJECT_DIR/frontend"

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 安装前端依赖...${NC}"
    npm install > "$LOG_DIR/frontend-install.log" 2>&1
fi

nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
echo $! > "$LOG_DIR/frontend.pid"
echo -e "${GREEN}   前端服务启动中... (日志: logs/frontend.log)${NC}"

# ============================================
# 4. 等待服务就绪
# ============================================
echo -e "\n${PURPLE}[4/4] 等待服务就绪...${NC}"

sleep 3

wait_for_service $BACKEND_PORT "后端服务"
wait_for_service $AI_SERVICE_PORT "AI 服务"
wait_for_service $FRONTEND_PORT "前端服务"

# ============================================
# 完成
# ============================================
echo -e "\n${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║            🎉 所有服务已启动！             ║"
echo "╠════════════════════════════════════════════╣"
echo "║  前端地址: http://localhost:$FRONTEND_PORT          ║"
echo "║  后端地址: http://localhost:$BACKEND_PORT           ║"
echo "║  AI服务:   http://localhost:$AI_SERVICE_PORT           ║"
echo "╠════════════════════════════════════════════╣"
echo "║  日志目录: $PROJECT_DIR/logs     ║"
echo "║  停止服务: ./stop.sh                       ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# 打开浏览器（macOS）
if [[ "$OSTYPE" == "darwin"* ]]; then
    sleep 2
    open "http://localhost:$FRONTEND_PORT"
fi









