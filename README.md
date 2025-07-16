# Real-Time Sales Leaderboard & Admin Panel

A comprehensive sales tracking and management system designed for call centers with real-time dashboards, team management, and administrative controls.

## Features

- **Real-time Dashboard**: Live sales performance tracking with WebSocket updates
- **Team Management**: Organize agents into teams with custom targets
- **Sales Entry**: Manual and automated sales recording
- **Cash Offers**: Promotional incentives management
- **Media Management**: Company slides and announcements
- **Reporting**: Comprehensive analytics with export capabilities
- **Sound Effects**: Audio notifications for sales events
- **Dark/Light Mode**: Customizable UI themes
- **Currency Support**: Multi-currency formatting options

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + WebSocket
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session management
- **Build Tool**: Vite for frontend, esbuild for backend
- **Deployment**: Vercel ready

## Quick Start

### Local Development

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd sales-leaderboard
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and session secret
   ```

3. **Push database schema**
   ```bash
   npm run db:push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Dashboard: http://localhost:5000
   - Admin Panel: http://localhost:5000/admin-portal

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Set Environment Variables**
   In your Vercel dashboard, add:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: Random secret key for sessions

3. **Deploy**
   ```bash
   vercel --prod
   ```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API client
│   │   └── pages/         # Page components
├── server/                # Express backend
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data access layer
├── shared/               # Shared TypeScript types
│   └── schema.ts         # Database schema and types
├── api/                  # Vercel serverless functions
│   └── index.ts          # Main API handler
├── uploads/              # File uploads directory
└── vercel.json           # Vercel configuration
```

## Database Schema

The application uses PostgreSQL with the following main tables:

- `users`: Admin authentication
- `teams`: Team organization and targets
- `agents`: Individual agent profiles
- `sales`: Sales transaction records
- `cash_offers`: Promotional incentives
- `media_slides`: Company content display
- `announcements`: System notifications
- `news_ticker`: Scrolling news messages
- `sound_effects`: Audio notifications
- `system_settings`: Application configuration

## API Endpoints

### Authentication
- `POST /api/login` - User/Agent login
- `POST /api/logout` - Logout
- `GET /api/user` - Get current user

### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `GET /api/agents` - Get all agents
- `GET /api/teams` - Get all teams
- `GET /api/sales` - Get sales data

### Admin Management
- `POST /api/agents` - Create agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/sales` - Record sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Media & Content
- `GET /api/media-slides` - Get media slides
- `POST /api/media-slides` - Create media slide
- `GET /api/announcements` - Get announcements
- `POST /api/announcements` - Create announcement
- `GET /api/cash-offers` - Get cash offers
- `POST /api/cash-offers` - Create cash offer

### Reports
- `POST /api/reports/generate` - Generate report
- `POST /api/reports/export-csv` - Export CSV
- `POST /api/reports/export-excel` - Export Excel
- `POST /api/reports/export-pdf` - Export PDF

### System
- `GET /api/system-settings` - Get settings
- `PUT /api/system-settings` - Update settings
- `GET /api/sound-effects` - Get sound effects
- `POST /api/sound-effects` - Create sound effect

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Session encryption key | Yes |
| `NODE_ENV` | Environment mode (development/production) | No |

## Deployment Notes

### Vercel Deployment
- WebSocket functionality is limited in serverless environment
- Static file serving is handled by Vercel's CDN
- Database connections use connection pooling
- Environment variables must be set in Vercel dashboard

### Traditional Server Deployment
- Full WebSocket support for real-time updates
- Manual static file serving configuration
- Direct database connections
- Environment variables in `.env` file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details