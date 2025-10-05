#!/bin/bash

echo "💾 Quickly restoring all .ts files from deleted features..."

# Restore all features/tasks .ts files
for file in $(git ls-files --deleted | grep "src/features/tasks/.*\.ts$"); do
    target=$(echo "$file" | sed 's|src/features/tasks/|src/ecosystem/internal/tasks/|')
    mkdir -p "$(dirname "$target")"
    git show "HEAD:$file" > "$target" 2>/dev/null && echo "✅ $(basename $file)"
done

# Restore all features/admin .ts files
for file in $(git ls-files --deleted | grep "src/features/admin/.*\.ts$"); do
    target=$(echo "$file" | sed 's|src/features/admin/|src/ecosystem/internal/admin/|')
    mkdir -p "$(dirname "$target")"
    git show "HEAD:$file" > "$target" 2>/dev/null && echo "✅ $(basename $file)"
done

# Restore all features/lifelock .ts files  
for file in $(git ls-files --deleted | grep "src/features/lifelock/.*\.ts$"); do
    target=$(echo "$file" | sed 's|src/features/lifelock/|src/ecosystem/internal/lifelock/|')
    mkdir -p "$(dirname "$target")"
    git show "HEAD:$file" > "$target" 2>/dev/null && echo "✅ $(basename $file)"
done

echo ""
echo "All .ts files restored"

