import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";

// Mock data for demo
const mockAgents = [
  { id: 1, name: "Sarah Johnson", team: "Team Alpha", sales: 45, target: 50, photo: "" },
  { id: 2, name: "Mike Chen", team: "Team Beta", sales: 38, target: 45, photo: "" },
  { id: 3, name: "Emma Davis", team: "Team Alpha", sales: 52, target: 50, photo: "" },
  { id: 4, name: "James Wilson", team: "Team Gamma", sales: 41, target: 48, photo: "" }
];

const mockTeams = [
  { id: 1, name: "Team Alpha", score: 97, color: "#3b82f6" },
  { id: 2, name: "Team Beta", score: 83, color: "#10b981" },
  { id: 3, name: "Team Gamma", score: 89, color: "#f59e0b" }
];

const mockSales = [
  { id: 1, agentName: "Sarah Johnson", amount: 2500, time: "2 minutes ago" },
  { id: 2, agentName: "Emma Davis", amount: 1800, time: "5 minutes ago" },
  { id: 3, agentName: "Mike Chen", amount: 3200, time: "12 minutes ago" }
];

export default function Demo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSale, setCurrentSale] = useState<any>(null);
  const [agents, setAgents] = useState(mockAgents);
  const [teams, setTeams] = useState(mockTeams);
  const [recentSales, setRecentSales] = useState(mockSales);

  // Simulate real-time updates
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // Simulate a new sale
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const newSale = {
        id: Date.now(),
        agentName: randomAgent.name,
        amount: Math.floor(Math.random() * 3000) + 1000,
        time: "Just now"
      };

      setCurrentSale(newSale);
      setRecentSales(prev => [newSale, ...prev.slice(0, 4)]);

      // Update agent progress
      setAgents(prev => prev.map(agent => 
        agent.name === randomAgent.name 
          ? { ...agent, sales: Math.min(agent.sales + 1, agent.target) }
          : agent
      ));

      // Clear sale popup after 3 seconds
      setTimeout(() => setCurrentSale(null), 3000);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, agents]);

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentSale(null);
    setAgents(mockAgents);
    setTeams(mockTeams);
    setRecentSales(mockSales);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Live Demo - Sales Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button variant="outline" size="sm" onClick={resetDemo}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-blue-600 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Interactive Demo</h2>
          <p className="text-blue-100">
            Click "Play" to see real-time sales updates, agent progress, and team leaderboards in action. 
            This simulates how your sales team would see their performance updates live.
          </p>
        </div>
      </div>

      {/* Sale Popup */}
      {currentSale && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg transform scale-100 animate-pulse">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">🎉 New Sale!</h3>
              <p className="text-lg">{currentSale.agentName}</p>
              <p className="text-2xl font-bold">${currentSale.amount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Agent Cards */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Sales Agents</CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time performance tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agents.map(agent => (
                    <div key={agent.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{agent.name}</h3>
                          <p className="text-sm text-gray-400">{agent.team}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">{agent.sales}/{agent.target}</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(agent.sales / agent.target) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Leaderboard & Recent Sales */}
          <div className="space-y-6">
            {/* Team Leaderboard */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Team Leaderboard</CardTitle>
                <CardDescription className="text-gray-400">
                  Top performing teams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teams.sort((a, b) => b.score - a.score).map((team, index) => (
                    <div key={team.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{team.name}</h4>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                        </div>
                      </div>
                      <Badge variant="secondary">{team.score}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Sales</CardTitle>
                <CardDescription className="text-gray-400">
                  Latest transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSales.map(sale => (
                    <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-semibold text-white">{sale.agentName}</p>
                        <p className="text-sm text-gray-400">{sale.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">${sale.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-blue-600 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-6">
            See how this dashboard can transform your sales team's performance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}