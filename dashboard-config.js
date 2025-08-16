// Dashboard Configuration File
// Modify this file to customize your sales dashboard data

window.DASHBOARD_CONFIG = {
    // Company Information
    company: {
        name: "Sales Dashboard",
        currency: {
            symbol: "LKR",
            code: "LKR",
            name: "Sri Lankan Rupee"
        }
    },

    // Teams Configuration
    teams: [
        { id: 1, name: "Team RegiPros", color: "#3B82F6", volumeTarget: "700000.00", unitsTarget: 15 },
        { id: 2, name: "Team Titans", color: "#10B981", volumeTarget: "800000.00", unitsTarget: 15 },
        { id: 3, name: "Team Phoenix", color: "#F59E0B", volumeTarget: "200000.00", unitsTarget: 5 },
        { id: 4, name: "AL-FATIHA", color: "#EF4444", volumeTarget: "100000.00", unitsTarget: 4 },
        { id: 5, name: "ClickMasters", color: "#8B5CF6", volumeTarget: "300000.00", unitsTarget: 8 }
    ],

    // Agents Configuration
    agents: [
        {
            id: 1,
            name: "Bilal",
            photo: "https://via.placeholder.com/96x96/3B82F6/FFFFFF?text=B",
            teamId: 1,
            category: "Software",
            volumeTarget: "500000.00",
            unitsTarget: 10,
            isActive: true,
            volumeAchieved: "320000.00",
            unitsAchieved: 6,
            totalSales: 15
        },
        {
            id: 2,
            name: "Rizna",
            photo: "https://via.placeholder.com/96x96/10B981/FFFFFF?text=R",
            teamId: 1,
            category: "Software",
            volumeTarget: "200000.00",
            unitsTarget: 5,
            isActive: true,
            volumeAchieved: "180000.00",
            unitsAchieved: 4,
            totalSales: 12
        },
        {
            id: 3,
            name: "Yazeed",
            photo: "https://via.placeholder.com/96x96/F59E0B/FFFFFF?text=Y",
            teamId: 2,
            category: "Software",
            volumeTarget: "300000.00",
            unitsTarget: 5,
            isActive: true,
            volumeAchieved: "250000.00",
            unitsAchieved: 4,
            totalSales: 10
        },
        {
            id: 4,
            name: "Anuk",
            photo: "https://via.placeholder.com/96x96/8B5CF6/FFFFFF?text=A",
            teamId: 2,
            category: "Hardware",
            volumeTarget: "500000.00",
            unitsTarget: 10,
            isActive: true,
            volumeAchieved: "450000.00",
            unitsAchieved: 8,
            totalSales: 18
        },
        {
            id: 5,
            name: "Niflan",
            photo: "https://via.placeholder.com/96x96/EF4444/FFFFFF?text=N",
            teamId: 3,
            category: "Mixed",
            volumeTarget: "200000.00",
            unitsTarget: 5,
            isActive: true,
            volumeAchieved: "150000.00",
            unitsAchieved: 3,
            totalSales: 8
        },
        {
            id: 6,
            name: "Thanish",
            photo: "https://via.placeholder.com/96x96/06B6D4/FFFFFF?text=T",
            teamId: 4,
            category: "Mixed",
            volumeTarget: "100000.00",
            unitsTarget: 4,
            isActive: true,
            volumeAchieved: "95000.00",
            unitsAchieved: 3,
            totalSales: 7
        }
    ],

    // News Ticker Messages
    newsTicker: [
        "🎉 Welcome to Sales Dashboard - Optimized for 50m TV Viewing Distance",
        "🔥 Great performance by all teams this month!",
        "📈 Keep pushing towards your targets - You've got this!",
        "⭐ Excellence is not a destination, it's a continuous journey",
        "💪 Every sale counts towards our collective success",
        "🎯 Focus on your goals and make every interaction count"
    ],

    // Display Settings
    display: {
        autoScrollInterval: 6000, // milliseconds between agent scrolling
        newsTickerSpeed: 30, // seconds for full ticker animation
        agentsPerPage: 2, // number of agents to show at once
        workingDaysPerMonth: 22 // for daily target calculations
    },

    // Color Theme
    theme: {
        background: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
        cardBackground: "bg-slate-800/50",
        borderColor: "border-slate-700/50",
        progressColors: {
            excellent: "bg-green-500", // >= 90%
            good: "bg-blue-500",       // >= 70%
            warning: "bg-yellow-500",  // >= 50%
            danger: "bg-red-500"       // < 50%
        }
    }
};