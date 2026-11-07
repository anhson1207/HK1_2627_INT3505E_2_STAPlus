#!/bin/bash
# ==============================================================================
# CRM STAPlus - Start Backend Microservices
# ==============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR" || exit 1

mkdir -p logs
PID_FILE="$ROOT_DIR/.pids"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================================${NC}"
echo -e "${BLUE}        🚀 CRM STAPlus - Khởi động Backend Microservices           ${NC}"
echo -e "${BLUE}====================================================================${NC}"

# 1. Load .env
if [ -f "$ROOT_DIR/.env" ]; then
    echo -e "${CYAN}ℹ️  Đang nạp biến môi trường từ .env...${NC}"
    set -a
    source "$ROOT_DIR/.env"
    set +a
else
    echo -e "${YELLOW}⚠️  Không tìm thấy .env, sử dụng cấu hình mặc định development.${NC}"
    export JWT_SECRET="secure-random-jwt-secret-key-crm-2026-staplus-at-least-32-chars"
    export INTERNAL_SERVICE_KEY="secure-internal-crm-key-min-16-chars-2026"
    export DB_USERNAME="postgres"
    export DB_PASSWORD="postgres"
    export DB_URL="jdbc:postgresql://localhost:5432/crm_db"
    export CHAT_DB_URL="jdbc:postgresql://localhost:5432/chat_db"
    export SALES_DB_URL="jdbc:postgresql://localhost:5432/sales_db"
    export AUTH_SERVICE_URL="http://localhost:8081"
    export CHAT_SERVICE_URL="http://localhost:8086"
fi

# 2. Kiểm tra PostgreSQL (Port 5432)
if ! lsof -i :5432 >/dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL (port 5432) chưa chạy!${NC}"
    echo -e "${YELLOW}   Vui lòng bật PostgreSQL trước khi chạy backend:${NC}"
    echo -e "   brew services start postgresql@16  (hoặc pg_ctl start)"
    exit 1
else
    echo -e "${GREEN}✅ PostgreSQL (port 5432) đang hoạt động.${NC}"
fi

# 3. Định nghĩa danh sách các service
# Format: "service_dir:port:service_name:db_url"
SERVICES=(
    "backend/api-gateway:8080:API Gateway:"
    "backend/auth-service:8081:Auth Service:jdbc:postgresql://localhost:5432/crm_db"
    "backend/chat-service:8086:Chat Service:jdbc:postgresql://localhost:5432/chat_db"
    "backend/lead-service:8082:Lead Service:jdbc:postgresql://localhost:5432/crm_db"
    "backend/customer-service:8083:Customer Service:jdbc:postgresql://localhost:5432/crm_db"
    "backend/sales-service:8084:Sales Service:jdbc:postgresql://localhost:5432/sales_db"
    "backend/support-service:8085:Support Service:jdbc:postgresql://localhost:5432/sales_db"
    "backend/notification-service:8087:Notification Service:jdbc:postgresql://localhost:5432/sales_db"
    "backend/analytics-service:8088:Analytics Service:jdbc:postgresql://localhost:5432/sales_db"
)

# Nếu người dùng truyền tham số 'core', chỉ chạy Gateway, Auth, Chat
if [ "$1" == "core" ]; then
    echo -e "${CYAN}Chế độ: CHỈ CHẠY CỐT LÕI (Gateway, Auth, Chat)${NC}"
    SERVICES=(
        "backend/api-gateway:8080:API Gateway:"
        "backend/auth-service:8081:Auth Service:jdbc:postgresql://localhost:5432/crm_db"
        "backend/chat-service:8086:Chat Service:jdbc:postgresql://localhost:5432/chat_db"
    )
fi

echo ""

# Hàm khởi động 1 service
start_service() {
    local dir="$1"
    local port="$2"
    local name="$3"
    local db_url="$4"
    local log_file="$ROOT_DIR/logs/${dir##*/}.log"

    # Kiểm tra nếu thư mục service tồn tại
    if [ ! -d "$ROOT_DIR/$dir" ]; then
        echo -e "${YELLOW}⏩ [Port $port] $name không tồn tại trên nhánh này, bỏ qua.${NC}"
        return
    fi

    # Kiểm tra nếu port đã có process chạy
    if lsof -i :$port >/dev/null 2>&1; then
        local existing_pid=$(lsof -t -i :$port | head -n 1)
        echo -e "${YELLOW}⚡ [Port $port] $name đã đang chạy (PID: $existing_pid)${NC}"
        echo "$existing_pid:$port:$name" >> "$PID_FILE"
        return
    fi

    echo -ne "⏳ Đang khởi động ${BLUE}$name${NC} (Port $port)... "

    # Thiết lập DB_URL đặc thù nếu có
    if [ -n "$db_url" ]; then
        export DB_URL="$db_url"
    fi

    [ -f "$ROOT_DIR/$dir/mvnw" ] && chmod +x "$ROOT_DIR/$dir/mvnw"

    # Kiểm tra nếu có file jar đã build sẵn
    local jar_file=$(ls "$ROOT_DIR/$dir/target"/*.jar 2>/dev/null | grep -v "original" | head -n 1)

    if [ -n "$jar_file" ] && [ -f "$jar_file" ]; then
        java -jar "$jar_file" > "$log_file" 2>&1 &
        local pid=$!
    else
        (cd "$ROOT_DIR/$dir" && ./mvnw spring-boot:run > "$log_file" 2>&1) &
        local pid=$!
    fi

    echo "$pid:$port:$name" >> "$PID_FILE"
    echo -e "${GREEN}Đã phát lệnh (PID: $pid). Log: logs/${dir##*/}.log${NC}"
}

# Khởi động tuần tự từng service
for item in "${SERVICES[@]}"; do
    IFS=":" read -r dir port name db_url <<< "$item"
    start_service "$dir" "$port" "$name" "$db_url"
    sleep 1
done

echo ""
echo -e "${GREEN}====================================================================${NC}"
echo -e "${GREEN} 🎉 Đã kích hoạt toàn bộ Backend services!${NC}"
echo -e "${CYAN} ℹ️  Bạn có thể kiểm tra trạng thái bằng lệnh: ${YELLOW}./status.sh${NC}"
echo -e "${CYAN} ℹ️  Khi muốn dừng toàn bộ dịch vụ, chạy lệnh: ${YELLOW}./stop-backend.sh${NC}"
echo -e "${GREEN}====================================================================${NC}"
