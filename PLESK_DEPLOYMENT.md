# Plesk Server Deployment Guide with MySQL

## Prerequisites

- **Plesk Panel**: Version 18.0.30+ (Obsidian or newer)
- **Node.js**: Version 18+ (install via Plesk Extensions)
- **MySQL**: 8.0+ (usually pre-installed with Plesk)
- **Domain**: Configured in Plesk with hosting enabled

## Step 1: Install Node.js Extension

1. Login to Plesk Panel
2. Go to **Extensions** → **Extensions Catalog**
3. Search for "Node.js" and install the **Node.js Support** extension
4. After installation, go to **Extensions** → **My Extensions** → **Node.js**

## Step 2: Create Domain/Subdomain

1. In Plesk, go to **Websites & Domains**
2. Either use existing domain or create subdomain:
   - Click **Add Subdomain** (e.g., `dashboard.yourdomain.com`)
   - Or use main domain with subfolder setup

## Step 3: Enable Node.js for Domain

1. Go to **Websites & Domains** → Select your domain
2. Click **Node.js** in the hosting settings
3. **Enable Node.js support**
4. Set **Node.js version**: 18.x or higher
5. Set **Document root**: `/httpdocs` (default)
6. Set **Application root**: `/` (or `/dashboard` if using subfolder)
7. Set **Application startup file**: `server/index.js`
8. Click **Enable Node.js**

## Step 4: MySQL Database Setup

### Via Plesk Panel:
1. Go to **Websites & Domains** → **Databases**
2. Click **Add Database**
3. Configure:
   - **Database name**: `sales_dashboard`
   - **Database user**: Create new user (e.g., `dashboard_user`)
   - **Password**: Generate strong password
   - **Charset**: `utf8mb4`
4. Click **OK**

### Via phpMyAdmin:
1. Go to **Websites & Domains** → **Databases** → **phpMyAdmin**
2. Create database: `sales_dashboard`
3. Create user with all privileges on the database

## Step 5: Upload Application Files

### Option A: File Manager
1. Go to **Files** in Plesk
2. Navigate to domain's **httpdocs** folder
3. Upload all project files or extract from ZIP

### Option B: Git Repository
1. Go to **Git** in Plesk (if Git extension is installed)
2. Clone your repository
3. Set up automatic deployment

### Option C: FTP/SFTP
Use your preferred FTP client with Plesk credentials

## Step 6: Project Structure in Plesk

```
/httpdocs/
├── server/
│   ├── index.js (main entry point)
│   ├── db.js
│   ├── routes.js
│   └── storage.ts
├── client/
│   └── [React files]
├── shared/
│   └── schema.ts
├── package.json
├── .env
└── [other project files]
```

## Step 7: Install Dependencies

1. Go to **Node.js** settings for your domain
2. In **Package.json management**:
   - Click **NPM install** or **Run script**
3. Or use **Terminal** (if available):
   ```bash
   cd /var/www/vhosts/yourdomain.com/httpdocs
   npm install
   ```

## Step 8: Environment Configuration

Create `.env` file in the root directory:

```env
NODE_ENV=production
DATABASE_URL=mysql://dashboard_user:YOUR_PASSWORD@localhost:3306/sales_dashboard
SESSION_SECRET=your_very_long_random_session_secret_here

# MySQL specific settings
DB_HOST=localhost
DB_PORT=3306
DB_USER=dashboard_user
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=sales_dashboard

# For MySQL compatibility
MYSQL_SSL=false
```

## Step 9: Database Schema Adaptation

Since we're switching from PostgreSQL to MySQL, we need to modify the database configuration:

### Create `server/mysql-db.js`:

```javascript
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../shared/mysql-schema.js';

if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  throw new Error(
    "DATABASE_URL or DB_HOST must be set. Check your .env file.",
  );
}

let connection;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL format: mysql://user:pass@host:port/database
  connection = await mysql.createConnection(process.env.DATABASE_URL);
} else {
  // Use individual connection parameters
  connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.MYSQL_SSL === 'true' ? {} : false
  });
}

export const db = drizzle(connection, { schema, mode: 'default' });
export { connection };
```

### Create `shared/mysql-schema.js`:

