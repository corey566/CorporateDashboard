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
      <div className="flex items-center space-x-4">
        {/* Agent Photo and Basic Info */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="relative">
            <img
              src={agent.photo || `https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150`}
              alt={agent.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-primary"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-corporate-800 text-lg truncate">{agent.name}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className={`${getTeamColor(agent.teamId)} text-xs font-medium`}>
                {agent.team?.name || 'Team'}
              </Badge>
              <span className="text-xs text-corporate-500">#{agent.rank || 1}</span>
            </div>
            <p className="text-sm text-corporate-500 truncate">{agent.category}</p>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="flex-1 space-y-3">
          {/* Sales Volume Progress */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-corporate-700">Volume Target</span>
              <span className="text-sm font-bold text-primary">
                ${parseFloat(agent.currentVolume || 0).toLocaleString()} / ${parseFloat(agent.volumeTarget).toLocaleString()}
              </span>
            </div>
            <Progress value={volumeProgress} className="h-2" />
          </div>

          {/* Sales Quantity Progress */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-corporate-700">Units Target</span>
              <span className="text-sm font-bold text-accent">
                {agent.currentUnits || 0} / {agent.unitsTarget}
              </span>
            </div>
            <Progress value={unitsProgress} className="h-2" />
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center space-x-2">
          {volumeProgress > 80 ? (
            <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">Top Performer</span>
            </div>
          ) : volumeProgress > 60 ? (
            <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Rising</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">Steady</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
