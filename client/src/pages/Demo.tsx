import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Target, DollarSign, Trophy, Star, ArrowLeft } from "lucide-react";

// Demo data that mimics the original dashboard exactly
const demoData = {
  agents: [
    {
      id: 1,
      name: "Sarah Johnson",
      photo: null,
      teamId: 1,
      team: { name: "Sales Team Alpha", color: "#3B82F6" },
      category: "Premium",
      volumeTarget: 50000,
      unitsTarget: 25,
      currentVolume: 42000,
      currentUnits: 21,
      isActive: true
    },
    {
      id: 2,
      name: "Michael Chen",
      photo: null,
      teamId: 1,
      team: { name: "Sales Team Alpha", color: "#3B82F6" },
      category: "Standard",
      volumeTarget: 40000,
      unitsTarget: 20,
      currentVolume: 35000,
      currentUnits: 18,
      isActive: true
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      photo: null,
      teamId: 2,
      team: { name: "Sales Team Beta", color: "#10B981" },
      category: "Premium",
      volumeTarget: 45000,
      unitsTarget: 22,
      currentVolume: 38000,
      currentUnits: 19,
      isActive: true
    },
    {
      id: 4,
      name: "David Wilson",
      photo: null,
      teamId: 2,
      team: { name: "Sales Team Beta", color: "#10B981" },
      category: "Standard",
      volumeTarget: 35000,
      unitsTarget: 18,
      currentVolume: 29000,
      currentUnits: 15,
      isActive: true
    },
    {
      id: 5,
      name: "Lisa Anderson",
      photo: null,
      teamId: 3,
      team: { name: "Sales Team Gamma", color: "#F59E0B" },
      category: "Premium",
      volumeTarget: 48000,
      unitsTarget: 24,
      currentVolume: 44000,
      currentUnits: 22,
      isActive: true
    },
    {
      id: 6,
      name: "Robert Kim",
      photo: null,
      teamId: 3,
      team: { name: "Sales Team Gamma", color: "#F59E0B" },
      category: "Standard",
      volumeTarget: 38000,
      unitsTarget: 19,
      currentVolume: 32000,
      currentUnits: 16,
      isActive: true
    }
  ],
  teams: [
    {
      id: 1,
      name: "Sales Team Alpha",
      color: "#3B82F6",
      volumeTarget: 90000,
      unitsTarget: 45,
      currentVolume: 77000,
      currentUnits: 39
    },
    {
      id: 2,
      name: "Sales Team Beta",
      color: "#10B981",
      volumeTarget: 80000,
      unitsTarget: 40,
      currentVolume: 67000,
      currentUnits: 34
    },
    {
      id: 3,
      name: "Sales Team Gamma",
      color: "#F59E0B",
      volumeTarget: 86000,
      unitsTarget: 43,
      currentVolume: 76000,
      currentUnits: 38
    }
  ],
  cashOffers: [
    {
      id: 1,
      title: "Monthly Challenge",
      description: "First to reach 20 units wins",
      reward: 1000,
      type: "units",
      target: 20,
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      id: 2,
      title: "Volume Booster",
      description: "Exceed $30,000 in sales",
      reward: 800,
      type: "volume",
      target: 30000,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isActive: true
    }
  ],
  newsTicker: [
    "🎯 Q4 targets updated - Check your new goals in the admin panel",
    "🏆 Congratulations to Team Alpha for exceeding monthly targets!",
    "📊 New analytics features now available - Track your performance trends",
    "🎉 Company retreat scheduled for next month - More details soon"
  ]
};

