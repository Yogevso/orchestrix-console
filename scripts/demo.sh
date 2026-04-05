#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
# Orchestrix Console — Live Demo Script
# Run: bash scripts/demo.sh
# Requires: npm, node (or the dev server already running)
# ──────────────────────────────────────────────────────────────────

set -euo pipefail
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

step() { echo -e "\n${BOLD}${CYAN}═══ $1 ═══${NC}\n"; }
info() { echo -e "${GREEN}→${NC} $1"; }
warn() { echo -e "${YELLOW}→${NC} $1"; }

# ── 1. Prerequisites ────────────────────────────────────────────
step "1/6  Prerequisites"
echo "Node $(node --version)"
echo "npm  $(npm --version)"
info "Runtime ready"

# ── 2. Install Dependencies ─────────────────────────────────────
step "2/6  Install Dependencies"
npm install --silent 2>/dev/null
info "Dependencies installed"

# ── 3. TypeScript Check ─────────────────────────────────────────
step "3/6  TypeScript Compile Check"
npx tsc --noEmit 2>&1 | tail -1 || true
info "Type check complete"

# ── 4. Lint ─────────────────────────────────────────────────────
step "4/6  Lint"
npx eslint src/ --max-warnings 0 2>/dev/null && info "No lint warnings" || warn "Lint warnings found"

# ── 5. Build for Production ──────────────────────────────────────
step "5/6  Production Build"
npm run build 2>&1 | tail -3
info "Build output in dist/"

# ── 6. Start Dev Server ─────────────────────────────────────────
step "6/6  Start Dev Server"
echo -e "Starting Vite dev server..."
echo ""
echo -e "  ${BOLD}Console:${NC}  http://localhost:5173"
echo -e "  ${BOLD}Login:${NC}    admin / admin"
echo ""
echo -e "  ${BOLD}Proxies:${NC}"
echo -e "    /api      → Orchestrix Engine   :8000"
echo -e "    /ai       → Orchestrix AI       :8001"
echo -e "    /insights → System Insights API  :8002"
echo -e "    /iam      → Identity Access Svc  :8003"
echo ""
info "Run 'npm run dev' to launch"
echo ""
echo -e "${BOLD}Pages to explore:${NC}"
echo "  Dashboard        — platform overview, service status, queue depths"
echo "  Jobs             — list, filter, retry, cancel async jobs"
echo "  Workers          — live worker pool status"
echo "  Workflow Runs    — DAG execution progress"
echo "  Telemetry        — host metrics from System Insights API"
echo "  Incidents        — AI-powered root cause analysis"
echo "  Analytics        — failure rates, trends, severity breakdown"
echo "  Audit Logs       — user and system action trail"
echo ""
info "Demo complete — Console is the single entry point for the entire platform"
