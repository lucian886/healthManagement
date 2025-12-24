#!/bin/bash

# ============================================
# Nginx 配置诊断脚本
# ============================================

echo "======================================"
echo "Nginx 配置诊断工具"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. 检查 Nginx 是否安装
echo -e "${BLUE}[1] 检查 Nginx 安装状态...${NC}"
if command -v nginx &> /dev/null; then
    echo -e "${GREEN}✅ Nginx 已安装：$(nginx -v 2>&1)${NC}"
else
    echo -e "${RED}❌ Nginx 未安装${NC}"
    exit 1
fi
echo ""

# 2. 检查 Nginx 配置语法
echo -e "${BLUE}[2] 测试 Nginx 配置语法...${NC}"
if sudo nginx -t 2>&1; then
    echo -e "${GREEN}✅ 配置语法正确${NC}"
else
    echo -e "${RED}❌ 配置语法错误！请先修复语法错误${NC}"
fi
echo ""

# 3. 检查 Nginx 运行状态
echo -e "${BLUE}[3] 检查 Nginx 运行状态...${NC}"
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx 正在运行${NC}"
    sudo systemctl status nginx --no-pager | head -5
else
    echo -e "${RED}❌ Nginx 未运行${NC}"
    echo -e "${YELLOW}尝试启动: sudo systemctl start nginx${NC}"
fi
echo ""

# 4. 检查配置文件位置
echo -e "${BLUE}[4] 检查配置文件位置...${NC}"
echo "主配置文件包含的目录："
cat /etc/nginx/nginx.conf | grep "include" | grep -v "#"
echo ""
echo "conf.d 目录下的配置文件："
ls -lh /etc/nginx/conf.d/ 2>/dev/null || echo "目录不存在"
echo ""
echo "sites-enabled 目录下的配置文件："
ls -lh /etc/nginx/sites-enabled/ 2>/dev/null || echo "目录不存在"
echo ""

# 5. 检查端口监听
echo -e "${BLUE}[5] 检查端口监听情况...${NC}"
echo "Nginx 监听的端口："
sudo netstat -tulnp | grep nginx
echo ""

# 6. 检查 server_name 配置
echo -e "${BLUE}[6] 检查 server_name 配置...${NC}"
echo "所有配置的域名："
sudo nginx -T 2>/dev/null | grep "server_name" | grep -v "#"
echo ""

# 7. 检查后端服务
echo -e "${BLUE}[7] 检查后端服务状态...${NC}"
if sudo systemctl is-active --quiet health-backend 2>/dev/null; then
    echo -e "${GREEN}✅ 后端服务运行正常${NC}"
else
    echo -e "${YELLOW}⚠️  后端服务未运行或未安装${NC}"
fi

if sudo systemctl is-active --quiet health-ai-service 2>/dev/null; then
    echo -e "${GREEN}✅ AI 服务运行正常${NC}"
else
    echo -e "${YELLOW}⚠️  AI 服务未运行或未安装${NC}"
fi
echo ""

# 8. 检查后端端口
echo -e "${BLUE}[8] 检查后端端口...${NC}"
if sudo netstat -tulnp | grep -q ":8081"; then
    echo -e "${GREEN}✅ 后端 8081 端口正在监听${NC}"
    sudo netstat -tulnp | grep ":8081"
else
    echo -e "${RED}❌ 后端 8081 端口未监听${NC}"
fi

if sudo netstat -tulnp | grep -q ":8001"; then
    echo -e "${GREEN}✅ AI 服务 8001 端口正在监听${NC}"
    sudo netstat -tulnp | grep ":8001"
else
    echo -e "${YELLOW}⚠️  AI 服务 8001 端口未监听${NC}"
fi
echo ""

# 9. 测试本地访问
echo -e "${BLUE}[9] 测试本地访问...${NC}"
echo "测试 80 端口："
curl -I http://localhost:80 2>/dev/null | head -3 || echo -e "${RED}❌ 80 端口无响应${NC}"
echo ""

echo "测试 8888 端口（博客）："
curl -I http://localhost:8888 2>/dev/null | head -3 || echo -e "${YELLOW}⚠️  8888 端口无响应${NC}"
echo ""

echo "测试后端 8081 端口："
curl -I http://localhost:8081/api/auth/health 2>/dev/null | head -3 || echo -e "${RED}❌ 后端无响应${NC}"
echo ""

# 10. 测试域名访问（本地）
echo -e "${BLUE}[10] 测试域名访问（本地）...${NC}"
curl -I -H "Host: health-management.top" http://localhost 2>/dev/null | head -3
echo ""

# 11. 检查 DNS 解析
echo -e "${BLUE}[11] 检查 DNS 解析...${NC}"
if command -v nslookup &> /dev/null; then
    nslookup health-management.top | tail -5
else
    ping -c 1 health-management.top 2>/dev/null || echo -e "${YELLOW}⚠️  DNS 未解析或网络不通${NC}"
fi
echo ""

# 12. 检查防火墙
echo -e "${BLUE}[12] 检查防火墙状态...${NC}"
if command -v ufw &> /dev/null; then
    echo "UFW 防火墙状态："
    sudo ufw status | grep -E "80|8888|443"
elif command -v firewall-cmd &> /dev/null; then
    echo "Firewalld 防火墙状态："
    sudo firewall-cmd --list-ports
else
    echo -e "${YELLOW}⚠️  未检测到防火墙${NC}"
fi
echo ""

# 13. 查看最近的错误日志
echo -e "${BLUE}[13] 查看 Nginx 最近的错误日志...${NC}"
if [ -f /var/log/nginx/error.log ]; then
    echo "最近 10 条错误："
    sudo tail -10 /var/log/nginx/error.log
else
    echo -e "${YELLOW}⚠️  错误日志文件不存在${NC}"
fi
echo ""

# 总结
echo "======================================"
echo -e "${GREEN}诊断完成！${NC}"
echo "======================================"
echo ""
echo "如果发现问题，请根据以上输出进行排查。"
echo ""
echo "常用修复命令："
echo "  sudo nginx -t                    # 测试配置"
echo "  sudo systemctl restart nginx     # 重启 Nginx"
echo "  sudo systemctl status nginx      # 查看状态"
echo "  sudo tail -f /var/log/nginx/error.log  # 实时查看错误"
echo ""




