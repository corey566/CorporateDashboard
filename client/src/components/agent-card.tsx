import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Target } from "lucide-react";

interface AgentCardProps {
  agent: any;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const volumeProgress = (parseFloat(agent.currentVolume || 0) / parseFloat(agent.volumeTarget)) * 100;
  const unitsProgress = (agent.currentUnits || 0) / agent.unitsTarget * 100;

  const getCardGradient = (index: number) => {
    const gradients = [
      'from-blue-50 to-indigo-50 border-blue-100',
      'from-green-50 to-emerald-50 border-green-100',
      'from-purple-50 to-pink-50 border-purple-100',
      'from-amber-50 to-orange-50 border-amber-100',
    ];
    return gradients[index % gradients.length];
  };

  const getTeamColor = (teamId: number) => {
    const colors = ['text-primary', 'text-accent', 'text-purple-500', 'text-amber-500'];
    return colors[teamId % colors.length];
  };

  return (
    <div className={`bg-gradient-to-r ${getCardGradient(agent.id)} rounded-lg p-4 border`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          <img
            src={agent.photo || `https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150`}
            alt={agent.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary"
          />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-corporate-800">{agent.name}</h3>
          <Badge variant="secondary" className={`${getTeamColor(agent.teamId)} text-sm font-medium`}>
            {agent.team?.name || 'Team'}
          </Badge>
          <p className="text-xs text-corporate-500">{agent.category}</p>
        </div>
      </div>

      {/* Sales Volume Progress */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-corporate-700">Volume Target</span>
          <span className="text-sm font-bold text-primary">
            ${parseFloat(agent.currentVolume || 0).toLocaleString()} / ${parseFloat(agent.volumeTarget).toLocaleString()}
          </span>
        </div>
        <Progress value={volumeProgress} className="h-2" />
      </div>

      {/* Sales Quantity Progress */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-corporate-700">Units Target</span>
          <span className="text-sm font-bold text-accent">
            {agent.currentUnits || 0} / {agent.unitsTarget}
          </span>
        </div>
        <Progress value={unitsProgress} className="h-2" />
      </div>

      <div className="flex items-center justify-between text-xs text-corporate-500">
        <span>Rank: #{agent.rank || 1}</span>
        <div className="flex items-center space-x-1">
          {volumeProgress > 80 ? (
            <>
              <Trophy className="w-3 h-3 text-warning" />
              <span>Top Performer</span>
            </>
          ) : volumeProgress > 60 ? (
            <>
              <TrendingUp className="w-3 h-3 text-accent" />
              <span>Rising</span>
            </>
          ) : (
            <>
              <Target className="w-3 h-3 text-primary" />
              <span>Steady</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
