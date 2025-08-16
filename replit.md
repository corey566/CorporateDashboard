# Real-Time Sales Leaderboard & Admin Panel

## Overview
This is a full-stack web application designed for call centers to display real-time sales performance on large screens. It features a live dashboard with individual agent and team leaderboards, real-time updates via WebSocket, and a comprehensive admin panel for data management. The system aims to provide an engaging and informative visual representation of sales performance, enhancing motivation and operational transparency within call center environments.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Core Functionality & Design
The application provides a Real-Time Sales Leaderboard optimized for large screen display (e.g., 50m TV viewing distance) and a comprehensive Admin Panel. The dashboard features a football-style scoreboard, real-time sale pop-up notifications with sound effects, dynamic active cash offer banners, and a news ticker. The admin panel is a tabbed interface for managing teams, agents, sales, data, and system settings.

### UI/UX Decisions
The TV dashboard is designed with an elegant, professional aesthetic, utilizing Manrope and Inter fonts for readability. It features a clean, minimal card-based layout with subtle shadows, rounded corners, and consistent color-coded progress bars. All font sizes are doubled for optimal TV viewing. The admin panel provides a responsive and professional interface for management. A comprehensive theme system with dark/light mode toggle is implemented across both dashboard and admin panel. Currency customization is available, allowing users to set preferred currency symbols and formatting.

### Technical Implementation
The frontend is built with React 18 and TypeScript, styled using Tailwind CSS with shadcn/ui components. TanStack Query manages server state, and Wouter handles client-side routing. Real-time updates are powered by a WebSocket connection. The backend uses Node.js with Express.js and TypeScript, with PostgreSQL as the database managed by Drizzle ORM. Authentication is handled by Passport.js with session management. 

For production deployment, the system offers dual database options:
1. **MySQL Version (Recommended)**: Full production deployment with MySQL database, PHP API layer, persistent data storage, and multi-user support optimized for XAMPP
2. **localStorage Version**: Standalone browser-based storage requiring zero external dependencies for offline deployments

### Key Features
- **Real-time Performance Display:** Live updates of agent and team performance, sales pop-ups, and daily targets.
- **Dynamic Content:** Active cash offers, scrolling news ticker, and media slide displays.
- **Comprehensive Admin Panel:** CRUD operations for teams, agents, sales, cash offers, media, and announcements.
- **Reporting System:** Detailed sales analytics with date range filtering, agent/team selection, and export functionality (CSV, Excel, PDF).
- **Currency Customization:** Global currency settings for consistent display.
- **Voice Alerts:** Text-to-speech notifications for teams behind schedule.
- **Deployment Flexibility:** Designed for various environments including XAMPP, Vercel, Apache, Nginx, and Docker.

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL (Neon serverless recommended)
- **UI Components**: Radix UI primitives via shadcn/ui
- **Form Handling**: React Hook Form with Zod validation
- **Real-time**: Native WebSocket implementation
- **Session Management**: `connect-pg-simple` for PostgreSQL sessions

### Development Tools
- **Type Safety**: TypeScript
- **Code Quality**: ESLint and Prettier
- **Build Process**: Vite (frontend), esbuild (backend)