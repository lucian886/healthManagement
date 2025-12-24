#!/bin/bash

# ============================================
# 健康管理系统 - 统一启动脚本（修复版）
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置
PROJECT_DIR="/opt/health-management"
BACKEND_DIR="$PROJECT_DIR/backend"
AI_SERVICE_DIR="$PROJECT_DIR/ai-service"
LOGS_DIR="$PROJECT_DIR/logs"
ENV_FILE="$PROJECT_DIR/.env"

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║     健康管理系统 - 统一启动脚本            ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# 函数：检查并 kill 端口
kill_port() {
    local port=$1
    local service_name=$2
    
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}⚠️  端口 $port 被占用 (PID: $pid)，正在停止 $service_name...${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
        echo -e "${GREEN}✅ 端口 $port 已释放${NC}"
    fi
}

# 函数：停止服务进程
stop_service() {
    local pattern=$1
    local service_name=$2
    
    pkill -f "$pattern" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${YELLOW}🛑 已停止 $service_name${NC}"
        sleep 2
    fi
}

# 函数：读取环境变量
load_env_var() {
    local key=$1
    local default=$2
    
    if [ -f "$ENV_FILE" ]; then
        local value=$(grep "^${key}=" "$ENV_FILE" | cut -d '=' -f 2- | tr -d '"' | tr -d "'")
        if [ -n "$value" ]; then
            echo "$value"
        else
            echo "$default"
        fi
    else
        echo "$default"
    fi
}

# ============================================
# 1. 检查环境
# ============================================
echo -e "\n${CYAN}[1/4] 检查环境...${NC}"

# 创建日志目录
mkdir -p "$LOGS_DIR"
echo -e "${GREEN}✅ 日志目录: $LOGS_DIR${NC}"

# 检查 .env 文件
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ 错误: 未找到 $ENV_FILE 文件${NC}"
    echo -e "${YELLOW}正在创建模板文件...${NC}"
    
    cat > "$ENV_FILE" <<EOF
# 通义千问 API Key（必填）
DASHSCOPE_API_KEY=sk-请修改为你的真实API密钥

# AI 服务配置
HOST=0.0.0.0
PORT=8001
MODEL_NAME=qwen-plus
EOF
    echo -e "${YELLOW}⚠️  请编辑 $ENV_FILE 填入真实的 API Key${NC}"
    echo -e "${YELLOW}然后重新运行: $0${NC}"
    exit 1
fi

# 读取 API Key
DASHSCOPE_API_KEY=$(load_env_var "DASHSCOPE_API_KEY" "")
if [ -z "$DASHSCOPE_API_KEY" ] || [ "$DASHSCOPE_API_KEY" == "sk-请修改为你的真实API密钥" ]; then
    echo -e "${RED}❌ 错误: DASHSCOPE_API_KEY 未设置或使用默认值${NC}"
    echo -e "${YELLOW}请编辑 $ENV_FILE 填入真实的 API Key${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 环境变量已加载${NC}"
echo -e "${BLUE}   API Key: ${DASHSCOPE_API_KEY:0:10}...${NC}"

# ============================================
# 2. 停止旧服务和释放端口
# ============================================
echo -e "\n${CYAN}[2/4] 停止旧服务...${NC}"

stop_service "health-management-1.0.0.jar" "后端服务"
stop_service "python3 main.py" "AI 服务"

kill_port 8081 "后端服务"
kill_port 8001 "AI 服务"

# ============================================
# 3. 启动服务
# ============================================
echo -e "\n${CYAN}[3/4] 启动服务...${NC}"

