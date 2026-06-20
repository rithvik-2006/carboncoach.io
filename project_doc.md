# Carbon Coach Platform - Project Documentation

Welcome to the Carbon Coach Platform project documentation. This document serves as the central source of truth for the project's features, architecture, and tech stack. 

> **Note:** Whenever a new feature is added or architectural changes are made, please update this document to keep it current.

## 🌟 Overview
Carbon Coach is a modern, gamified sustainability platform designed to help users track and reduce their carbon footprint. By shifting the focus from tracking raw emissions to celebrating CO₂ saved, Carbon Coach provides real-time feedback, AI-driven insights, and community engagement features to encourage positive environmental impact.

## 🚀 Key Features

### 1. Dashboard (`/dashboard`)
- **Centralized Metrics:** Overview of the user's sustainability progress.
- **Data Visualizations:** Charts and graphs (powered by Recharts) depicting CO₂ savings over time.
- **Activity Summary:** Quick glance at recent logged activities and overall impact.

### 2. Activity Logging (`/log`)
- **Robust Input Interface:** A highly responsive, multi-column interface to log daily activities (e.g., transportation, energy usage, food consumption).
- **Category Management:** Cleaner category object state pattern for structured data entry.
- **Validation & Error Handling:** Real-time feedback for inputs before submission.

### 3. AI Carbon Coach & Scanner (`/coach`)
- **AI-Driven Insights:** Integration with Vercel AI SDK, Google AI, and OpenAI to provide smart recommendations for reducing carbon footprints.
- **Smart Scanning:** AI analysis of user activities to estimate carbon costs and suggest eco-friendly alternatives.

### 4. Community & Global Leaderboard (`/community`)
- **Real-Time Rankings:** Gamified global leaderboard showcasing top savers, powered by Supabase Realtime.
- **Activity Feeds:** Instant, no-refresh updates showing community actions.
- **Achievements & Badges:** Rewards system for hitting sustainability milestones.
- **Timeframe Filtering & Podiums:** Premium UI components showcasing top performers dynamically.

## 🛠 Tech Stack & Architecture

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI Library:** React 19, Tailwind CSS v4, base-ui
- **Components:** Shadcn UI / Radix (for modern, accessible, and premium design components)
- **Styling/Animations:** `tw-animate-css`, `clsx`, `tailwind-merge`
- **Charts:** Recharts

### Backend (Supabase)
- **Authentication:** Supabase SSR Auth
- **Database:** PostgreSQL (via Supabase) with real-time subscriptions
- **Storage:** Supabase Storage (for avatars, media, etc.)
- **Schemas & Constraints:** Enforced data integrity for user activities and leaderboards.

### AI Integration
- **Vercel AI SDK:** Core orchestration for AI features (`ai` package).
- **Providers:** `@ai-sdk/google`, `@ai-sdk/openai`, and `ai-sdk-ollama`.

### Infrastructure & Tooling
- **Linting & Formatting:** ESLint
- **Package Management:** pnpm

## 📂 Directory Structure (Key Areas)
- `/app/(app)/dashboard`: User sustainability dashboard
- `/app/(app)/log`: Activity logging interface
- `/app/(app)/coach`: AI assistant and scanner interface
- `/app/(app)/community`: Leaderboards and social feeds
- `/components`: Reusable UI components (Shadcn)
- `/lib`: Utility functions, database clients, and shared logic

## 📝 Updating this Document
When contributing to this project, please ensure any new modules, major dependency additions, or feature implementations are documented here under the corresponding sections.