```javascript
import { 
  mysqlTable, 
  serial, 
  varchar, 
  text, 
  boolean, 
  timestamp, 
  decimal, 
  int,
  json
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

// Users table
export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Categories table
export const categories = mysqlTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  color: varchar('color', { length: 7 }).notNull().default('#3B82F6'),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Teams table
export const teams = mysqlTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  color: varchar('color', { length: 7 }).notNull().default('#3B82F6'),
  volumeTarget: decimal('volume_target', { precision: 15, scale: 2 }).notNull().default('0'),
  unitsTarget: int('units_target').notNull().default(0),
  targetCycle: varchar('target_cycle', { length: 50 }).notNull().default('monthly'),
  resetDay: int('reset_day').notNull().default(1),
  resetMonth: int('reset_month').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  isVisible: boolean('is_visible').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Agents table
export const agents = mysqlTable('agents', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  photo: text('photo'),
  teamId: int('team_id').references(() => teams.id),
  categoryId: int('category_id').references(() => categories.id),
  category: varchar('category', { length: 255 }),
  volumeTarget: decimal('volume_target', { precision: 15, scale: 2 }).notNull().default('0'),
  unitsTarget: int('units_target').notNull().default(0),
  targetCycle: varchar('target_cycle', { length: 50 }).notNull().default('monthly'),
  resetDay: int('reset_day').notNull().default(1),
  resetMonth: int('reset_month').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  username: varchar('username', { length: 255 }),
  password: varchar('password', { length: 255 }),
  canSelfReport: boolean('can_self_report').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Sales table
export const sales = mysqlTable('sales', {
  id: serial('id').primaryKey(),
  agentId: int('agent_id').notNull().references(() => agents.id),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  category: varchar('category', { length: 255 }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Cash offers table
export const cashOffers = mysqlTable('cash_offers', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  expiryTime: timestamp('expiry_time').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Other tables...
export const announcements = mysqlTable('announcements', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull().default('info'),
  isActive: boolean('is_active').notNull().default(true),
  expiryTime: timestamp('expiry_time'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const newsTicker = mysqlTable('news_ticker', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const mediaSlides = mysqlTable('media_slides', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }),
  type: varchar('type', { length: 50 }).notNull(),
  content: text('content').notNull(),
  duration: int('duration').notNull().default(10),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const systemSettings = mysqlTable('system_settings', {
  id: serial('id').primaryKey(),
  settingKey: varchar('setting_key', { length: 255 }).notNull().unique(),
  settingValue: json('setting_value'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const soundEffects = mysqlTable('sound_effects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  event: varchar('event', { length: 100 }).notNull(),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const teamsRelations = relations(teams, ({ many }) => ({
  agents: many(agents),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  team: one(teams, {
    fields: [agents.teamId],
    references: [teams.id],
  }),
  sales: many(sales),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  agent: one(agents, {
    fields: [sales.agentId],
    references: [agents.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertCashOfferSchema = createInsertSchema(cashOffers).omit({
  id: true,
  createdAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export const insertNewsTickerSchema = createInsertSchema(newsTicker).omit({
  id: true,
  createdAt: true,
});

export const insertMediaSlideSchema = createInsertSchema(mediaSlides).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSoundEffectSchema = createInsertSchema(soundEffects).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof insertUserSchema._output;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof insertCategorySchema._output;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof insertTeamSchema._output;
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof insertAgentSchema._output;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof insertSaleSchema._output;
export type CashOffer = typeof cashOffers.$inferSelect;
export type InsertCashOffer = typeof insertCashOfferSchema._output;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof insertAnnouncementSchema._output;
export type NewsTicker = typeof newsTicker.$inferSelect;
export type InsertNewsTicker = typeof insertNewsTickerSchema._output;
export type MediaSlide = typeof mediaSlides.$inferSelect;
export type InsertMediaSlide = typeof insertMediaSlideSchema._output;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof insertSystemSettingSchema._output;
export type SoundEffect = typeof soundEffects.$inferSelect;
export type InsertSoundEffect = typeof insertSoundEffectSchema._output;
```

## Step 10: Update Package.json Dependencies

Add MySQL support to `package.json`:

```json
{
  "dependencies": {
    "mysql2": "^3.6.0",
    "drizzle-orm": "^0.28.6",
    "drizzle-kit": "^0.19.13"
  }
}
```

## Step 11: Create Database Tables

