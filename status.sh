#!/bin/bash

# ============================================
# 健康管理系统 - 状态检查
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

LOGS_DIR="/opt/health-management/logs"

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║        健康管理系统 - 状态检查             ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. 进程状态
echo -e "\n${BLUE}[1] 进程状态:${NC}"
BACKEND_PID=$(ps aux | grep "health-management-1.0.0.jar" | grep -v grep | awk '{print $2}')
AI_PID=$(ps aux | grep "python3 main.py" | grep -v grep | awk '{print $2}')

if [ -n "$BACKEND_PID" ]; then
    echo -e "${GREEN}✅ 后端服务运行中 (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ 后端服务未运行${NC}"
fi

if [ -n "$AI_PID" ]; then
    echo -e "${GREEN}✅ AI 服务运行中 (PID: $AI_PID)${NC}"
else
    echo -e "${RED}❌ AI 服务未运行${NC}"
fi

# 2. 端口监听
echo -e "\n${BLUE}[2] 端口监听:${NC}"
netstat -tulnp 2>/dev/null | grep -E ":80 |:8080 |:8081 |:8001 " | awk '{print "   "$4" -> "$7}' || \
ss -tulnp | grep -E ":80 |:8080 |:8081 |:8001 "

# 3. 健康检查
echo -e "\n${BLUE}[3] 健康检查:${NC}"

# AI 服务
if curl -s --max-time 3 http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ AI 服务 (8001) 响应正常${NC}"
else
    echo -e "${RED}❌ AI 服务 (8001) 无响应${NC}"
fi

# 后端服务
if curl -s --max-time 3 http://localhost:8081/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 后端服务 (8081) 响应正常${NC}"
else
    echo -e "${RED}❌ 后端服务 (8081) 无响应${NC}"
fi

# Nginx
if curl -s --max-time 3 http://localhost:8080/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 前端服务 (8080) 响应正常${NC}"
else
    echo -e "${YELLOW}⚠️  前端服务 (8080) 无响应${NC}"
fi

# 4. 日志大小
echo -e "\n${BLUE}[4] 日志文件:${NC}"
if [ -d "$LOGS_DIR" ]; then
    ls -lh "$LOGS_DIR"/*.log 2>/dev/null | awk '{print "   "$9" ("$5")"}'
else
    echo -e "${YELLOW}   日志目录不存在${NC}"
fi

# 5. 系统资源
echo -e "\n${BLUE}[5] 系统资源:${NC}"
echo -e "   CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)% 使用"
echo -e "   内存: $(free -h | awk 'NR==2{print $3"/"$2" ("$3/$2*100"%)"}')"
echo -e "   磁盘: $(df -h / | awk 'NR==2{print $3"/"$2" ("$5")"}')"

# 6. 访问地址
echo -e "\n${BLUE}[6] 访问地址:${NC}"
SERVER_IP=$(hostname -I | awk '{print $1}')
echo -e "   博客:        ${GREEN}http://$SERVER_IP${NC}"
echo -e "   健康管理:    ${GREEN}http://$SERVER_IP:8080${NC}"

# 7. 管理命令
echo -e "\n${BLUE}[7] 管理命令:${NC}"
echo -e "   启动服务:    /opt/health-management/start-all.sh"
echo -e "   停止服务:    /opt/health-management/stop-all.sh"
echo -e "   查看日志:    tail -f $LOGS_DIR/*.log"

echo -e "\n${CYAN}════════════════════════════════════════════${NC}\n"




