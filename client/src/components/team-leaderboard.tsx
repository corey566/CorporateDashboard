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
    <div className="h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-black text-foreground mb-2">TEAM SCOREBOARD</h2>
        <div className="text-sm font-bold text-muted-foreground">
          Live Team Rankings
        </div>
      </div>
      
      <div className="space-y-3 h-[calc(100%-80px)] overflow-y-auto">
        {teamPerformance.map((team) => (
          <div
            key={team.id}
            className={`bg-card border-2 border-border rounded-xl p-4 shadow-lg transition-all duration-300 ${team.rank === 1 ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}
          >
            {/* Team Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${getTeamBadgeColor(team.rank)}`}>
                  #{team.rank}
                </div>
                <div>
                  <h3 className="font-black text-xl text-foreground">{team.name}</h3>
                  <p className="text-xs font-semibold text-muted-foreground">{team.memberCount} Players</p>
                </div>
              </div>
              <div className="text-lg">
                {team.rank === 1 ? <Crown className="w-6 h-6 text-yellow-500" /> : 
                 team.rank === 2 ? <TrendingUp className="w-6 h-6 text-green-500" /> :
                 <Target className="w-6 h-6 text-blue-500" />}
              </div>
            </div>
            
            {/* Team Stats */}
            <div className="text-center">
              <div className={`text-3xl font-black mb-1 ${team.rank === 1 ? 'text-primary' : team.rank === 2 ? 'text-accent' : 'text-purple-500'}`}>
                {formatCurrency(team.totalSales)}
              </div>
              <div className="text-xs font-semibold text-muted-foreground mb-1">
                Target: {formatCurrency(team.targetSales)}
              </div>
              <div className={`text-lg font-black ${team.rank === 1 ? 'text-primary' : team.rank === 2 ? 'text-accent' : 'text-purple-500'}`}>
                {team.percentage.toFixed(0)}% COMPLETE
              </div>
            </div>
            
            {/* Performance Bar */}
            <div className="mt-3">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    team.rank === 1 ? 'bg-primary' : 
                    team.rank === 2 ? 'bg-accent' : 
                    'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(100, team.percentage)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
