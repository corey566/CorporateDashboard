<?php
/**
 * Sales Dashboard - MySQL API Handler
 * Provides REST API endpoints for dashboard data management
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "sales_dashboard";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Set charset
$conn->set_charset("utf8mb4");

// Get request method and endpoint
$method = $_SERVER['REQUEST_METHOD'];
$request = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';
$input = json_decode(file_get_contents('php://input'), true);

// Router
switch ($request) {
    case 'dashboard-data':
        if ($method === 'GET') {
            getDashboardData($conn);
        }
        break;
        
    case 'teams':
        if ($method === 'GET') {
            getTeams($conn);
        } elseif ($method === 'POST') {
            addTeam($conn, $input);
        } elseif ($method === 'PUT') {
            updateTeam($conn, $input);
        } elseif ($method === 'DELETE') {
            deleteTeam($conn, $input);
        }
        break;
        
    case 'agents':
        if ($method === 'GET') {
            getAgents($conn);
        } elseif ($method === 'POST') {
            addAgent($conn, $input);
        } elseif ($method === 'PUT') {
            updateAgent($conn, $input);
        } elseif ($method === 'DELETE') {
            deleteAgent($conn, $input);
        }
        break;
        
    case 'sales':
        if ($method === 'GET') {
            getSales($conn);
        } elseif ($method === 'POST') {
            addSale($conn, $input);
        }
        break;
        
    case 'company':
        if ($method === 'GET') {
            getCompany($conn);
        } elseif ($method === 'PUT') {
            updateCompany($conn, $input);
        }
        break;
        
    case 'settings':
        if ($method === 'GET') {
            getSettings($conn);
        } elseif ($method === 'PUT') {
            updateSettings($conn, $input);
        }
        break;
        
    case 'news-ticker':
        if ($method === 'GET') {
            getNewsTicker($conn);
        } elseif ($method === 'PUT') {
            updateNewsTicker($conn, $input);
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}

$conn->close();

// Functions

function getDashboardData($conn) {
    $data = [
        'company' => getCompanyData($conn),
        'teams' => getTeamsWithStats($conn),
        'agents' => getAgentsWithStats($conn),
        'sales' => getRecentSales($conn),
        'settings' => getSettingsData($conn),
        'newsTicker' => getNewsTickerData($conn)
    ];
    
    echo json_encode($data);
}

function getCompanyData($conn) {
    $sql = "SELECT * FROM companies WHERE id = 1";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return [
            'name' => $row['name'],
            'currency' => [
                'symbol' => $row['currency_symbol'],
                'code' => $row['currency_code'],
                'name' => $row['currency_name']
            ]
        ];
    }
    
    return [
        'name' => 'SALES LEADERBOARD',
        'currency' => ['symbol' => 'LKR', 'code' => 'LKR', 'name' => 'Sri Lankan Rupee']
    ];
}

function getTeamsWithStats($conn) {
    $sql = "SELECT t.*, 
                   COUNT(a.id) as agent_count,
                   COALESCE(SUM(a.volume_achieved), 0) as volume_achieved,
                   COALESCE(SUM(a.units_achieved), 0) as units_achieved
            FROM teams t 
            LEFT JOIN agents a ON t.id = a.team_id AND a.is_active = 1
            WHERE t.is_visible = 1
            GROUP BY t.id
            ORDER BY (COALESCE(SUM(a.volume_achieved), 0) / NULLIF(t.volume_target, 0)) DESC";
    
    $result = $conn->query($sql);
    $teams = [];
    
    while ($row = $result->fetch_assoc()) {
        $volumeProgress = $row['volume_target'] > 0 ? ($row['volume_achieved'] / $row['volume_target']) * 100 : 0;
        $unitsProgress = $row['units_target'] > 0 ? ($row['units_achieved'] / $row['units_target']) * 100 : 0;
        
        // Calculate daily targets
        $workingDays = getSetting($conn, 'working_days_per_month', 22);
        $dailyVolumeTarget = $row['volume_target'] / $workingDays;
        $dailyUnitsTarget = ceil($row['units_target'] / $workingDays);
        
        $teams[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'color' => $row['color'],
            'volumeTarget' => $row['volume_target'],
            'unitsTarget' => (int)$row['units_target'],
            'volumeAchieved' => $row['volume_achieved'],
            'unitsAchieved' => (int)$row['units_achieved'],
            'volumeProgress' => round($volumeProgress, 1),
            'unitsProgress' => round($unitsProgress, 1),
            'agentCount' => (int)$row['agent_count'],
            'dailyVolumeTarget' => $dailyVolumeTarget,
            'dailyUnitsTarget' => $dailyUnitsTarget,
            'isVisible' => (bool)$row['is_visible']
        ];
    }
    
    return $teams;
}

function getAgentsWithStats($conn) {
    $sql = "SELECT a.*, t.name as team_name, t.color as team_color
            FROM agents a
            LEFT JOIN teams t ON a.team_id = t.id
            WHERE a.is_active = 1
            ORDER BY a.name";
    
    $result = $conn->query($sql);
    $agents = [];
    
    while ($row = $result->fetch_assoc()) {
        $volumeProgress = $row['volume_target'] > 0 ? ($row['volume_achieved'] / $row['volume_target']) * 100 : 0;
        $unitsProgress = $row['units_target'] > 0 ? ($row['units_achieved'] / $row['units_target']) * 100 : 0;
        
        $agents[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'teamId' => $row['team_id'] ? (int)$row['team_id'] : null,
            'teamName' => $row['team_name'] ?: 'No Team',
            'teamColor' => $row['team_color'] ?: '#64748B',
            'category' => $row['category'],
            'volumeTarget' => $row['volume_target'],
            'unitsTarget' => (int)$row['units_target'],
            'volumeAchieved' => $row['volume_achieved'],
            'unitsAchieved' => (int)$row['units_achieved'],
            'volumeProgress' => round($volumeProgress, 1),
            'unitsProgress' => round($unitsProgress, 1),
            'totalSales' => (int)$row['total_sales'],
            'isActive' => (bool)$row['is_active'],
            'photo' => $row['photo'] ?: generateDefaultPhoto($row['name'], $row['team_color'])
        ];
    }
    
    return $agents;
}

function getRecentSales($conn, $limit = 10) {
    $sql = "SELECT s.*, a.name as agent_name, t.name as team_name
            FROM sales s
            JOIN agents a ON s.agent_id = a.id
            LEFT JOIN teams t ON a.team_id = t.id
            ORDER BY s.created_at DESC
            LIMIT $limit";
    
    $result = $conn->query($sql);
    $sales = [];
    
    while ($row = $result->fetch_assoc()) {
        $sales[] = [
            'id' => (int)$row['id'],
            'agentId' => (int)$row['agent_id'],
            'agentName' => $row['agent_name'],
            'teamName' => $row['team_name'],
            'amount' => (float)$row['amount'],
            'units' => (int)$row['units'],
            'clientName' => $row['client_name'],
            'category' => $row['category'],
            'saleDate' => $row['sale_date'],
            'createdAt' => $row['created_at']
        ];
    }
    
    return $sales;
}

function getSettingsData($conn) {
    $sql = "SELECT setting_key, setting_value FROM settings";
    $result = $conn->query($sql);
    
    $settings = [
        'autoScrollInterval' => 6000,
        'agentsPerPage' => 2,
        'workingDaysPerMonth' => 22,
        'showTeamRankings' => true,
        'enableTeams' => true,
        'dashboardDuration' => 30
    ];
    
    while ($row = $result->fetch_assoc()) {
        $key = $row['setting_key'];
        $value = $row['setting_value'];
        
        // Convert to appropriate types
        switch ($key) {
            case 'auto_scroll_interval':
                $settings['autoScrollInterval'] = (int)$value;
                break;
            case 'agents_per_page':
                $settings['agentsPerPage'] = (int)$value;
                break;
            case 'working_days_per_month':
                $settings['workingDaysPerMonth'] = (int)$value;
                break;
            case 'show_team_rankings':
                $settings['showTeamRankings'] = $value === 'true';
                break;
            case 'enable_teams':
                $settings['enableTeams'] = $value === 'true';
                break;
            case 'dashboard_duration':
                $settings['dashboardDuration'] = (int)$value;
                break;
        }
    }
    
    return $settings;
}

function getNewsTickerData($conn) {
    $sql = "SELECT message FROM news_ticker WHERE is_active = 1 ORDER BY display_order, id";
    $result = $conn->query($sql);
    
    $messages = [];
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row['message'];
    }
    
    return $messages;
}

function addTeam($conn, $input) {
    $stmt = $conn->prepare("INSERT INTO teams (name, color, volume_target, units_target) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssdi", $input['name'], $input['color'], $input['volumeTarget'], $input['unitsTarget']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add team']);
    }
}

function updateTeam($conn, $input) {
    $stmt = $conn->prepare("UPDATE teams SET name = ?, color = ?, volume_target = ?, units_target = ? WHERE id = ?");
    $stmt->bind_param("ssdii", $input['name'], $input['color'], $input['volumeTarget'], $input['unitsTarget'], $input['id']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update team']);
    }
}

function deleteTeam($conn, $input) {
    // Update agents to remove team association
    $stmt1 = $conn->prepare("UPDATE agents SET team_id = NULL WHERE team_id = ?");
    $stmt1->bind_param("i", $input['id']);
    $stmt1->execute();
    
    // Delete team
    $stmt2 = $conn->prepare("DELETE FROM teams WHERE id = ?");
    $stmt2->bind_param("i", $input['id']);
    
    if ($stmt2->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete team']);
    }
}

function addAgent($conn, $input) {
    $photo = $input['photo'] ?: generateDefaultPhoto($input['name'], '#3B82F6');
    
    $stmt = $conn->prepare("INSERT INTO agents (name, team_id, category, volume_target, units_target, photo) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sisids", $input['name'], $input['teamId'], $input['category'], $input['volumeTarget'], $input['unitsTarget'], $photo);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add agent']);
    }
}

function updateAgent($conn, $input) {
    $stmt = $conn->prepare("UPDATE agents SET name = ?, team_id = ?, category = ?, volume_target = ?, units_target = ?, photo = ? WHERE id = ?");
    $stmt->bind_param("sisidsi", $input['name'], $input['teamId'], $input['category'], $input['volumeTarget'], $input['unitsTarget'], $input['photo'], $input['id']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update agent']);
    }
}

function deleteAgent($conn, $input) {
    $stmt = $conn->prepare("DELETE FROM agents WHERE id = ?");
    $stmt->bind_param("i", $input['id']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete agent']);
    }
}

function addSale($conn, $input) {
    $conn->begin_transaction();
    
    try {
        // Insert sale
        $stmt1 = $conn->prepare("INSERT INTO sales (agent_id, amount, units, client_name, category) VALUES (?, ?, ?, ?, ?)");
        $stmt1->bind_param("idiss", $input['agentId'], $input['amount'], $input['units'], $input['clientName'], $input['category']);
        $stmt1->execute();
        $saleId = $conn->insert_id;
        
        // Update agent stats
        $stmt2 = $conn->prepare("UPDATE agents SET 
                                volume_achieved = volume_achieved + ?, 
                                units_achieved = units_achieved + ?, 
                                total_sales = total_sales + 1 
                                WHERE id = ?");
        $stmt2->bind_param("dii", $input['amount'], $input['units'], $input['agentId']);
        $stmt2->execute();
        
        $conn->commit();
        echo json_encode(['success' => true, 'id' => $saleId]);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add sale']);
    }
}

function updateCompany($conn, $input) {
    $stmt = $conn->prepare("UPDATE companies SET name = ?, currency_symbol = ?, currency_code = ?, currency_name = ? WHERE id = 1");
    $stmt->bind_param("ssss", $input['name'], $input['currency']['symbol'], $input['currency']['code'], $input['currency']['name']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update company']);
    }
}

function updateSettings($conn, $input) {
    foreach ($input as $key => $value) {
        $dbKey = '';
        switch ($key) {
            case 'autoScrollInterval':
                $dbKey = 'auto_scroll_interval';
                break;
            case 'agentsPerPage':
                $dbKey = 'agents_per_page';
                break;
            case 'workingDaysPerMonth':
                $dbKey = 'working_days_per_month';
                break;
            case 'showTeamRankings':
                $dbKey = 'show_team_rankings';
                $value = $value ? 'true' : 'false';
                break;
            case 'enableTeams':
                $dbKey = 'enable_teams';
                $value = $value ? 'true' : 'false';
                break;
            case 'dashboardDuration':
                $dbKey = 'dashboard_duration';
                break;
        }
        
        if ($dbKey) {
            $stmt = $conn->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
            $stmt->bind_param("sss", $dbKey, $value, $value);
            $stmt->execute();
        }
    }
    
    echo json_encode(['success' => true]);
}

function updateNewsTicker($conn, $input) {
    // Clear existing messages
    $conn->query("DELETE FROM news_ticker");
    
    // Insert new messages
    $order = 1;
    foreach ($input['messages'] as $message) {
        $stmt = $conn->prepare("INSERT INTO news_ticker (message, display_order) VALUES (?, ?)");
        $stmt->bind_param("si", $message, $order);
        $stmt->execute();
        $order++;
    }
    
    echo json_encode(['success' => true]);
}

function getSetting($conn, $key, $default = null) {
    $stmt = $conn->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
    $stmt->bind_param("s", $key);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        return $row['setting_value'];
    }
    
    return $default;
}

function generateDefaultPhoto($name, $color) {
    $initial = strtoupper(substr($name, 0, 1));
    $colorCode = str_replace('#', '', $color);
    return "https://via.placeholder.com/96x96/{$colorCode}/FFFFFF?text={$initial}";
}

function getTeams($conn) {
    echo json_encode(getTeamsWithStats($conn));
}

function getAgents($conn) {
    echo json_encode(getAgentsWithStats($conn));
}

function getSales($conn) {
    echo json_encode(getRecentSales($conn, 50));
}

function getCompany($conn) {
    echo json_encode(getCompanyData($conn));
}

function getSettings($conn) {
    echo json_encode(getSettingsData($conn));
}

function getNewsTicker($conn) {
    echo json_encode(getNewsTickerData($conn));
}
?>