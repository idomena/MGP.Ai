# MGP.AI - Fitness & Nutrition Application

## Overview

MGP.AI is an AI-powered fitness and nutrition mobile web application built with React, TypeScript, and Vite. The app provides personalized fitness coaching, workout tracking, nutrition scanning via OCR, and an AI assistant powered by Google Gemini. It features a dark-themed mobile-first design with glassmorphism UI elements.

## Recent Changes

### January 2026 - Strict Database-Driven Progress System
- **user_progress Table**: Tracks current_day, workouts_completed, streak, xp per user (auto-created on login)
- **exercise_templates Table**: Stores workout templates with day_number, title, workout_type
- **Strict State Model**: Only 3 states for circles: completed/active/locked (no more past/preview)
- **Single Source of Truth**: useWorkoutProgress hook is the only data source for all components
- **XP System**: 50 XP per completed workout
- **21-Day Program**: TOTAL_PROGRAM_DAYS constant set to 21 for journey visualization
- **completeWorkout Updates**: Updates both workout_completions and user_progress tables

### January 2026 - Real-time Supabase Integration
- **useWorkoutProgress Hook**: Custom hook that fetches and manages workout data from Supabase
- **Real-time Subscriptions**: Listens for `workout_completions` table changes via Supabase realtime
- **Graceful Fallback**: Handles missing Supabase tables without crashing the app (uses default workout rotation)

### January 2026 - Authentication System
- **Supabase Auth Integration**: Full authentication using Supabase Auth with email/password
- **Auth Pages**: Login (/login), Signup (/signup), Reset Password (/reset-password)
- **Protected Routes**: All app routes require authentication, redirects to login if not authenticated
- **AuthContext**: React Context API with Supabase session management, auto-refresh tokens
- **Password Requirements**: Minimum 8 characters, 1 uppercase letter, 1 number
- **Email Verification**: Users receive verification email on signup
- **Logout**: Log out button on Profile page with session cleanup

### January 2026 - UI/UX Polish Update
- **Journey Path Redesign**: Infinite S-curve visualization with dynamic path segments, 3 node states (completed/today/upcoming), auto-scroll to today. All nodes are now clickable to view workout details.
- **Workout Viewing Permissions**: Users can VIEW any workout (past/today/future) but can only START today's workout. Status badges show: Completed (green), TODAY (purple pulsing), Coming Soon (gray), Missed (orange for past uncompleted)
- **Exercise Details Modal**: View-only modal for exercise info on past/future workouts with GIF, sets, reps, instructions
- **Workout Session Enhancement**: Rest timer with 90s countdown, circular progress ring, skip rest option, celebration animation on completion
- **Navigation Bar Polish**: Gradient purple-blue-cyan background with rounded top corners, center floating chat button with glow effect
- **Profile Page Redesign**: Gradient header with avatar, streak badge, stats cards (workouts/streak/XP), achievements section, settings menu
- **Stats Display**: Infinity symbol for workouts (16/∞), fire emoji streak, lightning XP

### Earlier January 2026
- **Accessibility Improvements**: Added ARIA labels, roles, focus states, and semantic HTML across all pages
- **Scrolling Enhancement**: All pages now have `overflow-y-auto` with `pb-24` for proper scrolling
- **Workout List Redesign**: New gradient exercise cards, MGP-AI header, custom bottom navigation bar
- **AI Assistant Integration**: Context-aware AI help on workout pages via headphones icon
- **ExerciseAIAssistant**: AI chat during active workout sessions (Sparkles button)
- **WorkoutAIAssistant**: AI chat on workout list page with full workout context

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Styling**: Tailwind CSS with custom design tokens (dark theme with purple/blue accent gradients)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **State Management**: React Query for server state, React Context for auth state
- **Routing**: React Router DOM with protected and public route handling
- **Animation**: Framer Motion for transitions and micro-interactions

### Backend Architecture
- **Server**: Express.js running on port 3001 with TypeScript (tsx for execution)
- **API Endpoints**:
  - `POST /api/generate` - General AI content generation (prompt, systemPrompt)
  - `POST /api/ai-coach` - Fitness coaching responses (message)
  - `POST /api/ocr-extract` - Image text extraction for nutrition labels (image base64, mimeType)
  - `GET /api/health` - Health check endpoint
- **AI Integration**: Google Gemini API (@google/genai SDK, gemini-2.5-flash model) for all AI features
- **Validation**: Zod schemas in shared/schema.ts for request/response validation
- **Key Files**: server/index.ts (entry), server/routes.ts (endpoints), server/gemini.ts (AI functions)

### Data Layer
- **Authentication**: Mock user system (AuthContext provides demo-user-001) - no login required
- **Database**: Drizzle ORM configured for PostgreSQL (requires DATABASE_URL)
- **Schema Location**: `shared/schema.ts` for API contracts, `server/db.ts` for database connection

### Accessibility Features
- **ARIA Labels**: All interactive elements have descriptive labels
- **Focus States**: Visible focus rings (`focus:ring-2 focus:ring-[#7c57ff]`) on all controls
- **Semantic HTML**: Proper use of header, nav, section, article, and main elements
- **Screen Reader Support**: sr-only classes and aria-hidden for decorative elements
- **Tab Panel Pattern**: Proper tablist/tabpanel structure on tabbed interfaces

### Development Setup
- **Concurrent Servers**: Frontend (Vite on port 5000) and backend (Express on port 3001) run simultaneously
- **API Proxy**: Vite proxies `/api` requests to the backend server
- **Run Command**: `npm run dev` starts both servers via concurrently

### Key Design Patterns
- Protected routes redirect unauthenticated users to `/auth`
- API calls use fetch with JSON payloads through `src/lib/api.ts` helper functions
- Environment secrets: `GEMINI_API_KEY` or `GEMINI_KEY_API` for AI features, `DATABASE_URL` for database

## External Dependencies

### Third-Party Services
- **Google Gemini AI**: Powers the AI coach, content generation, and OCR text extraction
- **Supabase**: Provides authentication and database services (configured via `@/integrations/supabase/client`)

### Key NPM Packages
- `@google/genai` - Google Gemini API client
- `@supabase/supabase-js` - Supabase client for auth and database
- `@tanstack/react-query` - Data fetching and caching
- `drizzle-orm` with `pg` - PostgreSQL ORM and driver
- `express` with `cors` - Backend API server
- `zod` - Runtime type validation
- `framer-motion` - Animation library
- `react-day-picker` - Calendar component
- `vaul` - Drawer component
- `embla-carousel-react` - Carousel functionality

### Environment Variables Required
- `GEMINI_KEY_API` or `GEMINI_API_KEY` - Google AI API key (used by server/gemini.ts)
- `DATABASE_URL` - PostgreSQL connection string
- Supabase credentials (configured in integration files for auth only)