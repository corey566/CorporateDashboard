import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Target } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";

interface AgentCardProps {
  agent: any;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const { formatCurrency } = useCurrency();
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
    <div className="bg-card border-2 border-border rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-card to-card/90">
      <div className="flex flex-col lg:flex-row lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
        {/* Agent Photo and Basic Info */}
        <div className="flex items-center space-x-6 min-w-0 flex-1">
          <div className="relative">
            <img
              src={agent.photo || `https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200`}
              alt={agent.name}
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover border-4 border-primary/20 shadow-xl ring-4 ring-primary/10"
            />
            <div className="absolute -top-2 -right-2 lg:-top-3 lg:-right-3 w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-accent to-accent-foreground rounded-full flex items-center justify-center shadow-xl ring-2 ring-white">
              <span className="text-white text-sm lg:text-lg font-bold">#{agent.rank || 1}</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 lg:w-8 lg:h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <div className="w-2 h-2 lg:w-3 lg:h-3 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-foreground text-2xl lg:text-3xl truncate mb-2">{agent.name}</h3>
            <div className="flex flex-col space-y-2">
              <Badge variant="secondary" className="text-sm lg:text-base font-bold px-4 py-2 bg-primary/15 text-primary w-fit">
                🏆 {agent.team?.name || 'Team'}
              </Badge>
              <Badge variant="outline" className="text-sm lg:text-base font-medium px-3 py-1 w-fit">
                {agent.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Progress Bars - TV Optimized */}
        <div className="flex-1 space-y-6 lg:space-y-8">
          {/* Sales Volume Progress */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-xl border border-primary/20">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg lg:text-xl font-black text-foreground">💰 Volume</span>
              <div className="text-right">
                <div className="text-lg lg:text-xl font-black text-primary">
                  {formatCurrency(agent.currentVolume || 0)}
                </div>
                <div className="text-sm lg:text-base text-muted-foreground font-semibold">
                  / {formatCurrency(agent.volumeTarget)}
                </div>
              </div>
            </div>
            <div className="w-full bg-muted/60 rounded-full h-6 lg:h-8 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-primary via-primary to-primary/80 h-6 lg:h-8 rounded-full transition-all duration-1000 shadow-lg relative overflow-hidden"
                style={{ width: `${Math.min(100, volumeProgress)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="text-base lg:text-lg font-bold text-primary mt-2 text-center">
              {Math.round(volumeProgress)}% Complete
            </div>
          </div>

          {/* Sales Quantity Progress */}
          <div className="bg-gradient-to-r from-accent/5 to-accent/10 p-4 rounded-xl border border-accent/20">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg lg:text-xl font-black text-foreground">📊 Units</span>
              <div className="text-right">
                <div className="text-lg lg:text-xl font-black text-accent">
                  {agent.currentUnits || 0}
                </div>
                <div className="text-sm lg:text-base text-muted-foreground font-semibold">
                  / {agent.unitsTarget}
                </div>
              </div>
            </div>
            <div className="w-full bg-muted/60 rounded-full h-6 lg:h-8 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-accent via-accent to-accent/80 h-6 lg:h-8 rounded-full transition-all duration-1000 shadow-lg relative overflow-hidden"
                style={{ width: `${Math.min(100, unitsProgress)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="text-base lg:text-lg font-bold text-accent mt-2 text-center">
              {Math.round(unitsProgress)}% Complete
            </div>
          </div>
        </div>

        {/* Status Badge - TV Optimized */}
        <div className="flex flex-col items-center space-y-4">
          {volumeProgress > 80 ? (
            <div className="flex flex-col items-center space-y-2 bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-900 px-6 py-4 rounded-2xl shadow-xl border-2 border-yellow-400 animate-pulse">
              <Trophy className="w-8 h-8 lg:w-10 lg:h-10" />
              <span className="text-lg lg:text-xl font-black">🏆 TOP</span>
              <span className="text-sm lg:text-base font-bold">PERFORMER</span>
            </div>
          ) : volumeProgress > 60 ? (
            <div className="flex flex-col items-center space-y-2 bg-gradient-to-r from-green-200 to-green-300 text-green-900 px-6 py-4 rounded-2xl shadow-xl border-2 border-green-400">
              <TrendingUp className="w-8 h-8 lg:w-10 lg:h-10" />
              <span className="text-lg lg:text-xl font-black">⭐ RISING</span>
              <span className="text-sm lg:text-base font-bold">STAR</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-900 px-6 py-4 rounded-2xl shadow-xl border-2 border-blue-400">
              <Target className="w-8 h-8 lg:w-10 lg:h-10" />
              <span className="text-lg lg:text-xl font-black">🎯 STEADY</span>
              <span className="text-sm lg:text-base font-bold">PROGRESS</span>
            </div>
          )}
          
          {/* Performance Level Indicator */}
          <div className="text-center bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 rounded-xl border border-gray-300">
            <div className="text-2xl lg:text-3xl font-black text-gray-800">
              {Math.round(volumeProgress)}%
            </div>
            <div className="text-xs lg:text-sm font-bold text-gray-600">COMPLETE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