# 3.1 启动后端服务
echo -e "\n${BLUE}🚀 启动后端服务...${NC}"
if [ -f "$BACKEND_DIR/health-management-1.0.0.jar" ]; then
    cd "$BACKEND_DIR"
    
    # 创建上传目录
    mkdir -p uploads
    
    nohup java -jar health-management-1.0.0.jar \
        --spring.profiles.active=prod \
        > "$LOGS_DIR/backend.log" 2>&1 &
    
    BACKEND_PID=$!
    echo -e "${GREEN}   ✅ 后端服务已启动 (PID: $BACKEND_PID)${NC}"
    echo -e "   📋 日志: $LOGS_DIR/backend.log"
else
    echo -e "${RED}   ❌ 错误: 未找到 $BACKEND_DIR/health-management-1.0.0.jar${NC}"
fi

# 3.2 启动 AI 服务
echo -e "\n${BLUE}🤖 启动 AI 服务...${NC}"
if [ -f "$AI_SERVICE_DIR/main.py" ]; then
    cd "$AI_SERVICE_DIR"
    
    # 检查依赖
    if [ -f "requirements.txt" ]; then
        echo -e "${YELLOW}   检查 Python 依赖...${NC}"
        pip3 list | grep -q "fastapi" || {
            echo -e "${YELLOW}   安装依赖中...${NC}"
            pip3 install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/ > /dev/null 2>&1
        }
    fi
    
    # 使用 bash -c 确保环境变量传递给 nohup
    nohup bash -c "export DASHSCOPE_API_KEY='$DASHSCOPE_API_KEY' && python3 main.py" \
        > "$LOGS_DIR/ai-service.log" 2>&1 &
    
    AI_PID=$!
    echo -e "${GREEN}   ✅ AI 服务已启动 (PID: $AI_PID)${NC}"
    echo -e "   📋 日志: $LOGS_DIR/ai-service.log"
else
    echo -e "${RED}   ❌ 错误: 未找到 $AI_SERVICE_DIR/main.py${NC}"
    echo -e "${YELLOW}   请先上传 AI 服务文件${NC}"
fi

# ============================================
# 4. 验证服务状态
# ============================================
echo -e "\n${CYAN}[4/4] 验证服务状态...${NC}"

echo -e "\n${BLUE}⏳ 等待服务启动...${NC}"
sleep 5

echo -e "\n${BLUE}📊 进程状态:${NC}"
ps aux | grep -E "health-management-1.0.0|python3 main.py" | grep -v grep | \
    awk '{print "   PID: "$2" - "$11" "$12" "$13}'

echo -e "\n${BLUE}🌐 端口监听:${NC}"
(netstat -tulnp 2>/dev/null || ss -tulnp) | grep -E ":8081|:8001" | \
    awk '{print "   "$4" -> "$7}'

# 健康检查
echo -e "\n${BLUE}🔍 健康检查:${NC}"

sleep 3

# 检查 AI 服务
if curl -s --max-time 5 http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ AI 服务运行正常 (8001)${NC}"
else
    echo -e "${YELLOW}   ⚠️  AI 服务可能还在启动中${NC}"
    echo -e "${YELLOW}   查看日志: tail -f $LOGS_DIR/ai-service.log${NC}"
fi

# 检查后端
if curl -s --max-time 5 http://localhost:8081/actuator/health > /dev/null 2>&1 || \
   curl -s --max-time 5 http://localhost:8081/ > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ 后端服务运行正常 (8081)${NC}"
else
    echo -e "${YELLOW}   ⚠️  后端服务可能还在启动中${NC}"
    echo -e "${YELLOW}   查看日志: tail -f $LOGS_DIR/backend.log${NC}"
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
echo "║  - 所有: tail -f $LOGS_DIR/*.log"
echo "║  - 后端: tail -f $LOGS_DIR/backend.log"
echo "║  - AI:   tail -f $LOGS_DIR/ai-service.log"
echo "╠════════════════════════════════════════════╣"
echo "║  重启服务: $0                    ║"
echo "║  停止服务: pkill -f 'health-management'    ║"
echo "║           pkill -f 'python3 main.py'      ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "\n${BLUE}💡 提示: 如果服务未正常启动，请查看日志文件${NC}"

