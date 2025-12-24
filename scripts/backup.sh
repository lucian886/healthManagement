#!/bin/bash

# ============================================
# 数据备份脚本
# ============================================

set -e

# 配置
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
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
echo "健康管理系统 - 数据备份"
echo "======================================${NC}"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份数据库
echo -e "\n${YELLOW}[1/2] 备份数据库...${NC}"
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  -F c \
  -f "$BACKUP_DIR/db_backup_$DATE.dump"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 数据库备份成功: $BACKUP_DIR/db_backup_$DATE.dump${NC}"
else
    echo -e "${RED}❌ 数据库备份失败${NC}"
    exit 1
fi

# 备份上传文件
echo -e "\n${YELLOW}[2/2] 备份上传文件...${NC}"
if [ -d "./backend/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C ./backend uploads
    echo -e "${GREEN}✅ 文件备份成功: $BACKUP_DIR/uploads_$DATE.tar.gz${NC}"
else
    echo -e "${YELLOW}⚠️  未找到上传文件目录${NC}"
fi

# 清理旧备份（保留最近7天）
echo -e "\n${YELLOW}清理旧备份...${NC}"
find "$BACKUP_DIR" -name "db_backup_*.dump" -mtime +7 -delete
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +7 -delete

echo -e "\n${GREEN}======================================"
echo "备份完成！"
echo "======================================${NC}"
echo -e "数据库备份: $BACKUP_DIR/db_backup_$DATE.dump"
echo -e "文件备份: $BACKUP_DIR/uploads_$DATE.tar.gz"




