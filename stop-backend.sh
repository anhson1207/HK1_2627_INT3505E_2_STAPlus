#!/bin/bash
# ==============================================================================
# CRM STAPlus - Stop Backend Microservices
# ==============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$ROOT_DIR/.pids"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}====================================================================${NC}"
echo -e "${YELLOW}        🛑 Đang dừng toàn bộ Backend Microservices...              ${NC}"
echo -e "${YELLOW}====================================================================${NC}"

PORTS=(8080 8081 8082 8083 8084 8085 8086 8087 8088)

for port in "${PORTS[@]}"; do
    PIDS=$(lsof -t -i :$port 2>/dev/null)
    if [ -n "$PIDS" ]; then
        for pid in $PIDS; do
            echo -e "🔻 Đang dừng tiến trình PID ${RED}$pid${NC} trên port ${BLUE}$port${NC}..."
            kill "$pid" 2>/dev/null
        done
    fi
done

# Đợi 2 giây
sleep 2

# Force kill nếu tiến trình nào chưa thoát
for port in "${PORTS[@]}"; do
    PIDS=$(lsof -t -i :$port 2>/dev/null)
    if [ -n "$PIDS" ]; then
        for pid in $PIDS; do
            echo -e "⚠️  Force kill PID ${RED}$pid${NC} trên port ${BLUE}$port${NC}..."
            kill -9 "$pid" 2>/dev/null
        done
    fi
done

rm -f "$PID_FILE"

echo -e "${GREEN}====================================================================${NC}"
echo -e "${GREEN} ✅ Đã giải phóng toàn bộ các cổng 8080 -> 8088 thành công!        ${NC}"
echo -e "${GREEN}====================================================================${NC}"
