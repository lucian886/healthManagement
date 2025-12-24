#!/bin/bash

# ============================================
# 健康管理系统 - 统一启动脚本
# ============================================

# 不使用 set -e，手动处理错误，避免脚本意外停止

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 配置
PROJECT_DIR="/opt/health-management"
LOGS_DIR="$PROJECT_DIR/logs"
ENV_FILE="$PROJECT_DIR/.env"

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║     健康管理系统 - 统一启动脚本            ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================
# 1. 检查环境变量
# ============================================
echo -e "\n${CYAN}[1/5] 检查环境配置...${NC}"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ 未找到 $ENV_FILE${NC}"
    echo -e "${YELLOW}正在创建模板文件...${NC}"
    cat > "$ENV_FILE" <<EOF
# 通义千问 API Key（必填）
DASHSCOPE_API_KEY=sk-请修改为你的真实API密钥
HOST=0.0.0.0
PORT=8001
MODEL_NAME=qwen-plus
EOF
    echo -e "${YELLOW}⚠️  请编辑 $ENV_FILE 填入真实的 API Key${NC}"
    echo -e "${YELLOW}然后重新运行: $0${NC}"
    exit 1
fi

# 读取 API Key
DASHSCOPE_API_KEY=$(grep "^DASHSCOPE_API_KEY=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'" | head -1)
if [ -z "$DASHSCOPE_API_KEY" ] || [ "$DASHSCOPE_API_KEY" == "sk-请修改为你的真实API密钥" ]; then
    echo -e "${RED}❌ DASHSCOPE_API_KEY 未正确设置${NC}"
    echo -e "${YELLOW}请编辑 $ENV_FILE 填入真实的 API Key${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 环境配置检查通过${NC}"
echo -e "${BLUE}   API Key: ${DASHSCOPE_API_KEY:0:10}...${NC}"

# 创建日志目录
mkdir -p "$LOGS_DIR" 2>/dev/null || true
echo -e "${GREEN}✅ 日志目录已创建: $LOGS_DIR${NC}"

# ============================================
# 2. 彻底清理旧进程和端口
# ============================================
echo -e "\n${CYAN}[2/5] 清理旧进程和端口...${NC}"

# 停止后端进程
echo -e "${YELLOW}停止后端服务...${NC}"
pkill -9 -f "health-management-1.0.0.jar" 2>/dev/null || true
sleep 1

# 停止 AI 服务进程
echo -e "${YELLOW}停止 AI 服务...${NC}"
pkill -9 -f "python3 main.py" 2>/dev/null || true
sleep 1

# 清理 8081 端口
PID_8081=$(lsof -ti :8081 2>/dev/null)
if [ -n "$PID_8081" ]; then
    echo -e "${YELLOW}清理端口 8081 (PID: $PID_8081)...${NC}"
    kill -9 $PID_8081 2>/dev/null || true
fi

# 清理 8001 端口
PID_8001=$(lsof -ti :8001 2>/dev/null)
if [ -n "$PID_8001" ]; then
    echo -e "${YELLOW}清理端口 8001 (PID: $PID_8001)...${NC}"
    kill -9 $PID_8001 2>/dev/null || true
fi

sleep 2
echo -e "${GREEN}✅ 清理完成${NC}"

# ============================================
# 3. 检查必要文件
# ============================================
echo -e "\n${CYAN}[3/5] 检查服务文件...${NC}"

# 检查后端 jar
if [ -f "$PROJECT_DIR/backend/health-management-1.0.0.jar" ]; then
    echo -e "${GREEN}✅ 后端 jar 文件存在${NC}"
else
    echo -e "${RED}❌ 未找到后端 jar 文件${NC}"
    echo -e "${YELLOW}   期望位置: $PROJECT_DIR/backend/health-management-1.0.0.jar${NC}"
    echo -e "${YELLOW}   继续启动 AI 服务...${NC}"
fi

# 检查 AI 服务
if [ -f "$PROJECT_DIR/ai-service/main.py" ]; then
    echo -e "${GREEN}✅ AI 服务文件存在${NC}"
else
    echo -e "${RED}❌ 未找到 AI 服务文件${NC}"
    echo -e "${YELLOW}   期望位置: $PROJECT_DIR/ai-service/main.py${NC}"
fi

# ============================================
# 4. 启动服务
# ============================================
echo -e "\n${CYAN}[4/5] 启动服务...${NC}"

# 启动后端
echo -e "\n${BLUE}🚀 启动后端服务...${NC}"
if [ -f "$PROJECT_DIR/backend/health-management-1.0.0.jar" ]; then
    cd "$PROJECT_DIR/backend"
    mkdir -p uploads 2>/dev/null || true
    nohup java -jar health-management-1.0.0.jar \
        --spring.profiles.active=prod \
        > "$LOGS_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo -e "${GREEN}   ✅ 后端服务已启动 (PID: $BACKEND_PID)${NC}"
else
    echo -e "${YELLOW}   ⚠️  跳过后端服务启动（jar 文件不存在）${NC}"
fi

