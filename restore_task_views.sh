#!/bin/bash

echo "💾 Restoring task view components..."

mkdir -p src/ecosystem/internal/tasks/views

# Restore all view files
for file in $(git ls-files --deleted | grep "src/features/tasks/views/.*\.tsx"); do
    filename=$(basename "$file")
    git show "HEAD:$file" > "src/ecosystem/internal/tasks/views/$filename" 2>/dev/null && echo "✅ $filename"
done

echo "Done"

