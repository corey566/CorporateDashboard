# Real-Time Sales Leaderboard & Admin Panel

## Overview

This is a full-stack web application built for call centers to display real-time sales performance data on large screens or TVs. The system features a live dashboard showing individual agent performance, team leaderboards, and real-time updates through WebSocket connections.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 1, 2025)

✓ Fixed category dropdown in Quick Sales Entry to load all categories dynamically from API
✓ Implemented sale entry sound effects on TV dashboard with immediate WebSocket broadcasting and enhanced error handling
✓ Enhanced team visibility controls with instant enable/disable functionality and real-time WebSocket updates
✓ Added carousel feature to daily targets with 6-second auto-scroll showing 2 teams per page and pause-on-hover
✓ Verified complete system functionality: authentication, real-time WebSocket broadcasting, sound effects, dynamic data loading, and team controls all operational
✓ Fixed all category CRUD operations - create, update, and delete categories working perfectly
✓ Enhanced voice alert system with 15-minute intervals for teams behind schedule during working hours
✓ Added text-to-speech voice notifications with detailed progress announcements
✓ Implemented comprehensive error handling for sound effects with fallback audio support  
✓ Fixed voice alert frequency to announce only once every 15 minutes per team after initial alert time
✓ Resolved category management UI issues by replacing problematic API wrapper with native fetch

✓ Implemented comprehensive theme system with dark/light mode toggle
✓ Enhanced TV dashboard with modern responsive design and proper theme variables
✓ Updated agent cards with consistent theming and improved visual hierarchy
✓ Added theme toggle component with smooth transitions in admin panel header
✓ Enhanced admin panel with responsive layout and proper dark mode support
✓ Updated news ticker with theme-aware styling and consistent color scheme
✓ Added custom scrollbar styling and enhanced hover effects for better UX
✓ Improved component consistency across all UI elements with theme variables
✓ Created comprehensive reporting system with date range filtering and agent/team selection
✓ Added report export functionality supporting CSV, Excel, and PDF formats
✓ Implemented real-time report generation with detailed analytics and performance metrics
✓ Added reports API endpoints with proper authentication and data validation
✓ Enhanced admin panel with reports tab for comprehensive sales analysis
✓ Built data aggregation system for sales by agent, team, and date breakdowns
✓ Implemented comprehensive currency customization system allowing users to set preferred currency symbol, code, and name
✓ Created centralized currency formatting hook for consistent display across all components
✓ Added currency settings to UI customization panel with quick preset selection and custom currency options
✓ Updated all financial displays (sales amounts, targets, cash offers) to use new currency formatting
✓ Enhanced reports, dashboards, and admin panels with dynamic currency support
✓ Resolved cash offer display issue by fixing expiry time handling
✓ Removed duplicate "Active Cash Offers" section from dashboard left panel
✓ Successfully migrated database to new Neon PostgreSQL instance
✓ Updated database connection string and verified all existing data integrity
✓ Created comprehensive Vercel deployment configuration with serverless API structure
✓ Added vercel.json configuration for proper routing and static file serving
✓ Implemented Vercel-compatible API entry point with PostgreSQL session storage
✓ Created deployment documentation with multiple platform options (Vercel, Apache, Nginx, Docker)
✓ Added environment variable configuration and security considerations
✓ Included troubleshooting guide and scaling recommendations for production deployment
✓ Fixed file upload functionality by switching from apiRequest wrapper to native fetch API for multipart form handling
✓ Enhanced currency system with WebSocket broadcasting for immediate updates across all connected clients
✓ Added aggressive cache invalidation and automatic page refresh when currency settings change to ensure propagation
✓ Updated backend export functions to include proper currency formatting in reports (CSV, Excel, PDF)
✓ Implemented comprehensive currency refresh system in both TV dashboard and admin panel components
✓ Added WebSocket currency update handlers to force page refresh and ensure all components show new currency immediately
✓ Fixed WebSocket system_settings_updated handler to make team visibility controls work instantly
✓ Transformed scoreboard from grid layout to football-style table with doubled text sizes
✓ Removed "LIVE SCOREBOARD" header and subtitle for cleaner presentation
✓ Combined Volume/Units columns into single display without progress bars
✓ Removed category column to prevent overcrowding and improve readability
✓ Made Active Cash Offers section visible only when promotions are available
✓ Fixed table alignment issues to prevent overlap with news ticker at bottom
✓ Enhanced scoreboard with larger agent photos and team information display
✓ Removed white space gap between table and news ticker by eliminating padding and adjusting height calculations
✓ Added daily targets table showing calculated daily volume and units targets for each team
✓ Implemented working days calculation excluding weekends for accurate daily target distribution
✓ Restored progress bars to agent scoreboard showing volume and units completion percentages
✓ Enhanced dashboard layout with dedicated right panel for daily targets and team rankings
✓ Implemented dynamic daily target redistribution system that adjusts targets based on remaining working days
✓ Added intelligent target tracking that redistributes unmet targets across remaining days in the month
✓ Created voice alert system with text-to-speech notifications for teams behind schedule
✓ Added customizable working hours and alert time settings for target monitoring
✓ Implemented real-time progress tracking with visual status indicators (ON TRACK / BEHIND)
✓ Added alert history display showing recent target warnings with timestamps

