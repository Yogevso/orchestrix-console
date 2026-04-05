#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
# Orchestrix Platform — End-to-End Demo Script
# Runs through all 5 services to show the full platform in action.
# Requires: curl, jq, all services running
#   Engine :8000  |  AI :8001  |  Insights :8002  |  IAM :8003  |  Console :5173
# ──────────────────────────────────────────────────────────────────

set -euo pipefail
ENGINE="http://localhost:8000"
AI="http://localhost:8001"
INSIGHTS="http://localhost:8002"
IAM="http://localhost:8003/api/v1"

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

step()  { echo -e "\n${BOLD}${CYAN}═══ $1 ═══${NC}\n"; }
info()  { echo -e "${GREEN}→${NC} $1"; }
warn()  { echo -e "${YELLOW}→${NC} $1"; }
fail()  { echo -e "${RED}✘${NC} $1"; }
wait_for() { sleep "${1:-2}"; }

echo -e "${BOLD}${CYAN}"
echo "  ╔═══════════════════════════════════════════════╗"
echo "  ║       Orchestrix Platform — Full Demo         ║"
echo "  ╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# ── 1. Service Health ────────────────────────────────────────────
step "1/8  Platform Health"
for svc in "$ENGINE/health:Engine" "$AI/health:AI" "$INSIGHTS/health:Insights" "$IAM/health:IAM"; do
  url="${svc%%:*}:${svc#*:*:}"
  url="${svc%%:[A-Z]*}"
  name="${svc##*:}"
done

check() {
  local url=$1 name=$2
  if curl -sf "$url" > /dev/null 2>&1; then
    info "$name — healthy"
  else
    fail "$name — unreachable"
  fi
}
check "$ENGINE/health" "Engine   (:8000)"
check "$AI/health"     "AI       (:8001)"
check "$INSIGHTS/health" "Insights (:8002)"
check "$IAM/health"    "IAM      (:8003)"

# ── 2. IAM — Authenticate ───────────────────────────────────────
step "2/8  IAM — Register & Login"
curl -s -X POST "$IAM/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"tenant_name":"Platform Demo","tenant_slug":"platform-demo","email":"ops@orchestrix.io","password":"Demo1234!"}' > /dev/null 2>&1 || true

LOGIN=$(curl -s -X POST "$IAM/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"tenant_slug":"platform-demo","email":"ops@orchestrix.io","password":"Demo1234!"}')
TOKEN=$(echo "$LOGIN" | jq -r '.access_token // empty')
if [ -n "$TOKEN" ]; then
  info "Authenticated as ops@orchestrix.io — JWT issued"
else
  warn "IAM login skipped (service may be unavailable)"
  TOKEN=""
fi

# ── 3. Engine — Submit a Job ─────────────────────────────────────
step "3/8  Engine — Submit & Execute a Job"
JOB=$(curl -s -X POST "$ENGINE/jobs" \
  -H "Content-Type: application/json" \
  -d '{"type":"data.process","payload":{"source":"platform-demo","action":"etl"}}')
JOB_ID=$(echo "$JOB" | jq -r '.id')
echo "$JOB" | jq '{id, type, status}'
info "Job $JOB_ID submitted — waiting for worker..."
wait_for 3

STATUS=$(curl -s "$ENGINE/jobs/$JOB_ID" | jq -r '.status')
info "Job status: $STATUS"

# ── 4. Engine — Queue Stats ─────────────────────────────────────
step "4/8  Engine — Queue Stats"
curl -s "$ENGINE/jobs/stats" | jq '[.[] | {queue_name, queued, running, succeeded, dead_letter}]'

# ── 5. Insights — Ingest Telemetry ──────────────────────────────
step "5/8  Insights — Ingest Host Telemetry"
curl -s -X POST "$INSIGHTS/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "syswatch",
    "batch_id": "platform-demo-001",
    "timestamp": "2026-04-02T12:00:00Z",
    "processes": [
      {"pid": 1001, "name": "orchestrix-worker", "cpu": 85.3, "mem_kb": 524288},
      {"pid": 1002, "name": "postgres", "cpu": 22.1, "mem_kb": 262144}
    ],
    "connections": [{"proto": "TCP", "local_port": 8000, "remote_port": 54321}],
    "alerts": [{"type": "high_cpu", "message": "orchestrix-worker spiked to 85% CPU"}]
  }' | jq '{status, inserted}'
info "Host metrics and alert ingested"

# ── 6. Insights — Query Stats ───────────────────────────────────
step "6/8  Insights — Aggregated Stats"
curl -s "$INSIGHTS/stats" | jq '{processes: {total: .processes.total_records, peak_cpu: .processes.peak_cpu, peak_process: .processes.peak_cpu_process}, alerts: .alerts}'

# ── 7. AI — Analyze Incident ────────────────────────────────────
step "7/8  AI — Incident Analysis"
info "Sending incident for AI root-cause analysis..."
ANALYSIS=$(curl -s -X POST "$AI/ai/analyze-incident" \
  -H "Content-Type: application/json" \
  -d '{"incident_id": "platform-demo-001", "time_range": "last_10_minutes"}')
echo "$ANALYSIS" | jq '{incident_type, summary, root_cause, source, quality}'
info "Source: $(echo "$ANALYSIS" | jq -r '.source') — correlations fed from Engine + Insights"

# ── 8. Console ───────────────────────────────────────────────────
step "8/8  Console — Single Entry Point"
echo -e "  ${BOLD}Open in browser:${NC}  http://localhost:5173"
echo ""
echo "  The Console dashboard shows:"
echo "    • Service status for all 4 backend services"
echo "    • Job queue depths from Engine"
echo "    • Host metrics from System Insights API"
echo "    • AI-powered incident analysis from Orchestrix AI"
echo "    • JWT-authenticated session from IAM"

# ── Cleanup ──────────────────────────────────────────────────────
echo ""
info "Cleaning up demo data..."
curl -s -X DELETE "$INSIGHTS/data?source=syswatch&batch_id=platform-demo-001" > /dev/null 2>&1 || true

echo ""
echo -e "${BOLD}${CYAN}"
echo "  ╔═══════════════════════════════════════════════╗"
echo "  ║       Platform Demo Complete                  ║"
echo "  ║                                               ║"
echo "  ║  Engine    → job scheduling, DAG workflows    ║"
echo "  ║  AI        → incident analysis, anomalies     ║"
echo "  ║  Insights  → telemetry ingestion & query      ║"
echo "  ║  IAM       → auth, RBAC, tenant isolation     ║"
echo "  ║  Console   → unified operator UI              ║"
echo "  ╚═══════════════════════════════════════════════╝"
echo -e "${NC}"
