#!/bin/bash
# Run discovery pipeline autonomously
# Usage: ./run-discovery-cron.sh

set -e

echo "=== Discovery Cycle Started: $(date) ==="

# Navigate to project
cd /Users/shaansisodia/SISO_Workspace/SISO_Internal_Lab

# Set environment
export ANTHROPIC_AUTH_TOKEN="sk-cp-ZofEB58oTFP1aqhFL899Ochso3QQTtpRkZtffA0kW4hzaLR07qtA9bF1V0MHxjk80dr9DRK9DOcgaUvqGVG2POc02dty9LbpM9EXGUNpOhszjbf2tGd5ogU"
export ANTHROPIC_BASE_URL="https://api.minimax.io/anthropic"

# Start discovery agents (if not running)
echo "Starting discovery agents..."

# Discovery Code
sf agent start el-2inb --model MiniMax-M2.5-highspeed --env CLAUDECODE= --mode headless 2>/dev/null || true
sleep 2

# Send task to discovery-code
sf message send --to el-2inb -m "Run code discovery:\n1. cd /Users/shaansisodia/SISO_Workspace/SISO_Internal_Lab/codebase\n2. npm run typecheck\n3. npm run lint\n4. npm run test:unit\n\nWrite results to /Users/shaansisodia/SISO_Workspace/SISO_Internal_Lab/codebase/issues/code.json" 2>/dev/null || true

echo "Discovery agents triggered. Check issues/code.json after completion."

# Note: UI and UX discovery would need app running, so run separately
# This script focuses on code discovery which can run anytime

echo "=== Discovery Cycle Complete ==="
