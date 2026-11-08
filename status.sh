#!/bin/bash
# ==============================================================================
# CRM STAPlus - Check System Status
# ==============================================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}====================================================================${NC}"
echo -e "${BLUE}           📊 BẢNG TRẠNG THÁI HỆ THỐNG CRM STAPLUS                ${NC}"
echo -e "${BLUE}====================================================================${NC}"
printf "%-26s %-10s %-12s %-15s\n" "Dịch vụ" "Cổng" "Trạng thái" "PID"
echo "--------------------------------------------------------------------"

check_port() {
    local name="$1"
    local port="$2"
    local pids=$(lsof -t -i :$port 2>/dev/null | tr '\n' ' ')
    if [ -n "$pids" ]; then
        printf "%-26s %-10s ${GREEN}%-12s${NC} %-15s\n" "$name" "$port" "RUNNING" "$pids"
    else
        printf "%-26s %-10s ${RED}%-12s${NC} %-15s\n" "$name" "$port" "STOPPED" "-"
    fi
}

check_port "PostgreSQL (Database)" "5432"
check_port "RabbitMQ (Broker)" "5672"
echo "--------------------------------------------------------------------"
check_port "API Gateway (Entry)" "8080"
check_port "Auth Service" "8081"
check_port "Lead Service" "8082"
check_port "Customer Service" "8083"
check_port "Sales Service" "8084"
check_port "Support Service" "8085"
check_port "Chat Service (WS)" "8086"
check_port "Notification Service" "8087"
check_port "Analytics Service" "8088"
echo "--------------------------------------------------------------------"
check_port "Frontend (Vite)" "5173"
echo "===================================================================="
