# Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- Node.js 18+ 
- PostgreSQL database (Neon recommended)

### Step 1: Prepare Your Project

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Build the Frontend**
   ```bash
   npm run build
   ```

### Step 2: Deploy to Vercel

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   In your Vercel dashboard, go to Project Settings → Environment Variables:
   
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: Random string for session encryption
   - `NODE_ENV`: Set to "production"

### Step 3: Configure Database

1. **Push Database Schema**
   ```bash
   npm run db:push
   ```

2. **Verify Database Connection**
   The app should connect to your database automatically.

### Important Notes for Vercel

- **WebSocket Limitations**: Vercel's serverless functions don't support persistent WebSocket connections. Real-time features will be limited.
- **Session Storage**: Uses PostgreSQL session store which works with serverless functions.
- **File Uploads**: Uploads are stored in `/tmp` which is ephemeral. Consider using cloud storage for production.
- **Cold Starts**: First request may be slower due to serverless cold starts.

### Vercel Configuration

The `vercel.json` file is already configured with:
- API routes handled by serverless functions
- Static file serving for the frontend
- Build configuration for both frontend and backend

### Deployment Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs [deployment-url]
```

## Alternative: Traditional Server Deployment

### Apache Server Setup

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Apache Configuration**
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com
       DocumentRoot /var/www/your-app/client/dist
       
       # Serve static files
       <Directory "/var/www/your-app/client/dist">
           Options -Indexes
           AllowOverride All
           Require all granted
       </Directory>
       
       # Proxy API requests to Node.js
       ProxyPreserveHost On
       ProxyPass /api/ http://localhost:5000/api/
       ProxyPassReverse /api/ http://localhost:5000/api/
       
       # Handle client-side routing
       RewriteEngine On
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteCond %{REQUEST_URI} !^/api/
       RewriteRule . /index.html [L]
   </VirtualHost>
   ```

3. **Start Node.js Backend**
   ```bash
   npm start
   ```

### Nginx Server Setup

1. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Serve static files
       location / {
           root /var/www/your-app/client/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # Proxy API requests
       location /api/ {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       # WebSocket support
       location /ws/ {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SESSION_SECRET=${SESSION_SECRET}
      - NODE_ENV=production
    depends_on:
      - db
  
  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=salesboard
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Secret key for session encryption | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## Post-Deployment Setup

1. **Database Migration**
   ```bash
   npm run db:push
   ```

2. **Create Admin User**
   Access `/admin-portal` and create your first admin account.

3. **Configure Teams and Agents**
   - Create teams first
   - Add agents to teams
   - Set targets and goals

4. **Upload Media**
   - Add company slides
   - Configure sound effects
   - Set up announcements

## Monitoring and Maintenance

### Health Checks

- **API Health**: `GET /api/health`
- **Database Connection**: Monitor database connection logs
- **WebSocket Status**: Check real-time update functionality

### Performance Optimization

- **Database Indexing**: Ensure proper indexes on frequently queried columns
- **Connection Pooling**: Monitor database connection pool usage
- **Static Asset Caching**: Configure CDN for static assets

### Backup Strategy

- **Database Backups**: Regular PostgreSQL backups
- **File Uploads**: Backup uploaded media files
- **Configuration**: Export system settings

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Check network connectivity
   - Ensure database is running

2. **Build Failures**
   - Clear node_modules and reinstall
   - Check for TypeScript errors
   - Verify all dependencies are installed

3. **WebSocket Issues**
   - Check proxy configuration
   - Verify WebSocket support in hosting environment
   - Test with different browsers

### Logs and Debugging

```bash
# View application logs
npm run logs

# Database query logs
# Set DEBUG=drizzle:* for detailed SQL logs

# Vercel deployment logs
vercel logs
```

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS**: Always use HTTPS in production
3. **Database Security**: Use connection pooling and prepared statements
4. **Session Security**: Use secure session configuration
5. **File Uploads**: Validate and sanitize uploaded files

## Scaling Considerations

- **Database**: Use read replicas for heavy read workloads
- **WebSocket**: Consider using Redis for session storage in multi-instance deployments
- **File Storage**: Use cloud storage (AWS S3, Google Cloud Storage) for uploaded files
- **Load Balancing**: Use load balancers for high-traffic scenarios