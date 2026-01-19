#!/usr/bin/env bash

# Pre-tool hook: Inject AGENTS.md context
# Runs when reading files to provide additional context

set -e

FILE="$1"

if [ ! -f "$FILE" ]; then
    exit 0
fi

# Walk up directory tree to find AGENTS.md files
current_dir=$(dirname "$FILE")
context_parts=()

while [ "$current_dir" != "/" ] && [ "$current_dir" != "." ] && [ "$current_dir" != "$HOME" ]; do
    agents_file="$current_dir/AGENTS.md"
    if [ -f "$agents_file" ]; then
        if [ -s "$agents_file" ]; then
            context_parts+=("

--- Context from $current_dir ---
$(cat "$agents_file")
")
        fi
    fi
    current_dir=$(dirname "$current_dir")
done

# Output context if found
if [ ${#context_parts[@]} -gt 0 ]; then
    printf '%s\n' "${context_parts[@]}"
fi

exit 0
