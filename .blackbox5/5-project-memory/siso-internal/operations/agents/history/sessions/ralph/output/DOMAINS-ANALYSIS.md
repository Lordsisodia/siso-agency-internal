# Explore and document all domains in src/domains/

**Analyzed by:** Ralph Runtime
**Date:** 2026-01-18 14:49:17

## Analysis: src/domains

### Directory Structure

```
total 16
drwxr-xr-x@ 13 shaansisodia  staff   416 18 Jan 12:25 .
drwxr-xr-x@ 13 shaansisodia  staff   416 18 Jan 12:21 ..
drwxr-xr-x@ 11 shaansisodia  staff   352 18 Jan 12:23 admin
drwxr-xr-x@ 19 shaansisodia  staff   608 18 Jan 12:06 analytics
drwxr-xr-x@ 42 shaansisodia  staff  1344 18 Jan 12:06 clients
drwxr-xr-x@ 21 shaansisodia  staff   672 18 Jan 12:06 financials
drwxr-xr-x@ 12 shaansisodia  staff   384 18 Jan 12:06 lifelock
drwxr-xr-x@  7 shaansisodia  staff   224 18 Jan 11:46 partners
drwxr-xr-x@ 19 shaansisodia  staff   608 18 Jan 12:23 projects
-rw-r--r--@  1 shaansisodia  staff  5553 18 Jan 12:25 README.md
drwxr-xr-x@  6 shaansisodia  staff   192 18 Jan 12:22 resources
drwxr-xr-x@ 16 shaansisodia  staff   512 18 Jan 12:24 tasks
drwxr-xr-x@  3 shaansisodia  staff    96 18 Jan 11:59 xp-store

```

### File Statistics

- Python files: 0
- TypeScript files: 232
- TSX files: 882
- JSON files: 0
- Markdown files: 47

### Documentation Files (24 found)

#### README.md

# Domains

This workspace groups product logic by **domains** (features/verticals). Each domain is self-contained with its own components, pages, hooks, services, and types.

## Domain Structure

Domains follow one of two organizational patterns:

### Numbered Flow Pattern
Used for domains with clea...

#### tasks/README.md

# Tasks Domain

Unified task management system with specialized features for different work types.

## Structure

```
tasks/
├── features/
│   ├── task-management/  # Core task CRUD and management
│   │   ├── ui/
│   │   │   ├── pages/    # Task management pages
│   │   │   └── components/ # Task CR...

#### projects/README.md

# Projects Domain

Project management, wireframes, app plans, and development workflow.

## Structure

```
projects/
├── 1-discover/       # Discover and browse projects
│   └── ui/
│       ├── pages/    # Project discovery pages
│       └── components/ # Project browsing components
├── 2-plan/     ...

### Main Components (10 found)

- **admin/**
- **analytics/**
- **clients/**
- **financials/**
- **lifelock/**
- **partners/**
- **projects/**
- **resources/**
- **tasks/**
- **xp-store/**

### Sample TypeScript/React Files

- admin/1-overview/ui/components/AdminStats.tsx
- admin/1-overview/ui/components/DashboardKPI.tsx
- admin/1-overview/ui/components/QuickActions.tsx
- admin/1-overview/ui/components/WelcomeBanner.tsx
- admin/1-overview/ui/pages/AdminClients.tsx
- admin/1-overview/ui/pages/AdminDailyPlanner.tsx
- admin/1-overview/ui/pages/AdminDashboard.tsx
- admin/1-overview/ui/pages/AdminLifeLock.tsx
- admin/1-overview/ui/pages/AdminLifeLockDay.tsx
- admin/1-overview/ui/pages/AdminLifeLockOverview.tsx
... and 1104 more

### Summary

The directory `src/domains` contains 0 Python files, 1114 TypeScript files, and 10 main components.

