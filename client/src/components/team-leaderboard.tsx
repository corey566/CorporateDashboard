import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, TrendingUp, Target } from "lucide-react";

interface TeamLeaderboardProps {
  teams: any[];
  agents: any[];
}

export default function TeamLeaderboard({ teams, agents }: TeamLeaderboardProps) {
  // Calculate team performance
  const teamPerformance = teams.map(team => {
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
    };
  }).sort((a, b) => b.percentage - a.percentage);

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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Users className="w-5 h-5 text-primary mr-2" />
          Team Rankings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamPerformance.map((team, index) => (
            <div
              key={team.id}
              className={`flex items-center justify-between p-3 bg-gradient-to-r ${getTeamGradient(index + 1)} rounded-lg border`}
            >
              <div className="flex items-center space-x-3">
                <Badge className={`${getTeamBadgeColor(index + 1)} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm`}>
                  {index + 1}
                </Badge>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-corporate-800">{team.name}</h3>
                    {getTeamIcon(index + 1)}
                  </div>
                  <p className="text-xs text-corporate-500">{team.memberCount} members</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${index === 0 ? 'text-primary' : index === 1 ? 'text-accent' : 'text-purple-500'}`}>
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
