# Reviews

This directory stores periodic reviews (every ~100 steps).

Reviews extract patterns and insights from compactions to improve agent performance.

## Review Structure

Each review covers 10 compactions (~100 steps) and includes:
1. Patterns that improve agent performance
2. What data is durable for future runs
3. Cleanup actions
4. References to compactions reviewed

## Automatic Creation

Reviews are automatically created by compact-context.sh every 10 compactions.

