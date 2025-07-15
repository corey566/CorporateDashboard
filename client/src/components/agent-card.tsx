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
    <div className="bg-card border border-border rounded-xl p-4 lg:p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
        {/* Agent Photo and Basic Info */}
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <div className="relative">
            <img
              src={agent.photo || `https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150`}
              alt={agent.name}
              className="w-12 h-12 lg:w-16 lg:h-16 rounded-full object-cover border-2 border-border shadow-md"
            />
            <div className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-accent to-accent-foreground rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xs lg:text-sm font-bold">#{agent.rank || 1}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-foreground text-lg lg:text-xl truncate">{agent.name}</h3>
            <div className="flex items-center space-x-2 mb-1">
              <Badge variant="secondary" className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary">
                {agent.team?.name || 'Team'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {agent.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Progress Bars - Enhanced */}
        <div className="flex-1 space-y-4">
          {/* Sales Volume Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-foreground">Volume Progress</span>
              <span className="text-sm font-bold text-primary">
                ${parseFloat(agent.currentVolume || 0).toLocaleString()} / ${parseFloat(agent.volumeTarget).toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 shadow-inner"
                style={{ width: `${Math.min(100, volumeProgress)}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round(volumeProgress)}% Complete
            </div>
          </div>

          {/* Sales Quantity Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-foreground">Units Progress</span>
              <span className="text-sm font-bold text-accent">
                {agent.currentUnits || 0} / {agent.unitsTarget}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-accent to-accent/80 h-3 rounded-full transition-all duration-500 shadow-inner"
                style={{ width: `${Math.min(100, unitsProgress)}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round(unitsProgress)}% Complete
            </div>
          </div>
        </div>

        {/* Status Badge - Enhanced */}
        <div className="flex flex-col items-center space-y-2">
          {volumeProgress > 80 ? (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 px-4 py-2 rounded-full shadow-md">
              <Trophy className="w-5 h-5" />
              <span className="text-sm font-bold">Top Performer</span>
            </div>
          ) : volumeProgress > 60 ? (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-4 py-2 rounded-full shadow-md">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-bold">Rising Star</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-full shadow-md">
              <Target className="w-5 h-5" />
              <span className="text-sm font-bold">Steady</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