# 启动 AI 服务
echo -e "\n${BLUE}🤖 启动 AI 服务...${NC}"
if [ -f "$PROJECT_DIR/ai-service/main.py" ]; then
    cd "$PROJECT_DIR/ai-service"
    
    # 使用完整的环境变量和 shell 来启动（立即返回）
    nohup bash -c "
    export DASHSCOPE_API_KEY='$DASHSCOPE_API_KEY'
    export HOST='0.0.0.0'
    export PORT='8001'
    export MODEL_NAME='qwen-plus'
    cd $PROJECT_DIR/ai-service
    exec python3 main.py
    " > "$LOGS_DIR/ai-service.log" 2>&1 &
    
    AI_PID=$!
    echo -e "${GREEN}   ✅ AI 服务已启动 (PID: $AI_PID)${NC}"
else
    echo -e "${YELLOW}   ⚠️  跳过 AI 服务启动（main.py 不存在）${NC}"
fi

# ============================================
# 5. 验证服务状态
# ============================================
echo -e "\n${CYAN}[5/5] 验证服务状态...${NC}"
echo -e "${BLUE}等待服务启动...${NC}"
sleep 8

# 检查进程
echo -e "\n${BLUE}📊 进程状态:${NC}"
BACKEND_RUNNING=$(ps aux | grep "health-management-1.0.0.jar" | grep -v grep | wc -l)
AI_RUNNING=$(ps aux | grep "python3 main.py" | grep -v grep | wc -l)

if [ "$BACKEND_RUNNING" -gt 0 ]; then
    echo -e "${GREEN}   ✅ 后端服务运行中${NC}"
else
    echo -e "${RED}   ❌ 后端服务未运行${NC}"
fi

if [ "$AI_RUNNING" -gt 0 ]; then
    echo -e "${GREEN}   ✅ AI 服务运行中${NC}"
else
    echo -e "${RED}   ❌ AI 服务未运行${NC}"
fi

# 检查端口
echo -e "\n${BLUE}🌐 端口监听:${NC}"
PORT_8081=$(netstat -tulnp 2>/dev/null | grep ":8081" || echo "")
PORT_8001=$(netstat -tulnp 2>/dev/null | grep ":8001" || echo "")

if [ -n "$PORT_8081" ]; then
    echo -e "${GREEN}   ✅ 端口 8081 (后端) 已监听${NC}"
else
    echo -e "${YELLOW}   ⚠️  端口 8081 未监听，服务可能还在启动${NC}"
fi

if [ -n "$PORT_8001" ]; then
    echo -e "${GREEN}   ✅ 端口 8001 (AI) 已监听${NC}"
else
    echo -e "${YELLOW}   ⚠️  端口 8001 未监听，服务可能还在启动${NC}"
fi

# 健康检查
echo -e "\n${BLUE}🔍 健康检查:${NC}"
sleep 3

# 检查 AI 服务
if curl -s --max-time 3 http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ AI 服务健康检查通过${NC}"
else
    echo -e "${YELLOW}   ⚠️  AI 服务健康检查失败，可能还在启动中${NC}"
fi

# 检查后端
if curl -s --max-time 3 http://localhost:8081/ > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ 后端服务健康检查通过${NC}"
else
    echo -e "${YELLOW}   ⚠️  后端服务健康检查失败，可能还在启动中${NC}"
fi

# ============================================
# 完成
# ============================================
SERVER_IP=$(hostname -I | awk '{print $1}')

echo -e "\n${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║            🎉 启动完成！                   ║"
echo "╠════════════════════════════════════════════╣"
echo "║  博客:        http://$SERVER_IP"
echo "║  健康管理:    http://$SERVER_IP:8080"
echo "╠════════════════════════════════════════════╣"
echo "║  查看日志:                                 ║"
echo "║  - 后端: tail -f $LOGS_DIR/backend.log"
echo "║  - AI:   tail -f $LOGS_DIR/ai-service.log"
echo "║  - 全部: tail -f $LOGS_DIR/*.log"
echo "╠════════════════════════════════════════════╣"
echo "║  管理命令:                                 ║"
echo "║  - 重启: $0"
echo "║  - 查看进程: ps aux | grep -E 'health-management|python3 main.py'"
echo "║  - 停止后端: pkill -f health-management"
echo "║  - 停止AI: pkill -f 'python3 main.py'"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# 显示最近的日志（用于快速排查问题）
if [ "$BACKEND_RUNNING" -eq 0 ] || [ "$AI_RUNNING" -eq 0 ]; then
    echo -e "\n${YELLOW}检测到服务可能启动失败，显示最近的日志:${NC}"
    
    if [ "$BACKEND_RUNNING" -eq 0 ]; then
        echo -e "\n${RED}=== 后端日志（最近 20 行）===${NC}"
        tail -20 "$LOGS_DIR/backend.log" 2>/dev/null || echo "日志文件不存在"
    fi
    
    if [ "$AI_RUNNING" -eq 0 ]; then
        echo -e "\n${RED}=== AI 服务日志（最近 20 行）===${NC}"
        tail -20 "$LOGS_DIR/ai-service.log" 2>/dev/null || echo "日志文件不存在"
    fi
fi

echo -e "\n${BLUE}💡 提示: 等待 10-15 秒后再访问服务，确保完全启动${NC}\n"

