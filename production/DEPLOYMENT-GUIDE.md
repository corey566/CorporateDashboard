# Complete PHP Hosting Server Deployment Guide
## Real-Time Sales Dashboard - Production Deployment

### 📋 Prerequisites
Before starting, ensure you have:
- PHP hosting server with PHP 7.4+ and MySQL 5.7+
- cPanel or similar hosting control panel
- FTP/SFTP access credentials
- MySQL database creation permissions
- At least 500MB storage space

### 🚀 Step-by-Step Deployment Instructions

---

## Phase 1: File Upload and Setup

### Step 1: Download and Extract Files
1. Download the complete `production` folder from this project
2. Extract all files to your local computer
3. You should have these key files:
   ```
   production/
   ├── dashboard-mysql.html      (TV Dashboard)
   ├── admin-mysql.html         (Admin Panel)
   ├── api.php                  (Database API)
   ├── setup-mysql.php          (Database Setup)
   ├── home.html               (Version Selector)
   ├── .htaccess               (Apache Configuration)
   ├── index.html              (localStorage Dashboard)
   ├── admin.html              (localStorage Admin)
   └── uploads/                (File Upload Directory)
   ```

### Step 2: Upload Files to Your Hosting Server
**Using cPanel File Manager:**
1. Login to your cPanel
2. Open "File Manager"
3. Navigate to `public_html` (or your domain's root directory)
4. Upload ALL files from the `production` folder
5. Extract if uploaded as ZIP file

**Using FTP/SFTP:**
1. Connect to your server using FTP client (FileZilla, WinSCP, etc.)
2. Navigate to `public_html` or your domain's root directory
3. Upload ALL files from the `production` folder
4. Ensure file permissions are set correctly (755 for directories, 644 for files)

---

## Phase 2: Database Configuration

### Step 3: Create MySQL Database
**In cPanel:**
1. Go to "MySQL Databases"
2. Create a new database (e.g., `your_username_sales`)
3. Create a new MySQL user (e.g., `your_username_admin`)
4. Set a strong password for the user
5. Add the user to the database with ALL PRIVILEGES
6. **Write down these credentials:**
   - Database Name: `your_username_sales`
   - Username: `your_username_admin`
   - Password: `your_chosen_password`
   - Host: `localhost` (usually)

### Step 4: Configure Database Connection
1. Open `api.php` in a text editor
2. Find the database configuration section (lines 8-12):
   ```php
   $host = 'localhost';
   $dbname = 'your_database_name';  // ← Change this
   $username = 'your_db_username';  // ← Change this
   $password = 'your_db_password';  // ← Change this
   ```
3. Replace with your actual database credentials:
   ```php
   $host = 'localhost';
   $dbname = 'your_username_sales';     // Your database name
   $username = 'your_username_admin';   // Your database username
   $password = 'your_actual_password';  // Your database password
   ```
4. Save the file and re-upload `api.php`

### Step 5: Initialize Database
1. Open your web browser
2. Navigate to: `https://yourdomain.com/setup-mysql.php`
3. You should see: "Database setup completed successfully!"
4. If you see any errors, check your database credentials in `api.php`

---

## Phase 3: Testing and Configuration

### Step 6: Test the Installation
1. **Test Database Setup:**
   - Visit: `https://yourdomain.com/setup-mysql.php`
   - Should show: "Database setup completed successfully!"

2. **Test Dashboard:**
   - Visit: `https://yourdomain.com/dashboard-mysql.html`
   - Should display the sales dashboard with sample data

3. **Test Admin Panel:**
   - Visit: `https://yourdomain.com/admin-mysql.html`
   - Should show the admin interface

4. **Test API:**
   - Visit: `https://yourdomain.com/api.php?action=teams`
   - Should return JSON data with teams

### Step 7: Configure for Real-Time Operations
1. **Access Admin Panel:**
   - Go to: `https://yourdomain.com/admin-mysql.html`
   - Click on "Teams" tab

2. **Set Up Your Teams:**
   - Delete sample teams if needed
   - Add your actual teams with correct names and targets
   - Set appropriate colors for each team

3. **Add Your Agents:**
   - Click "Agents" tab
   - Delete sample agents
   - Add your real agents with:
     - Correct names
     - Team assignments
     - Sales targets
     - Agent photos (optional)

4. **Configure Settings:**
   - Click "Settings" tab
   - Set your currency symbol (e.g., USD $, EUR €, LKR)
   - Adjust dashboard refresh intervals
   - Configure sound settings

---

## Phase 4: Real-Time Data Entry

### Step 8: Start Recording Real Sales
1. **Remove Sample Data:**
   - In Admin Panel, go to "Sales" tab
   - Delete all sample sales entries

2. **Add Real Sales:**
   - Use the "Add Sale" form to record actual sales
   - Include: Agent, Amount, Client Name, Category
   - Sales will appear immediately on the dashboard

3. **Set Up Data Entry Process:**
   - Train your team to use the admin panel for data entry
   - Or set up automated data import if you have a CRM system

---

## Phase 5: TV Display Setup

### Step 9: Configure for Large Screen Display
1. **Set Up TV Display:**
   - Connect TV/monitor to a computer or streaming device
   - Open web browser in fullscreen mode
   - Navigate to: `https://yourdomain.com/dashboard-mysql.html`
   - Press F11 for fullscreen mode

2. **Optimize Display:**
   - Ensure stable internet connection
   - Set browser to auto-refresh if connection drops
   - Consider using kiosk mode for dedicated displays

---

## Phase 6: Maintenance and Backup

### Step 10: Regular Maintenance
1. **Database Backup:**
   - Use cPanel > phpMyAdmin to export your database regularly
   - Or set up automated backups through your hosting provider

2. **File Backup:**
   - Keep local copies of your customized files
   - Backup uploaded agent photos and audio files

3. **Performance Monitoring:**
   - Monitor database size and performance
   - Clean up old sales data periodically if needed

---

## 🔧 Troubleshooting

### Common Issues and Solutions

**Issue: "500 Internal Server Error"**
- Check .htaccess file is uploaded correctly
- Verify PHP version is 7.4 or higher
- Check file permissions (644 for files, 755 for directories)

**Issue: "Database connection failed"**
- Double-check database credentials in api.php
- Ensure database user has ALL PRIVILEGES
- Verify database name is correct

**Issue: "No data showing on dashboard"**
- Run setup-mysql.php again to populate sample data
- Check if teams and agents are added in admin panel
- Verify API is working: visit /api.php?action=teams

**Issue: "Dashboard not updating in real-time"**
- Check internet connection stability
- Clear browser cache and refresh
- Verify JavaScript is enabled in browser

---

## 📱 Quick Access URLs

After deployment, bookmark these URLs:

- **Main Navigation:** `https://yourdomain.com/home.html`
- **TV Dashboard:** `https://yourdomain.com/dashboard` or `/dashboard-mysql.html`
- **Admin Panel:** `https://yourdomain.com/admin` or `/admin-mysql.html`
- **Database Setup:** `https://yourdomain.com/setup` or `/setup-mysql.php`
- **phpMyAdmin:** `https://yourdomain.com/phpmyadmin` (if available)

---

## 🎯 Production Checklist

Before going live, ensure:

- [ ] Database credentials are configured correctly in api.php
- [ ] Database setup completed successfully
- [ ] Sample data replaced with real teams and agents
- [ ] Currency and settings configured appropriately
- [ ] TV display tested in fullscreen mode
- [ ] Real-time updates working correctly
- [ ] Backup strategy implemented
- [ ] Team trained on data entry process

---

## 🆘 Support and Additional Help

If you encounter issues:

1. **Check Error Logs:**
   - cPanel > Error Logs for detailed error information
   - Browser Console (F12) for JavaScript errors

2. **Test Individual Components:**
   - Test database connection: visit `/api.php?action=test`
   - Test file permissions: create a test PHP file
   - Test .htaccess: try accessing /admin without .html extension

3. **Contact Support:**
   - Your hosting provider for server-related issues
   - Database administrator for MySQL problems

---

**🎉 Congratulations!** Your real-time sales dashboard is now running on your PHP hosting server with live MySQL data. The system will display real-time sales performance without any sample data once you start entering actual sales through the admin panel.