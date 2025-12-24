#!/bin/bash

# ============================================
# 数据恢复脚本
# ============================================

set -e

# 配置
DB_HOST="47.94.41.55"
DB_PORT="5432"
DB_NAME="health_db"
DB_USER="health_user"
DB_PASSWORD="Health@2024"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}======================================"
echo "健康管理系统 - 数据恢复"
echo "======================================${NC}"

# 检查参数
if [ $# -lt 1 ]; then
    echo -e "${RED}用法: $0 <backup_file.dump> [uploads_file.tar.gz]${NC}"
    echo -e "\n可用的备份文件:"
    ls -lh ./backups/*.dump 2>/dev/null || echo "未找到备份文件"
    exit 1
fi

DB_BACKUP=$1
UPLOADS_BACKUP=$2

# 恢复数据库
if [ -f "$DB_BACKUP" ]; then
    echo -e "\n${YELLOW}[1/2] 恢复数据库: $DB_BACKUP${NC}"
    echo -e "${RED}警告: 这将覆盖现有数据！${NC}"
    read -p "确认继续? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo "已取消"
        exit 0
    fi
    
    PGPASSWORD=$DB_PASSWORD pg_restore \
      -h $DB_HOST \
      -p $DB_PORT \
      -U $DB_USER \
      -d $DB_NAME \
      -c \
      "$DB_BACKUP"
    
    echo -e "${GREEN}✅ 数据库恢复成功${NC}"
else
    echo -e "${RED}❌ 找不到备份文件: $DB_BACKUP${NC}"
    exit 1
fi

# 恢复上传文件
if [ -n "$UPLOADS_BACKUP" ] && [ -f "$UPLOADS_BACKUP" ]; then
    echo -e "\n${YELLOW}[2/2] 恢复上传文件: $UPLOADS_BACKUP${NC}"
    tar -xzf "$UPLOADS_BACKUP" -C ./backend/
    echo -e "${GREEN}✅ 文件恢复成功${NC}"
else
    echo -e "${YELLOW}⚠️  未指定上传文件备份${NC}"
fi

echo -e "\n${GREEN}======================================"
echo "恢复完成！"
echo "======================================${NC}"




