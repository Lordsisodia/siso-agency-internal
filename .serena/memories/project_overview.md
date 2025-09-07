# SISO Internal - Project Overview

## Project Purpose
SISO Internal is a comprehensive task management platform with AI assistance and life logging capabilities. It serves as a multi-purpose agency platform that includes:

- **Task Management System** with AI integration
- **Life Log Tracker** for daily activities and progress
- **Client Project Management** with onboarding workflows
- **Partner Dashboard** for affiliate/partnership management
- **Admin Dashboard** for internal operations
- **App Plan Generator** for client project planning

## Key Business Focus
- **Client Onboarding**: Current flow is Onboarding → Mood Board → AI Development → Launch
- **Project Development Reports (PDR)**: Comprehensive client project analysis system
- **Multi-user Support** with role-based access control
- **Real-time Updates** and responsive design
- **AI-powered Features** throughout the platform

## Current Architecture
- React + TypeScript + Vite frontend
- Supabase for database and authentication
- Clerk for additional authentication features
- Tailwind CSS + shadcn/ui for styling
- Framer Motion for animations
- Multiple lazy-loaded routes for performance

## Main User Types
1. **Admin Users**: Full platform access, internal operations
2. **Client Users**: Limited access to their project data
3. **Partner Users**: Affiliate/partnership dashboard access
4. **Team Members**: Task and project management access

## Technology Stack Details
- Frontend: React 18.3.1 + TypeScript 5.5.3
- Build Tool: Vite 5.4.1 with SWC
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth + Clerk
- UI Framework: Tailwind CSS 3.4.11 + shadcn/ui
- Icons: Lucide React 0.474.0
- Animations: Framer Motion 12.23.12
- Forms: React Hook Form 7.53.0 + Zod 3.23.8
- State Management: Jotai 2.12.3
- Charts: Recharts 2.12.7

## Key Integration Points for PDR System
Based on the current OnboardingChat.tsx flow, the platform already:
- Collects company information
- Gathers business descriptions
- Captures website/social media data  
- Performs basic research and app plan generation
- Saves data to both legacy and new app_plans tables

This provides an ideal foundation for integrating the comprehensive PDR methodology.