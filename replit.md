# Real-Time Sales Leaderboard & Admin Panel

## Overview

This is a full-stack web application built for call centers to display real-time sales performance data on large screens or TVs. The system features a live dashboard showing individual agent performance, team leaderboards, and real-time updates through WebSocket connections.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Real-time Updates**: WebSocket connection for live data
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM for database operations
- **Authentication**: Passport.js with local strategy and session management
- **Real-time**: WebSocket server for live updates
- **Session Storage**: PostgreSQL-based session store

## Key Components

### Dashboard Components
1. **TV Dashboard** (`client/src/components/tv-dashboard.tsx`)
   - Main display component optimized for large screens
   - Shows agent cards, team leaderboard, and media slides
   - Handles real-time updates and sale popups

2. **Agent Cards** (`client/src/components/agent-card.tsx`)
   - Individual agent performance display
   - Progress bars for volume and units targets
   - Photo, name, team, and category information

3. **Team Leaderboard** (`client/src/components/team-leaderboard.tsx`)
   - Ranked team performance display
   - Calculated based on combined agent performance
   - Real-time ranking updates

4. **Sale Popup** (`client/src/components/sale-popup.tsx`)
   - Animated congratulatory notifications
   - Displays when sales are recorded
   - Auto-dismisses after 5 seconds

### Admin Panel Components
1. **Agent Management** - CRUD operations for sales agents
2. **Sales Entry** - Manual sales recording interface
3. **Cash Offers** - Promotional offers management
4. **Media Management** - Company slides and updates
5. **Announcements** - System notifications and news ticker

### Database Schema
- **users**: Admin authentication
- **teams**: Team organization and targets
- **agents**: Individual agent profiles and targets
- **sales**: Sales transaction records
- **cashOffers**: Promotional incentives
- **mediaSlides**: Company content display
- **announcements**: System notifications
- **newsTicker**: Scrolling news messages

## Data Flow

1. **Real-time Updates**: WebSocket connection broadcasts changes to all connected clients
2. **Data Fetching**: TanStack Query manages server state with automatic refetching
3. **Authentication**: Session-based auth with PostgreSQL session store
4. **Database Operations**: Drizzle ORM handles all database interactions
5. **Client Updates**: React components automatically re-render on data changes

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **UI Components**: Radix UI primitives via shadcn/ui
- **Form Handling**: React Hook Form with Zod validation
- **Real-time**: Native WebSocket implementation
- **Session Management**: connect-pg-simple for PostgreSQL sessions

### Development Tools
- **Type Safety**: TypeScript throughout the stack
- **Code Quality**: ESLint and Prettier configuration
- **Build Process**: Vite for frontend, esbuild for backend
- **Development**: Hot reloading and error overlays

## Deployment Strategy

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: esbuild bundles server code with external dependencies
- Database: Drizzle migrations for schema management

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Session encryption key
- **NODE_ENV**: Environment mode (development/production)

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database (Neon serverless recommended)
- WebSocket support for real-time features
- Static file serving for frontend assets

The application is designed to be displayed on large screens or smart TVs via web browser, with a responsive admin panel accessible on desktop devices for management tasks.