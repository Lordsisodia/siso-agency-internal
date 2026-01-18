# 01. Overview

**START HERE** - New to SISO Internal? Begin with these documents.

## Purpose

This section provides the essential documentation for understanding what SISO Internal is and how to get started quickly. If you're new to the project, start here before diving into architecture or implementation details.

## Contents

### 00. [Project Overview](./00-project-overview.md)
**READ THIS FIRST** - High-level introduction to SISO Internal, its features, and technical stack.

### 01. [Quick Start](./01-quick-start/)
Get up and running quickly with setup instructions, environment configuration, and your first deployment.

## What is SISO Internal?

SISO Internal is a revolutionary task management and productivity platform featuring:

- **LifeLock Dashboard** - Advanced productivity management system
- **AI-Powered Task Management** - Intelligent task prioritization and automation
- **Ecosystem Integration** - Internal tools and partnership management
- **Multi-Provider Authentication** - Clerk integration with Supabase fallback
- **Real-time Updates** - Live synchronization and notifications
- **Responsive Design** - Optimized for all devices

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Clerk (primary) + Supabase Auth (fallback)
- **Routing**: React Router with lazy loading (80+ routes)
- **State Management**: React Context + hooks (no Redux)
- **Deployment**: Vercel with automatic deployments

## Next Steps

After reading the project overview:

1. **For Development** → See [05. Development](../05-development/)
2. **For Architecture** → See [02. Architecture](../02-architecture/)
3. **For Features** → See [03. Product](../03-product/)
4. **For Integrations** → See [04. Integrations](../04-integrations/)
