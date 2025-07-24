import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, TrendingUp, Target } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";

interface TeamLeaderboardProps {
  teams: any[];
  agents: any[];
}

export default function TeamLeaderboard({ teams, agents }: TeamLeaderboardProps) {
  const { formatCurrency } = useCurrency();
  
  // Calculate team performance based on agents' data
  const teamPerformance = teams.map((team, index) => {
    const teamAgents = agents.filter(agent => agent.teamId === team.id);
    const totalSales = teamAgents.reduce((sum, agent) => sum + parseFloat(agent.currentVolume || 0), 0);
    const targetSales = teamAgents.reduce((sum, agent) => sum + parseFloat(agent.volumeTarget || 0), 0);
    const percentage = targetSales > 0 ? (totalSales / targetSales) * 100 : 0;
    
    return {
      ...team,
      totalSales,
      targetSales,
      percentage,
      memberCount: teamAgents.length,
      rank: index + 1
    };
  }).sort((a, b) => b.totalSales - a.totalSales);

  const getTeamIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-warning" />;
      case 2:
        return <TrendingUp className="w-4 h-4 text-accent" />;
      default:
        return <Target className="w-4 h-4 text-primary" />;
    }
  };

  const getTeamBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-primary text-white';
      case 2:
        return 'bg-accent text-white';
      case 3:
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTeamGradient = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-blue-50 to-indigo-50 border-blue-100';
      case 2:
        return 'from-green-50 to-emerald-50 border-green-100';
      case 3:
        return 'from-purple-50 to-pink-50 border-purple-100';
      default:
        return 'from-gray-50 to-slate-50 border-gray-100';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-5xl font-black text-foreground mb-4">TEAM RANKINGS</h2>
        <div className="text-2xl font-bold text-muted-foreground">
          Real-time Team Performance Leaderboard
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {teamPerformance.map((team) => (
          <div
            key={team.id}
            className={`bg-card border-2 border-border rounded-2xl p-8 shadow-lg transition-all duration-300 ${team.rank === 1 ? 'ring-4 ring-primary/50' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center font-black text-3xl ${getTeamBadgeColor(team.rank)}`}>
                  #{team.rank}
                </div>
                <div>
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="font-black text-5xl text-foreground">{team.name}</h3>
                    <div className="text-4xl">
                      {team.rank === 1 ? <Crown className="w-12 h-12 text-yellow-500" /> : 
                       team.rank === 2 ? <TrendingUp className="w-12 h-12 text-green-500" /> :
                       <Target className="w-12 h-12 text-blue-500" />}
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-muted-foreground">{team.memberCount} Team Members</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-6xl font-black mb-2 ${team.rank === 1 ? 'text-primary' : team.rank === 2 ? 'text-accent' : 'text-purple-500'}`}>
                  {formatCurrency(team.totalSales)}
                </div>
                <div className="text-2xl font-bold text-muted-foreground mb-1">
                  Target: {formatCurrency(team.targetSales)}
                </div>
                <div className={`text-3xl font-black ${team.rank === 1 ? 'text-primary' : team.rank === 2 ? 'text-accent' : 'text-purple-500'}`}>
                  {team.percentage.toFixed(0)}% COMPLETE
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
