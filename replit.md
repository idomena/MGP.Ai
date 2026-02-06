# MGP.AI - Fitness & Nutrition Application

## Overview

MGP.AI is an AI-powered fitness and nutrition mobile web application that offers personalized fitness coaching, workout tracking, nutrition scanning via OCR, and an AI assistant. Built with React, TypeScript, and Vite, it aims to provide a comprehensive health and wellness platform with a dark-themed, mobile-first design featuring glassmorphism UI elements. The application generates a database-driven 21-day personalized workout plan based on user onboarding preferences and allows for real-time updates and customization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite.
- **Styling**: Tailwind CSS with custom dark theme design tokens and gradients.
- **UI Components**: shadcn/ui library built on Radix UI primitives.
- **State Management**: React Query for server state, React Context for authentication (including Google OAuth).
- **Routing**: React Router DOM with protected and public route handling.
- **Animation**: Framer Motion for transitions and micro-interactions.
- **Key Features**: Conversational onboarding chat, iPhone-optimized workout page, muscle anatomy diagrams, workout customization (change type, swap exercises), AI scheduling assistant, redesigned journey path visualization, real-time progress updates, enhanced workout session UI with rest timers and completion animations, and in-app + browser notification system.
- **Notifications**: In-app notification center (bell icon in header with unread badge), browser push notifications (Notification API), localStorage-backed per-user notification history (max 50). Triggers: workout completion (encouraging messages), daily workout reminder (after 2 PM if not done), streak alerts (3+ days), milestone alerts (5/10/15/20 workouts). NotificationManager component handles all trigger logic with deduplication.
- **Performance**: Route-level code splitting via React.lazy/Suspense, LazyGif component with IntersectionObserver for exercise GIF loading, two-layer loading screen (HTML pre-loader + React LoadingScreen).
- **Pages**: Privacy Policy (`/privacy-policy`), Terms of Service (`/terms`) — public routes, no auth required.
- **Accessibility**: ARIA labels, visible focus states, semantic HTML, and screen reader support.

### Backend Architecture
- **Server**: Express.js with TypeScript running on port 3001.
- **API Endpoints**:
    - `POST /api/generate`: General AI content.
    - `POST /api/ai-coach`: Fitness coaching.
    - `POST /api/ocr-extract`: Image text extraction for nutrition labels.
    - `GET /api/health`: Health check.
- **AI Integration**: Google Gemini API (`@google/genai SDK`, `gemini-2.5-flash` model).
- **Validation**: Zod schemas for request/response validation.
- **Security**: Helmet for HTTP headers, rate limiting on AI and OCR endpoints.
- **Error Handling**: Centralized error handling and standardized response utilities.
- **Logging**: Request logging with timestamp, method, URL, status, and duration.

### Data Layer
- **Authentication**: Supabase Auth with email/password and Google OAuth, integrated with React Context for session management. Features protected routes, email verification, and password requirements.
- **Database**: Supabase for PostgreSQL, utilized via Drizzle ORM.
- **Schema**: `user_preferences`, `user_programs`, and `workout_completions` tables for storing user data and workout plans.
- **Workout Status Tracking**: Three states — `not_started`, `completed`, `skipped`. Status derived from `completed` boolean + `completed_at` timestamp (completed=true + completed_at=null means skipped). Date-based progression: active day determined by today's calendar date, not first uncompleted day. Completing today's workout does NOT unlock tomorrow — tomorrow unlocks only when the date changes. Auto-skip marks past incomplete workouts as skipped and past rest days as completed on app load. Rest days are not auto-completed during the day.
- **Real-time Integration**: Supabase realtime subscriptions for `workout_completions` to update UI dynamically.
- **Exercise Data**: Can fetch exercises from an `exercises_templates` table in Supabase or fallback to local data.

### Workout Types (Individual Muscle Groups)
Users can select individual muscle groups and combine them however they like:
- **chest**: Chest - 35 min, 5 exercises
- **back**: Back - 35 min, 5 exercises
- **shoulders**: Shoulders - 30 min, 4 exercises
- **arms**: Arms (Biceps & Triceps) - 35 min, 5 exercises
- **legs**: Legs - 40 min, 5 exercises
- **core**: Core - 25 min, 4 exercises
- **chest_shoulders**: Chest + Shoulders - 45 min, 6 exercises
- **back_arms**: Back + Arms - 45 min, 6 exercises
- **chest_back**: Chest + Back - 45 min, 6 exercises
- **shoulders_arms**: Shoulders + Arms - 40 min, 6 exercises
- **legs_core**: Legs + Core - 45 min, 6 exercises
- **cardio**: Cardio/HIIT - 30 min, 4 exercises
- **full**: Full Body - 45 min, 6 exercises
- **rest**: Rest Day

### Development Setup
- **Concurrent Servers**: Frontend (Vite on port 5000) and backend (Express on port 3001) run simultaneously via `npm run dev`.
- **API Proxy**: Vite proxies `/api` requests to the backend.

## External Dependencies

### Third-Party Services
- **Google Gemini AI**: Provides AI capabilities for coaching, content generation, and OCR.
- **Supabase**: Used for authentication, real-time database, and potentially hosting exercise templates.

### Key NPM Packages
- `@google/genai`: Google Gemini API client.
- `@supabase/supabase-js`: Supabase client library.
- `@tanstack/react-query`: For server state management and caching.
- `drizzle-orm` and `pg`: PostgreSQL ORM and driver.
- `express`, `cors`, `helmet`: Backend server, CORS, and security middleware.
- `zod`: Schema validation library.
- `framer-motion`: Animation library.
- `react-day-picker`: Calendar component.
- `vaul`: Drawer component.
- `embla-carousel-react`: Carousel functionality.

### Environment Variables Required
- `GEMINI_KEY_API` or `GEMINI_API_KEY`: For Google Gemini API access.
- `DATABASE_URL`: PostgreSQL connection string.
- Supabase credentials (for authentication client).