#!/bin/bash

# ============================================
# 日志查看脚本
# ============================================

LOGS_DIR="/opt/health-management/logs"

# 颜色定义
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║           日志查看工具                     ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

if [ ! -d "$LOGS_DIR" ]; then
    echo -e "${YELLOW}日志目录不存在: $LOGS_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}日志目录: $LOGS_DIR${NC}\n"

# 菜单
echo "请选择要查看的日志:"
echo "  1) 后端日志 (backend.log)"
echo "  2) AI 服务日志 (ai-service.log)"
echo "  3) 所有日志（实时）"
echo "  4) 查看所有日志文件列表"
echo "  5) 退出"
echo ""

read -p "请输入选项 [1-5]: " choice

case $choice in
    1)
        echo -e "\n${CYAN}=== 后端日志（实时）===${NC}"
        tail -f "$LOGS_DIR/backend.log"
        ;;
    2)
        echo -e "\n${CYAN}=== AI 服务日志（实时）===${NC}"
        tail -f "$LOGS_DIR/ai-service.log"
        ;;
    3)
        echo -e "\n${CYAN}=== 所有日志（实时）===${NC}"
        tail -f "$LOGS_DIR"/*.log
        ;;
    4)
        echo -e "\n${CYAN}=== 日志文件列表 ===${NC}"
        ls -lh "$LOGS_DIR"/*.log 2>/dev/null || echo "暂无日志文件"
        echo ""
        echo "查看方式："
        echo "  tail -f $LOGS_DIR/backend.log     # 后端日志"
        echo "  tail -f $LOGS_DIR/ai-service.log  # AI 日志"
        echo "  tail -f $LOGS_DIR/*.log           # 所有日志"
        ;;
    5)
        echo "退出"
        exit 0
        ;;
    *)
        echo -e "${YELLOW}无效选项${NC}"
        exit 1
        ;;
esac




