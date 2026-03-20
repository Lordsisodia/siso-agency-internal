#!/bin/bash
# Add manual issue to the pipeline
# Usage: ./add-issue.sh "Title" "description" severity

FILE="codebase/issues/manual.json"
TITLE="$1"
DESC="$2"
SEVERITY="${3:-major}"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ID="manual-$(date +%s)"

# Create issue JSON
ISSUE=$(cat <<EOF
{
  "id": "$ID",
  "title": "$TITLE",
  "category": "manual",
  "type": "manual-test",
  "location": "manual",
  "description": "$DESC",
  "severity": "$SEVERITY",
  "effort": "unknown",
  "regression": false,
  "user_impact": "unknown",
  "suggested_fix": "Needs investigation",
  "related_issues": []
}
EOF
)

echo "Adding issue: $TITLE"

# Add to manual.json (simple append to array)
node -e "
const fs = require('fs');
const file = '$FILE';
let data = JSON.parse(fs.readFileSync(file, 'utf8'));
data.issues.push($ISSUE);
data.timestamp = '$TIMESTAMP';
fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Added: $ID');
"
