#!/bin/bash

# Get Clerk test session token using Backend API
# This creates a session that can be used in Chrome MCP or Playwright

CLERK_SECRET_KEY="sk_test_MbkLIddYHkWJbQ5pj3qKMtRNOutRKYb7xzf0rhSX5I"
CLERK_API_BASE="https://api.clerk.com/v1"

echo "=== Creating Clerk Test Session ==="
echo ""

# Try to create a test user and get a token
curl -X POST "$CLERK_API_BASE/users" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email_address": ["test@blackbox4.dev"],
    "password": "TestPassword123!",
    "first_name": "Test",
    "last_name": "User"
  }' 2>/dev/null | jq .

echo ""
echo "If user already exists, try getting their sessions..."
echo ""

# You can use the Clerk Dashboard to get a test token:
# https://dashboard.clerk.com/apps/.../develop/users

echo "=== Alternative: Use Clerk Dashboard ==="
echo "1. Go to: https://dashboard.clerk.com"
echo "2. Find your app (fleet-pony-31)"
echo "3. Go to Users"
echo "4. Click on a user"
echo "5. Copy their session token"
echo ""
echo "Then use in Chrome/Playwright:"
echo 'document.cookie="__session=YOUR_TOKEN_HERE; path=/"'