export default function Demo() {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [recentSales, setRecentSales] = useState([]);
  const [showSaleNotification, setShowSaleNotification] = useState(false);

  useEffect(() => {
    // News ticker rotation
    const newsInterval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % demoData.newsTicker.length);
    }, 4000);

    // Simulate sales updates
    const salesInterval = setInterval(() => {
      const randomAgent = demoData.agents[Math.floor(Math.random() * demoData.agents.length)];
      const saleAmount = Math.floor(Math.random() * 4000) + 1500;
      
      const newSale = {
        id: Date.now(),
        agentName: randomAgent.name,
        amount: saleAmount,
        client: `Client ${Math.floor(Math.random() * 999) + 1}`,
        timestamp: new Date()
      };

      setRecentSales(prev => [newSale, ...prev].slice(0, 8));
      setShowSaleNotification(true);
      
      setTimeout(() => setShowSaleNotification(false), 5000);
    }, 6000);

    return () => {
      clearInterval(newsInterval);
      clearInterval(salesInterval);
    };
  }, []);

  const AgentCard = ({ agent }) => {
    const volumeProgress = (agent.currentVolume / agent.volumeTarget) * 100;
    const unitsProgress = (agent.currentUnits / agent.unitsTarget) * 100;

    return (
      <Card className="bg-white dark:bg-gray-800 border-2 hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-gray-600 dark:text-gray-300">
                {agent.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {agent.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ borderColor: agent.team.color, color: agent.team.color }}
                >
                  {agent.team.name}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {agent.category}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Volume Target
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                ${agent.currentVolume.toLocaleString()} / ${agent.volumeTarget.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${Math.min(volumeProgress, 100)}%` }}
              ></div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {volumeProgress.toFixed(1)}% Complete
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Units Target
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {agent.currentUnits} / {agent.unitsTarget} units
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${Math.min(unitsProgress, 100)}%` }}
              ></div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {unitsProgress.toFixed(1)}% Complete
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TeamLeaderboard = () => {
    const sortedTeams = [...demoData.teams].sort((a, b) => {
      const aProgress = (a.currentVolume / a.volumeTarget) * 100;
      const bProgress = (b.currentVolume / b.volumeTarget) * 100;
      return bProgress - aProgress;
    });

    return (
      <Card className="bg-white dark:bg-gray-800 h-full">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
            Team Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sortedTeams.map((team, index) => {
            const volumeProgress = (team.currentVolume / team.volumeTarget) * 100;
            const unitsProgress = (team.currentUnits / team.unitsTarget) * 100;
            
            return (
              <div key={team.id} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div 
                    className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-lg"
                    style={{ backgroundColor: team.color }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg" style={{ color: team.color }}>
                      {team.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Volume: ${team.currentVolume.toLocaleString()}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(volumeProgress, 100)}%`,
                              backgroundColor: team.color
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Units: {team.currentUnits}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(unitsProgress, 100)}%`,
                              backgroundColor: team.color
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Sales Dashboard Demo
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Real-time sales performance tracking system
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Live Demo
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* News Ticker */}
      <div className="bg-blue-600 text-white py-3 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center">
            <Star className="w-5 h-5 mr-3 text-yellow-300" />
            <div className="animate-pulse">
              <p className="text-sm font-medium">
                {demoData.newsTicker[currentNewsIndex]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sale Notification */}
      {showSaleNotification && recentSales.length > 0 && (
        <div className="fixed top-20 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">🎉 New Sale!</p>
              <p className="text-sm">
                {recentSales[0].agentName} • ${recentSales[0].amount.toLocaleString()}
              </p>
              <p className="text-xs opacity-90">
                {recentSales[0].client}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Agent Cards */}
          <div className="xl:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {demoData.agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>

          {/* Right Column - Team Leaderboard & Other Widgets */}
          <div className="space-y-6">
            <TeamLeaderboard />
            
            {/* Cash Offers */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Target className="w-5 h-5 mr-2 text-orange-500" />
                  Active Cash Offers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {demoData.cashOffers.map(offer => (
                  <div key={offer.id} className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                        {offer.title}
                      </h4>
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100">
                        ${offer.reward}
                      </Badge>
                    </div>
                    <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                      {offer.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-orange-700 dark:text-orange-300">
                        Target: {offer.type === 'volume' ? `$${offer.target.toLocaleString()}` : `${offer.target} units`}
                      </span>
                      <span className="text-xs text-orange-600 dark:text-orange-400">
                        {Math.ceil((offer.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Sales */}
            {recentSales.length > 0 && (
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                    Recent Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {recentSales.map(sale => (
                      <div key={sale.id} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-green-900 dark:text-green-100">
                            {sale.agentName}
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {sale.client}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {sale.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-900 dark:text-green-100">
                            ${sale.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-white dark:bg-gray-800 border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to transform your sales team?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Experience the power of real-time sales tracking, team competition, and performance analytics. 
              Join thousands of companies already using our platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.location.href = '/register'}
              >
                Start Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.location.href = '/public'}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}