### Via phpMyAdmin:
1. Access phpMyAdmin from Plesk
2. Select your `sales_dashboard` database
3. Run this SQL to create tables:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  volume_target DECIMAL(15,2) NOT NULL DEFAULT 0,
  units_target INT NOT NULL DEFAULT 0,
  target_cycle VARCHAR(50) NOT NULL DEFAULT 'monthly',
  reset_day INT NOT NULL DEFAULT 1,
  reset_month INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  photo TEXT,
  team_id INT,
  category_id INT,
  category VARCHAR(255),
  volume_target DECIMAL(15,2) NOT NULL DEFAULT 0,
  units_target INT NOT NULL DEFAULT 0,
  target_cycle VARCHAR(50) NOT NULL DEFAULT 'monthly',
  reset_day INT NOT NULL DEFAULT 1,
  reset_month INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  username VARCHAR(255),
  password VARCHAR(255),
  can_self_report BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agent_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  category VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE TABLE cash_offers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(15,2) NOT NULL,
  expiry_time TIMESTAMP NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expiry_time TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE news_ticker (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE media_slides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  duration INT NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sound_effects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  event VARCHAR(100) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data
INSERT INTO users (username, password) VALUES 
('admin', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa');

INSERT INTO categories (name, color, description) VALUES 
('Software', '#3B82F6', 'Software products and services'),
('Hardware', '#10B981', 'Hardware products and equipment'),
('Consulting', '#F59E0B', 'Consulting and professional services'),
('Support', '#8B5CF6', 'Customer support and maintenance'),
('Training', '#EF4444', 'Training and education services');

INSERT INTO teams (name, color, volume_target, units_target) VALUES 
('Sales Team A', '#3B82F6', 1000000.00, 50),
('Sales Team B', '#10B981', 800000.00, 40),
('Sales Team C', '#F59E0B', 600000.00, 30);
```

## Step 12: Update Database Connection in Code

Modify `server/index.js` to use MySQL:

```javascript
import express from 'express';
import { db } from './mysql-db.js';
// ... rest of your imports

// Test database connection
try {
  await db.execute('SELECT 1');
  console.log('MySQL database connected successfully');
} catch (error) {
  console.error('Database connection failed:', error);
  process.exit(1);
}

// ... rest of your server code
```

## Step 13: Start Application

1. In Plesk **Node.js** settings:
   - Click **Restart App**
   - Or **Enable Node.js** if not already enabled
2. Check **Logs** for any errors
3. Application should be accessible at your domain

## Step 14: Plesk Specific Configuration

### Memory & Performance:
1. Go to **Node.js** settings
2. Set **Maximum memory usage**: 512MB or higher
3. Enable **Production mode**

### Environment Variables:
1. In **Node.js** settings → **Environment Variables**
2. Add:
   ```
   NODE_ENV=production
   DB_HOST=localhost
   DB_USER=dashboard_user
   DB_PASSWORD=your_password
   DB_NAME=sales_dashboard
   SESSION_SECRET=your_session_secret
   ```

### File Permissions:
1. Ensure correct file permissions in **Files** manager
2. Set permissions: 644 for files, 755 for directories

## Step 15: SSL Certificate

1. Go to **SSL/TLS Certificates**
2. **Install** free Let's Encrypt certificate
3. **Force HTTPS redirect**

## Step 16: Backup Configuration

1. Go to **Backup Manager**
2. **Schedule** regular backups including:
   - Website files
   - Databases
3. Set retention policy as needed

## Monitoring & Maintenance

### Application Logs:
- Access via **Node.js** → **Logs**
- Or **Log Browser** in Plesk

### Database Management:
- Use **phpMyAdmin** for database operations
- Monitor database size and performance

### Updates:
- Update Node.js version in **Node.js** settings
- Use **Git** integration for code updates
- Update npm packages via **Package.json management**

## Troubleshooting

### Common Issues:

1. **Node.js app won't start:**
   - Check **Logs** in Node.js settings
   - Verify file permissions
   - Check database connection

2. **Database connection errors:**
   - Verify database credentials in phpMyAdmin
   - Check MySQL service status
   - Ensure user has proper privileges

3. **Permission denied:**
   - Set correct file permissions (644/755)
   - Ensure Node.js extension is properly installed

4. **Memory issues:**
   - Increase memory limit in Node.js settings
   - Optimize application code

### Health Check:
Create a simple health check endpoint in your application:

```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});
```

## Access Your Application

- **Main Dashboard**: `https://yourdomain.com/`
- **Admin Panel**: `https://yourdomain.com/admin-portal`
- **Default Login**: Username: `admin`, Password: `admin123`
- **phpMyAdmin**: Available in Plesk → Databases → phpMyAdmin

Your sales dashboard is now running on Plesk with MySQL database management through phpMyAdmin!