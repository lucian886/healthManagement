#!/bin/bash

# ============================================
# 健康管理系统 - Docker 部署脚本
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║     健康管理系统 - Docker 部署脚本         ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ 错误: Docker 未安装${NC}"
    echo -e "${YELLOW}请先安装 Docker: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ 错误: Docker Compose 未安装${NC}"
    echo -e "${YELLOW}请先安装 Docker Compose: https://docs.docker.com/compose/install/${NC}"
    exit 1
fi

# 检查 .env 文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  警告: 未找到 .env 文件${NC}"
    echo -e "${BLUE}📝 正在从 .env.example 创建 .env 文件...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  请编辑 .env 文件，填入正确的配置信息！${NC}"
    echo -e "${YELLOW}然后再次运行此脚本。${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 环境检查通过${NC}\n"

# 选择部署模式
echo -e "${PURPLE}请选择部署模式:${NC}"
echo -e "  ${CYAN}1)${NC} 全新部署（构建并启动所有服务）"
echo -e "  ${CYAN}2)${NC} 重启服务（不重新构建）"
echo -e "  ${CYAN}3)${NC} 更新并重启（重新构建并启动）"
echo -e "  ${CYAN}4)${NC} 停止所有服务"
echo -e "  ${CYAN}5)${NC} 查看服务状态"
echo -e "  ${CYAN}6)${NC} 查看日志"
read -p "$(echo -e ${YELLOW}请输入选项 [1-6]: ${NC})" choice

case $choice in
    1)
        echo -e "\n${BLUE}🚀 开始全新部署...${NC}\n"
        
        # 停止并删除旧容器
        echo -e "${YELLOW}🛑 停止并删除旧容器...${NC}"
        docker-compose down -v
        
        # 构建镜像
        echo -e "\n${BLUE}🔨 构建 Docker 镜像...${NC}"
        docker-compose build --no-cache
        
        # 启动服务
        echo -e "\n${GREEN}🚀 启动所有服务...${NC}"
        docker-compose up -d
        
        echo -e "\n${GREEN}✅ 部署完成！${NC}"
        ;;
        
    2)
        echo -e "\n${BLUE}🔄 重启服务...${NC}\n"
        docker-compose restart
        echo -e "\n${GREEN}✅ 服务已重启！${NC}"
        ;;
        
    3)
        echo -e "\n${BLUE}🔄 更新并重启服务...${NC}\n"
        
        # 停止服务
        echo -e "${YELLOW}🛑 停止服务...${NC}"
        docker-compose down
        
        # 重新构建
        echo -e "\n${BLUE}🔨 重新构建镜像...${NC}"
        docker-compose build
        
        # 启动服务
        echo -e "\n${GREEN}🚀 启动服务...${NC}"
        docker-compose up -d
        
        echo -e "\n${GREEN}✅ 更新完成！${NC}"
        ;;
        
    4)
        echo -e "\n${YELLOW}🛑 停止所有服务...${NC}\n"
        docker-compose down
        echo -e "\n${GREEN}✅ 所有服务已停止！${NC}"
        exit 0
        ;;
        
    5)
        echo -e "\n${BLUE}📊 服务状态:${NC}\n"
        docker-compose ps
        exit 0
        ;;
        
    6)
        echo -e "\n${BLUE}请选择要查看的服务日志:${NC}"
        echo -e "  ${CYAN}1)${NC} AI 服务"
        echo -e "  ${CYAN}2)${NC} 后端服务"
        echo -e "  ${CYAN}3)${NC} 前端服务"
        echo -e "  ${CYAN}4)${NC} 所有服务"
        read -p "$(echo -e ${YELLOW}请输入选项 [1-4]: ${NC})" log_choice
        
        case $log_choice in
            1) docker-compose logs -f ai-service ;;
            2) docker-compose logs -f backend ;;
            3) docker-compose logs -f frontend ;;
            4) docker-compose logs -f ;;
            *) echo -e "${RED}无效选项${NC}" ;;
        esac
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ 无效选项${NC}"
        exit 1
        ;;
esac

# 等待服务启动
echo -e "\n${BLUE}⏳ 等待服务启动...${NC}"
sleep 10

# 检查服务状态
echo -e "\n${PURPLE}📊 服务状态:${NC}\n"
docker-compose ps

# 显示访问信息
echo -e "\n${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║            🎉 部署完成！                   ║"
echo "╠════════════════════════════════════════════╣"
echo "║  前端地址: http://localhost              ║"
echo "║  后端地址: http://localhost:8081         ║"
echo "║  AI服务:   http://localhost:8001         ║"
echo "╠════════════════════════════════════════════╣"
echo "║  查看日志: docker-compose logs -f        ║"
echo "║  停止服务: docker-compose down           ║"
echo "║  重启服务: docker-compose restart        ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# 健康检查
echo -e "\n${BLUE}🔍 执行健康检查...${NC}\n"

check_service() {
    local name=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $name 运行正常${NC}"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${YELLOW}⚠️  $name 健康检查超时，请检查日志${NC}"
    return 1
}

check_service "AI 服务" "http://localhost:8001/health"
check_service "后端服务" "http://localhost:8081/api/auth/health"
check_service "前端服务" "http://localhost/health"

echo -e "\n${GREEN}🎉 所有服务已就绪！${NC}\n"







