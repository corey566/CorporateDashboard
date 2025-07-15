import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, TrendingUp, Target } from "lucide-react";

interface TeamLeaderboardProps {
  teams: any[];
  agents: any[];
}

export default function TeamLeaderboard({ teams, agents }: TeamLeaderboardProps) {
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
    <Card className="h-full">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-lg flex items-center">
          <Users className="w-5 h-5 text-primary mr-2" />
          Team Rankings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 h-[calc(100%-4rem)] overflow-y-auto">
        <div className="space-y-2">
          {teamPerformance.map((team) => (
            <div
              key={team.id}
              className={`flex items-center justify-between p-2 bg-gradient-to-r ${getTeamGradient(team.rank)} rounded-lg border`}
            >
              <div className="flex items-center space-x-2">
                <Badge className={`${getTeamBadgeColor(team.rank)} w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs`}>
                  {team.rank}
                </Badge>
                <div>
                  <div className="flex items-center space-x-1">
                    <h3 className="font-semibold text-corporate-800 text-sm">{team.name}</h3>
                    {getTeamIcon(team.rank)}
                  </div>
                  <p className="text-xs text-corporate-500">{team.memberCount} members</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${team.rank === 1 ? 'text-primary' : team.rank === 2 ? 'text-accent' : 'text-purple-500'}`}>
                  ${team.totalSales.toLocaleString()}
                </p>
                <p className="text-xs text-corporate-500">
                  {team.percentage.toFixed(0)}% of target
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
