<?php
/**
 * Sales Dashboard - MySQL Database Setup
 * Run this file once to create the database structure
 */

// Database configuration
$servername = "localhost";
$username = "root";
$password = "";  // Default XAMPP MySQL password is empty
$dbname = "sales_dashboard";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database
$sql = "CREATE DATABASE IF NOT EXISTS $dbname CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully or already exists<br>";
} else {
    echo "Error creating database: " . $conn->error . "<br>";
}

// Select the database
$conn->select_db($dbname);

// Create tables
$tables = [
    "companies" => "
        CREATE TABLE IF NOT EXISTS companies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            currency_symbol VARCHAR(10) DEFAULT 'LKR',
            currency_code VARCHAR(10) DEFAULT 'LKR',
            currency_name VARCHAR(100) DEFAULT 'Sri Lankan Rupee',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )",
    
    "teams" => "
        CREATE TABLE IF NOT EXISTS teams (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            color VARCHAR(7) DEFAULT '#3B82F6',
            volume_target DECIMAL(15,2) DEFAULT 0.00,
            units_target INT DEFAULT 0,
            is_visible BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )",
    
    "agents" => "
        CREATE TABLE IF NOT EXISTS agents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            team_id INT,
            category VARCHAR(100) DEFAULT 'Sales',
            volume_target DECIMAL(15,2) DEFAULT 0.00,
            units_target INT DEFAULT 0,
            volume_achieved DECIMAL(15,2) DEFAULT 0.00,
            units_achieved INT DEFAULT 0,
            total_sales INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            photo VARCHAR(500) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
        )",
    
    "sales" => "
        CREATE TABLE IF NOT EXISTS sales (
            id INT AUTO_INCREMENT PRIMARY KEY,
            agent_id INT NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            units INT DEFAULT 1,
            client_name VARCHAR(255) NOT NULL,
            category VARCHAR(100) DEFAULT 'General',
            sale_date DATE DEFAULT (CURRENT_DATE),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
        )",
    
    "cash_offers" => "
        CREATE TABLE IF NOT EXISTS cash_offers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            amount DECIMAL(15,2) DEFAULT 0.00,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )",
    
    "announcements" => "
        CREATE TABLE IF NOT EXISTS announcements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )",
    
    "news_ticker" => "
        CREATE TABLE IF NOT EXISTS news_ticker (
            id INT AUTO_INCREMENT PRIMARY KEY,
            message TEXT NOT NULL,
            display_order INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )",
    
    "settings" => "
        CREATE TABLE IF NOT EXISTS settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(100) UNIQUE NOT NULL,
            setting_value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )"
];

// Create each table
foreach ($tables as $tableName => $sql) {
    if ($conn->query($sql) === TRUE) {
        echo "Table '$tableName' created successfully or already exists<br>";
    } else {
        echo "Error creating table '$tableName': " . $conn->error . "<br>";
    }
}

// Insert default data
$defaultData = [
    // Default company
    "INSERT IGNORE INTO companies (id, name, currency_symbol, currency_code, currency_name) 
     VALUES (1, 'SALES LEADERBOARD', 'LKR', 'LKR', 'Sri Lankan Rupee')",
    
    // Default teams
    "INSERT IGNORE INTO teams (id, name, color, volume_target, units_target) VALUES 
     (1, 'Alpha Team', '#3B82F6', 500000.00, 100),
     (2, 'Beta Squad', '#10B981', 750000.00, 150)",
    
    // Default agents
    "INSERT IGNORE INTO agents (id, name, team_id, category, volume_target, units_target, volume_achieved, units_achieved, total_sales, photo) VALUES 
     (1, 'Sarah Johnson', 1, 'Hardware', 100000.00, 20, 85000.00, 17, 12, 'https://via.placeholder.com/96x96/3B82F6/FFFFFF?text=SJ'),
     (2, 'Mike Chen', 2, 'Software', 120000.00, 25, 95000.00, 20, 15, 'https://via.placeholder.com/96x96/10B981/FFFFFF?text=MC')",
    
    // Default news ticker
    "INSERT IGNORE INTO news_ticker (message, display_order) VALUES 
     ('🎉 Welcome to Sales Dashboard - Optimized for 50m TV Viewing Distance', 1),
     ('🔥 Great performance by all teams this month!', 2),
     ('📈 Keep pushing towards your targets - You''ve got this!', 3),
     ('⭐ Excellence is not a destination, it''s a continuous journey', 4),
     ('💪 Every sale counts towards your success story!', 5),
     ('🚀 Push beyond limits and achieve greatness!', 6)",
    
    // Default settings
    "INSERT IGNORE INTO settings (setting_key, setting_value) VALUES 
     ('auto_scroll_interval', '6000'),
     ('agents_per_page', '2'),
     ('working_days_per_month', '22'),
     ('show_team_rankings', 'true'),
     ('enable_teams', 'true'),
     ('dashboard_duration', '30')"
];

foreach ($defaultData as $sql) {
    if ($conn->query($sql) === TRUE) {
        echo "Default data inserted successfully<br>";
    } else {
        echo "Error inserting default data: " . $conn->error . "<br>";
    }
}

echo "<br><strong>Database setup completed successfully!</strong><br>";
echo "<a href='index.html'>Go to Dashboard</a> | <a href='admin.html'>Go to Admin Panel</a>";

$conn->close();
?>