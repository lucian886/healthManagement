#!/bin/bash

# ============================================
# 日志清理脚本
# ============================================

LOGS_DIR="/opt/health-management/logs"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║           日志清理工具                     ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

if [ ! -d "$LOGS_DIR" ]; then
    echo -e "${YELLOW}日志目录不存在: $LOGS_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}日志目录: $LOGS_DIR${NC}\n"

# 显示当前日志文件
echo "当前日志文件:"
ls -lh "$LOGS_DIR"/*.log 2>/dev/null || echo "暂无日志文件"

echo ""
echo "请选择操作:"
echo "  1) 清空后端日志 (backend.log)"
echo "  2) 清空 AI 服务日志 (ai-service.log)"
echo "  3) 清空所有日志"
echo "  4) 归档日志（保留备份）"
echo "  5) 取消"
echo ""

read -p "请输入选项 [1-5]: " choice

case $choice in
    1)
        > "$LOGS_DIR/backend.log"
        echo -e "${GREEN}✅ 后端日志已清空${NC}"
        ;;
    2)
        > "$LOGS_DIR/ai-service.log"
        echo -e "${GREEN}✅ AI 服务日志已清空${NC}"
        ;;
    3)
        echo -e "${RED}警告: 这将清空所有日志文件！${NC}"
        read -p "确认继续? (yes/no): " confirm
        if [ "$confirm" == "yes" ]; then
            > "$LOGS_DIR/backend.log"
            > "$LOGS_DIR/ai-service.log"
            echo -e "${GREEN}✅ 所有日志已清空${NC}"
        else
            echo "已取消"
        fi
        ;;
    4)
        BACKUP_DIR="$LOGS_DIR/backup"
        mkdir -p "$BACKUP_DIR"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        
        if [ -f "$LOGS_DIR/backend.log" ]; then
            cp "$LOGS_DIR/backend.log" "$BACKUP_DIR/backend_$TIMESTAMP.log"
            > "$LOGS_DIR/backend.log"
        fi
        
        if [ -f "$LOGS_DIR/ai-service.log" ]; then
            cp "$LOGS_DIR/ai-service.log" "$BACKUP_DIR/ai-service_$TIMESTAMP.log"
            > "$LOGS_DIR/ai-service.log"
        fi
        
        echo -e "${GREEN}✅ 日志已归档到: $BACKUP_DIR${NC}"
        ls -lh "$BACKUP_DIR"/*_$TIMESTAMP.log
        ;;
    5)
        echo "已取消"
        exit 0
        ;;
    *)
        echo -e "${YELLOW}无效选项${NC}"
        exit 1
        ;;
esac




