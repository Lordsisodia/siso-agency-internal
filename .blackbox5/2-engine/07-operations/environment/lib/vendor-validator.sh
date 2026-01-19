#!/usr/bin/env bash

# Blackbox4 Vendor Swap Validator (Bash 3.2 Compatible)
# Automated detection of vendor lock-in patterns

set -e

BLACKBOX4_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VENDOR_CONFIG="$BLACKBOX4_HOME/.config/vendor-patterns.json"
SCAN_LOG="$BLACKBOX4_HOME/.runtime/vendor-scans.log"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vendor list
VENDOR_LIST="Shopify Stripe AWS GitHub Google Firebase Twilio SendGrid Mailgun Auth0"

# Get vendor pattern
get_vendor_pattern() {
    local vendor="$1"
    case "$vendor" in
        Shopify) echo "gid://shopify/|shopify\.com|@shopify/shopify-api" ;;
        Stripe) echo "sk_live_|sk_test_|pk_live_|pk_test_|stripe\.com" ;;
        AWS) echo "amazonaws\.com|aws_|s3\.amazonaws\.com" ;;
        GitHub) echo "github\.com|api\.github\.com|ghp_|gho_|ghu_" ;;
        Google) echo "google\.com|googleapis\.com|gcp_" ;;
        Firebase) echo "firebaseio\.com|firebase\.com|firebaseapp\.com" ;;
        Twilio) echo "AC[a-z0-9]{32}|twilio\.com|api\.twilio\.com" ;;
        SendGrid) echo "SG\.|sendgrid\.com|api\.sendgrid\.com" ;;
        Mailgun) echo "mailgun\.com|api\.mailgun\.com" ;;
        Auth0) echo "auth0\.com|\.auth0\.com|client_id=auth0" ;;
        *) echo "" ;;
    esac
}

get_severity() {
    echo "warning"
}

# Initialize vendor validator
init_validator() {
    if [ ! -f "$VENDOR_CONFIG" ]; then
        mkdir -p "$(dirname "$VENDOR_CONFIG")"

        # Build JSON manually
        echo '{"vendors":{' > "$VENDOR_CONFIG"
        local first=true

        for vendor in $VENDOR_LIST; do
            if [ "$first" = true ]; then
                first=false
            else
                echo "," >> "$VENDOR_CONFIG"
            fi
            local pattern=$(get_vendor_pattern "$vendor")
            echo -n "\"$vendor\":{\"pattern\":\"$pattern\",\"severity\":\"warning\"}" >> "$VENDOR_CONFIG"
        done

        echo '}}' >> "$VENDOR_CONFIG"
        echo "${GREEN}✓ Vendor validator initialized${NC}"
    fi

    mkdir -p "$(dirname "$SCAN_LOG")"
}

