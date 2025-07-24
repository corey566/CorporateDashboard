import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/use-currency";

interface AgentCardProps {
  agent: any;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const { formatCurrency } = useCurrency();
  const volumeProgress = (parseFloat(agent.currentVolume || 0) / parseFloat(agent.volumeTarget)) * 100;
  const unitsProgress = (agent.currentUnits || 0) / agent.unitsTarget * 100;

  return (
    <div className="bg-card border-2 border-border rounded-xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Player Header with Rank and Team */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-accent to-accent-foreground rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-black">#{agent.rank || 1}</span>
          </div>
          <Badge variant="secondary" className="text-sm font-bold px-3 py-1 bg-primary/20 text-primary">
            {agent.team?.name || 'Team'}
          </Badge>
        </div>
        <Badge variant="outline" className="text-xs font-semibold px-2 py-1">
          {agent.category}
        </Badge>
      </div>

      {/* Player Info */}
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={agent.photo || `https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150`}
          alt={agent.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-border shadow-md"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-foreground text-2xl truncate">{agent.name}</h3>
          <div className="text-sm text-muted-foreground font-semibold">
            Active Player
          </div>
        </div>
      </div>

      {/* Scoreboard Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Volume Score */}
        <div className="text-center bg-primary/10 rounded-lg p-3">
          <div className="text-xs font-bold text-muted-foreground mb-1">VOLUME</div>
          <div className="text-2xl font-black text-primary mb-1">
            {formatCurrency(agent.currentVolume || 0)}
          </div>
          <div className="text-xs text-muted-foreground mb-1">
            Target: {formatCurrency(agent.volumeTarget)}
          </div>
          <div className="text-lg font-black text-accent">
            {Math.round(volumeProgress)}%
          </div>
        </div>

        {/* Units Score */}
        <div className="text-center bg-accent/10 rounded-lg p-3">
          <div className="text-xs font-bold text-muted-foreground mb-1">UNITS</div>
          <div className="text-2xl font-black text-accent mb-1">
            {agent.currentUnits || 0}
          </div>
          <div className="text-xs text-muted-foreground mb-1">
            Target: {agent.unitsTarget}
          </div>
          <div className="text-lg font-black text-primary">
            {Math.round(unitsProgress)}%
          </div>
        </div>
      </div>
    </div>
  );
}
