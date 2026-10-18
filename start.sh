#!/usr/bin/env bash
# ==============================================================================
# KisanLink • Complete Full-Stack Server Startup Script
# Runs both the Express AI Backend (port 3001) and Vite Frontend (port 5173)
# Usage: ./start.sh   OR   npm start
# ==============================================================================

set -e

# ANSI Color Codes
GREEN='\033[0;32m'
LIME='\033[1;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Determine project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "\n${BOLD}${LIME}🌾 ========================================================= 🌾${NC}"
echo -e "${BOLD}${LIME}   KISANLINK • FARMER FIRST DIGITAL AGRICULTURAL PLATFORM   ${NC}"
echo -e "${BOLD}${LIME}🌾 ========================================================= 🌾${NC}\n"

# Step 1: Ensure Node.js and dependencies are present
if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] Node.js is not installed or not in PATH.${NC}"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}[SETUP] node_modules not found. Installing dependencies...${NC}"
  npm install
fi

# Step 2: Clean up any stale processes occupying ports 3001 or 5173
echo -e "${CYAN}[1/3] Checking and clearing ports 3001 (Backend) and 5173 (Frontend)...${NC}"
for PORT in 3001 5173; do
  PID=$(lsof -ti :$PORT 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo -e "${YELLOW}      Freeing port $PORT (killing existing PID $PID)...${NC}"
    kill -9 $PID 2>/dev/null || true
  fi
done

# Step 3: Define cleanup handler for graceful shutdown on Ctrl+C
cleanup() {
  echo -e "\n\n${YELLOW}[SHUTDOWN] Stopping KisanLink servers...${NC}"
  if [ -n "$BACKEND_PID" ]; then
    kill -TERM "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill -TERM "$FRONTEND_PID" 2>/dev/null || true
  fi
  sleep 0.5
  # Force kill any leftovers on those ports
  for PORT in 3001 5173; do
    PID=$(lsof -ti :$PORT 2>/dev/null || true)
    if [ -n "$PID" ]; then
      kill -9 $PID 2>/dev/null || true
    fi
  done
  echo -e "${GREEN}[SHUTDOWN] All servers stopped cleanly. Goodbye किसान भाई!${NC}\n"
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Step 4: Start Express AI Backend on port 3001
echo -e "${CYAN}[2/3] Starting Express AI Backend Server (Port 3001)...${NC}"
node server/server.js 2>&1 | sed -e "s/^/[BACKEND] /" &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 1.2

# Step 5: Start Vite Dev Server on port 5173 (accessible from all hosts/devices)
echo -e "${CYAN}[3/3] Starting Vite Frontend App (Port 5173)...${NC}"
npx vite --host 0.0.0.0 --port 5173 2>&1 | sed -e "s/^/[FRONTEND] /" &
FRONTEND_PID=$!

echo -e "\n${BOLD}${GREEN}================================================================${NC}"
echo -e "${BOLD}${LIME}  ✓ KisanLink Full-Stack Platform is ACTIVE & RUNNING!${NC}"
echo -e "${BOLD}${GREEN}================================================================${NC}"
echo -e "  ${BOLD}🌐 Frontend Web App:${NC}   ${LIME}http://localhost:5173${NC}"
echo -e "  ${BOLD}📱 Network / Mobile:${NC}   ${CYAN}http://0.0.0.0:5173${NC}"
echo -e "  ${BOLD}⚙️  Backend API & AI:${NC}   ${CYAN}http://localhost:3001${NC}"
echo -e "  ${BOLD}🎙️  Voice AI Assistant:${NC} Active (Gemini 3.5 Flash-Lite + NLP)"
echo -e "  ${BOLD}⛅ Weather Forecast:${NC}   Active (Free Open-Meteo Proxy)"
echo -e "${BOLD}${GREEN}================================================================${NC}"
echo -e "  ${YELLOW}👉 Press Ctrl+C at any time to stop all servers cleanly.${NC}"
echo -e "${BOLD}${GREEN}================================================================${NC}\n"

# Wait for both background processes
wait "$FRONTEND_PID" "$BACKEND_PID"