## Latest Database Migration (August 18, 2025)

✓ Successfully migrated application to local PostgreSQL database with full data integrity
✓ Created comprehensive Linux server deployment guide with step-by-step instructions
✓ Fixed all database schema issues including missing category_id column and tables
✓ Enhanced agent and category CRUD operations with flexible validation schemas
✓ Added proper database seed data with categories and admin user creation
✓ Resolved dashboard API errors - now returns 200 status with real agent data
✓ Implemented robust error handling and logging for all database operations
✓ Created production-ready deployment configuration with PM2 and Nginx
✓ Added comprehensive monitoring, backup, and maintenance procedures
✓ Included security recommendations and SSL certificate setup instructions

## Previous UI Enhancement (July 31, 2025)

✓ Completely redesigned TV dashboard with elegant, professional styling inspired by modern table designs
✓ Upgraded to premium Manrope and Inter fonts for enhanced readability and sophistication
✓ Implemented clean, minimal card-based layout with subtle shadows and rounded corners
✓ Enhanced scoreboard table with proper header styling, smaller profile photos, and elegant progress bars
✓ Replaced Aceternity UI animations with refined gradient backgrounds and subtle visual effects
✓ Updated cash offers banner with gradient header and glassmorphism card design
✓ Redesigned WebSocket status indicator with clean pill-shaped design
✓ Enhanced news ticker with gradient news badge and professional typography
✓ Applied consistent color-coded progress bars (green/blue/yellow/red) for visual hierarchy
✓ Doubled all font sizes across the dashboard for 50-meter TV viewing distance readability
✓ Implemented intelligent auto-scrolling system for agent rows when more than 2 agents are present
✓ Added visual auto-scroll indicator with pause-on-hover functionality for manual navigation
✓ Enhanced scoreboard with larger agent names, progress labels, and volume/units data for TV display

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
   - Company slides overlay with auto-trigger functionality

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

5. **Media Slides** (`client/src/components/media-slides.tsx`)
   - Integrated media slides display in dashboard right panel
   - Supports both image and text slide types
   - Auto-advance slideshow with configurable duration
   - No overlay - permanently displayed on dashboard

### Admin Panel Components
**Access Route: `/admin-portal`** (Protected route requiring authentication)
**Note: Admin panel button removed from dashboard - access via direct URL only**

1. **Team Management** - First priority in workflow, create teams before agents
2. **Agent Management** - CRUD operations for sales agents
3. **Sales Entry** - Manual sales recording interface
4. **Cash Offers** - Promotional offers management
5. **Media Management** - Company slides with duration controls (5-60 seconds)
6. **Announcements** - System notifications and news ticker
7. **UI Customization** - Theme colors, typography, accessibility options

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