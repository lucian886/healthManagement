#!/bin/bash

# ============================================
# 服务健康检查脚本
# ============================================

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================"
echo "服务健康检查"
echo "======================================${NC}\n"

# 检查函数
check_service() {
    local name=$1
    local url=$2
    
    echo -ne "检查 $name ... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "200" ] || [ "$response" = "000" ]; then
        # 尝试获取更多信息
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 正常${NC}"
            return 0
        fi
    fi
    
    echo -e "${RED}❌ 异常 (HTTP $response)${NC}"
    return 1
}

# 检查 Docker 容器状态
echo -e "${YELLOW}[1] Docker 容器状态:${NC}\n"
docker-compose ps

echo -e "\n${YELLOW}[2] 服务健康检查:${NC}\n"

# 检查各服务
check_service "前端服务 (Frontend)" "http://localhost/health"
check_service "后端服务 (Backend)" "http://localhost:8081/api/auth/health"
check_service "AI 服务 (AI Service)" "http://localhost:8001/health"

# 系统资源检查
echo -e "\n${YELLOW}[3] 系统资源:${NC}\n"

# CPU 使用率
cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
echo -e "CPU 使用率: ${cpu_usage}%"

# 内存使用
free -h | awk 'NR==2{printf "内存使用: %s / %s (%.2f%%)\n", $3,$2,$3*100/$2 }'

# 磁盘使用
df -h / | awk 'NR==2{printf "磁盘使用: %s / %s (%s)\n", $3,$2,$5}'

# Docker 统计
echo -e "\n${YELLOW}[4] Docker 容器资源:${NC}\n"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo -e "\n${BLUE}======================================${NC}"




