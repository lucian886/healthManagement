#!/bin/bash

# ============================================
# 健康管理系统 - 停止脚本
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║        停止健康管理系统所有服务            ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# 停止后端
echo -e "\n${YELLOW}🛑 停止后端服务...${NC}"
pkill -9 -f "health-management-1.0.0.jar" 2>/dev/null && echo -e "${GREEN}   ✅ 后端服务已停止${NC}" || echo -e "${YELLOW}   ⚠️  后端服务未运行${NC}"

# 停止 AI 服务
echo -e "\n${YELLOW}🛑 停止 AI 服务...${NC}"
pkill -9 -f "python3 main.py" 2>/dev/null && echo -e "${GREEN}   ✅ AI 服务已停止${NC}" || echo -e "${YELLOW}   ⚠️  AI 服务未运行${NC}"

# 清理端口
echo -e "\n${YELLOW}🧹 清理端口...${NC}"
lsof -ti :8081 | xargs kill -9 2>/dev/null && echo -e "${GREEN}   ✅ 端口 8081 已释放${NC}" || true
lsof -ti :8001 | xargs kill -9 2>/dev/null && echo -e "${GREEN}   ✅ 端口 8001 已释放${NC}" || true

sleep 2

# 验证
echo -e "\n${CYAN}📊 验证结果:${NC}"
if ps aux | grep -E "health-management|python3 main.py" | grep -v grep > /dev/null; then
    echo -e "${YELLOW}⚠️  仍有进程在运行:${NC}"
    ps aux | grep -E "health-management|python3 main.py" | grep -v grep
else
    echo -e "${GREEN}✅ 所有服务已停止${NC}"
fi

echo -e "\n${GREEN}🎉 完成！${NC}\n"