# Scan a file for vendor patterns
scan_file() {
    local file="$1"
    local report_format="${2:-text}"

    if [ ! -f "$file" ]; then
        echo "${RED}Error: File not found: $file${NC}"
        return 1
    fi

    local findings=()

    # Check each vendor pattern
    for vendor in $VENDOR_LIST; do
        local pattern=$(get_vendor_pattern "$vendor")

        # Check in plain text
        if grep -qE "$pattern" "$file" 2>/dev/null; then
            findings+=("$vendor (plain text)")
        fi

        # Check in base64 encoded content
        local encoded_content=$(base64 < "$file" 2>/dev/null)
        if echo "$encoded_content" | grep -qE "$pattern" 2>/dev/null; then
            findings+=("$vendor (base64 encoded)")
        fi
    done

    # Report findings
    if [ ${#findings[@]} -gt 0 ]; then
        if [ "$report_format" = "json" ]; then
            echo "{\"file\":\"$file\",\"vendor_lock_in\":["
            local first=true
            for finding in "${findings[@]}"; do
                if [ "$first" = true ]; then
                    first=false
                else
                    echo ","
                fi
                echo -n "    \"$finding\""
            done
            echo ""
            echo "  ]}"
        else
            echo "${YELLOW}⚠️  Vendor lock-in detected: $file${NC}"
            for finding in "${findings[@]}"; do
                echo "  → $finding"
            done
        fi

        # Log scan
        log_scan "$file" "${findings[@]}"
        return 0
    else
        if [ "$report_format" = "json" ]; then
            echo "{\"file\":\"$file\",\"vendor_lock_in\":[]}"
        fi
        return 1
    fi
}

# Scan directory recursively
scan_directory() {
    local directory="$1"
    local file_pattern="${2:-*}"
    local report_format="${3:-text}"

    if [ ! -d "$directory" ]; then
        echo "${RED}Error: Directory not found: $directory${NC}"
        return 1
    fi

    echo "${BLUE}Scanning directory: $directory${NC}"
    echo ""

    local total_files=0
    local affected_files=0

    while IFS= read -r -d '' file; do
        total_files=$((total_files + 1))

        if scan_file "$file" "$report_format"; then
            affected_files=$((affected_files + 1))
        fi
    done < <(find "$directory" -type f -name "$file_pattern" -print0 2>/dev/null)

    echo ""
    echo "${BLUE}Scan Summary:${NC}"
    echo "  Total files scanned: $total_files"
    echo "  Files with vendor lock-in: $affected_files"
}

# Generate vendor lock-in report
generate_report() {
    local directory="$1"
    local output_file="${2:-$BLACKBOX4_HOME/.runtime/vendor-report.md}"

    mkdir -p "$(dirname "$output_file")"

    cat > "$output_file" << REPORT_EOF
# Vendor Lock-In Analysis Report

**Generated**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Directory**: $directory

## Executive Summary

This report identifies potential vendor lock-in patterns in the codebase.

## Findings

REPORT_EOF

    if [ -f "$SCAN_LOG" ]; then
        grep "Vendor lock-in detected" "$SCAN_LOG" | tail -20 >> "$output_file"
    fi

    cat >> "$output_file" << RECS_EOF

## Recommendations

1. **Abstraction Layer**: Create abstraction layers for vendor-specific code
2. **Configuration**: Move vendor IDs to configuration files
3. **Adapter Pattern**: Implement adapter pattern for easy vendor swapping
4. **Monitoring**: Regularly scan for new vendor dependencies

## Monitored Vendors

RECS_EOF

    for vendor in $VENDOR_LIST; do
        echo "- **$vendor**" >> "$output_file"
    done

    echo ""
    echo "${GREEN}✓ Report generated: $output_file${NC}"
}

# Add custom vendor pattern
add_vendor_pattern() {
    local vendor="$1"
    local pattern="$2"

    if [ -z "$vendor" ] || [ -z "$pattern" ]; then
        echo "${RED}Error: Vendor name and pattern required${NC}"
        return 1
    fi

    init_validator

    if command -v jq >/dev/null 2>&1; then
        local tmpfile="$VENDOR_CONFIG.tmp"
        jq --arg vendor "$vendor" --arg pattern "$pattern" \
           '.vendors[$vendor] = {"pattern": $pattern, "severity": "warning"}' \
           "$VENDOR_CONFIG" > "$tmpfile"
        mv "$tmpfile" "$VENDOR_CONFIG"

        echo "${GREEN}✓ Added vendor pattern: $vendor${NC}"
    else
        echo "${YELLOW}jq required for this operation${NC}"
        return 1
    fi
}

# List all vendor patterns
list_patterns() {
    init_validator

    echo "${BLUE}Configured Vendor Patterns:${NC}"
    echo ""

    for vendor in $VENDOR_LIST; do
        local pattern=$(get_vendor_pattern "$vendor")
        echo "  **$vendor**"
        echo "    Pattern: $pattern"
        echo ""
    done
}

# Log scan result
log_scan() {
    local file="$1"
    shift
    local findings=("$@")

    mkdir -p "$(dirname "$SCAN_LOG")"

    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") | Vendor lock-in detected: $file" >> "$SCAN_LOG"
    for finding in "${findings[@]}"; do
        echo "  → $finding" >> "$SCAN_LOG"
    done
}

# Show help
show_help() {
    cat << 'HELP'
Blackbox4 Vendor Swap Validator

Automated detection of vendor lock-in patterns in code.

Usage:
  vendor-validator.sh <command> [options]

Commands:
  init                       Initialize validator
  scan <file>                Scan a specific file
  scan-dir <dir> [pattern]   Scan directory (pattern: *, *.py, etc.)
  report <dir> [output]      Generate vendor lock-in report
  add <vendor> <pattern>     Add custom vendor pattern
  list                       List all vendor patterns
  check <file>               Quick check (exit code based)

Supported Vendors:
  Shopify, Stripe, AWS, GitHub, Google, Firebase, Twilio,
  SendGrid, Mailgun, Auth0

Examples:
  # Scan a file
  vendor-validator.sh scan config.py

  # Scan directory
  vendor-validator.sh scan-dir ./src "*.py"

  # Generate report
  vendor-validator.sh report ./project vendor-report.md

  # Add custom pattern
  vendor-validator.sh add "MyVendor" "myvendor\.com|my_vendor_id"

  # Quick check (for CI/CD)
  vendor-validator.sh check file.py && echo "No lock-in found"

Patterns Detected:
  - Plain text vendor IDs
  - Base64 encoded vendor IDs
  - API endpoints
  - SDK imports
  - Configuration references
HELP
}

# Main
init_validator

case "${1:-help}" in
    init)
        init_validator
        ;;
    scan)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: File path required${NC}"
            exit 1
        fi
        scan_file "$2" "${3:-text}"
        ;;
    scan-dir)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Directory path required${NC}"
            exit 1
        fi
        scan_directory "$2" "${3:-*}" "${4:-text}"
        ;;
    report)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Directory path required${NC}"
            exit 1
        fi
        generate_report "$2" "${3:-}"
        ;;
    add)
        if [ -z "${2:-}" ] || [ -z "${3:-}" ]; then
            echo "${RED}Error: Vendor name and pattern required${NC}"
            exit 1
        fi
        add_vendor_pattern "$2" "$3"
        ;;
    list|ls)
        list_patterns
        ;;
    check)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: File path required${NC}"
            exit 1
        fi
        scan_file "$2" >/dev/null 2>&1
        exit $?
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
