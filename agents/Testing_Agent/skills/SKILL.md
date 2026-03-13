# Testing Agent Skills

## Test Pages

Test all key pages in SISO Internal.

### Usage
```bash
# Install Playwright CLI if not installed
npm install -g @playwright/cli@latest

# Test pages
playwright open https://siso-internal.vercel.app/admin/lifelock/daily
playwright snapshot
playwright screenshot /tmp/siso-test-daily-$(date +%s).png
playwright console
playwright close
```

### Pages to Test
- `https://siso-internal.vercel.app/admin/lifelock/daily`
- `https://siso-internal.vercel.app/admin/lifelock/weekly`
- `https://siso-internal.vercel.app/admin/lifelock/stats`
- `https://siso-internal.vercel.app/admin/tasks`

## Test Flows

### Login Flow
1. Open app
2. Take screenshot
3. Click login
4. Take screenshot
5. Check console

### Create Task Flow
1. Navigate to tasks
2. Click "Add Task"
3. Fill form
4. Submit
5. Verify appears

## Run All Tests

```bash
# Create test script in workspace/
cat > /Users/shaansisodia/SISO_Workspace/SISO_Internal_Lab/agents/Testing_Agent/workspace/run-tests.sh << 'EOF'
#!/bin/bash
BASE_URL="https://siso-internal.vercel.app"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTPUT_DIR="/tmp/siso-tests-$TIMESTAMP"
mkdir -p "$OUTPUT_DIR"

pages=(
  "/admin/lifelock/daily"
  "/admin/lifelock/weekly"
  "/admin/lifelock/stats"
  "/admin/tasks"
)

for page in "${pages[@]}"; do
  echo "Testing $page..."
  playwright open "$BASE_URL$page"
  sleep 2
  playwright snapshot
  playwright screenshot "$OUTPUT_DIR$(basename $page).png"
  playwright console
  playwright close
done

echo "Tests complete. Results in $OUTPUT_DIR"
EOF
chmod +x /Users/shaansisodia/SISO_Workspace/SISO_Internal_Lab/agents/Testing_Agent/workspace/run-tests.sh
```
