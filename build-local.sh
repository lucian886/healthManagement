#!/bin/bash

# ============================================
# 本地构建脚本
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BLUE}🔨 开始构建健康管理系统...${NC}\n"

# 构建前端
echo -e "${YELLOW}[1/2] 构建前端...${NC}"
cd "$PROJECT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 安装前端依赖...${NC}"
    npm install
fi

npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 前端构建成功${NC}"
    echo -e "   产物: frontend/dist/"
    
    # 打包 dist
    tar -czf dist.tar.gz dist/
    echo -e "${GREEN}✅ 已打包: frontend/dist.tar.gz${NC}"
else
    echo -e "${RED}❌ 前端构建失败${NC}"
    exit 1
fi

# 构建后端
echo -e "\n${YELLOW}[2/2] 构建后端...${NC}"
cd "$PROJECT_DIR/backend"

# 检查是否有 mvnw，没有则使用系统 mvn
if [ -f "./mvnw" ]; then
    ./mvnw clean package -DskipTests
else
    mvn clean package -DskipTests
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 后端构建成功${NC}"
    JAR_FILE=$(ls target/*.jar 2>/dev/null | head -1)
    if [ -n "$JAR_FILE" ]; then
        echo -e "   产物: $JAR_FILE"
    fi
else
    echo -e "${RED}❌ 后端构建失败${NC}"
    exit 1
fi

# 完成
echo -e "\n${GREEN}🎉 构建完成！${NC}"
echo -e "\n${BLUE}产物位置:${NC}"
echo -e "  前端: ${PROJECT_DIR}/frontend/dist.tar.gz"
JAR_FILE=$(ls "$PROJECT_DIR/backend/target"/*.jar 2>/dev/null | head -1)
if [ -n "$JAR_FILE" ]; then
    echo -e "  后端: $JAR_FILE"
else
    echo -e "  后端: ${PROJECT_DIR}/backend/target/*.jar"
fi
echo -e "\n${BLUE}下一步:${NC}"
echo -e "  1. 上传 dist.tar.gz 到服务器 /opt/health-management/frontend/"
echo -e "  2. 上传 jar 包到服务器 /opt/health-management/backend/"
echo -e "  3. 在服务器上解压: cd /opt/health-management/frontend && tar -xzf dist.tar.gz"
echo -e "  4. 配置 Nginx 并启动服务"
