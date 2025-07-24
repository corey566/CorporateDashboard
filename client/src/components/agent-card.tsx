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
    <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Agent Photo and Basic Info */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={agent.photo || `https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150`}
              alt={agent.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-border shadow-xl"
            />
            <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r from-accent to-accent-foreground rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-black">#{agent.rank || 1}</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-foreground text-4xl mb-2 truncate">{agent.name}</h3>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-xl font-bold px-4 py-2 bg-primary/20 text-primary">
                {agent.team?.name || 'Team'}
              </Badge>
              <Badge variant="outline" className="text-lg font-semibold px-3 py-2">
                {agent.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Performance Numbers - Large and Bold */}
        <div className="flex items-center space-x-12">
          {/* Volume Performance */}
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground mb-2">VOLUME</div>
            <div className="text-5xl font-black text-primary mb-2">
              {formatCurrency(agent.currentVolume || 0)}
            </div>
            <div className="text-2xl font-bold text-muted-foreground mb-2">
              Target: {formatCurrency(agent.volumeTarget)}
            </div>
            <div className="text-3xl font-black text-accent">
              {Math.round(volumeProgress)}% COMPLETE
            </div>
          </div>

          {/* Units Performance */}
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground mb-2">UNITS</div>
            <div className="text-5xl font-black text-accent mb-2">
              {agent.currentUnits || 0}
            </div>
            <div className="text-2xl font-bold text-muted-foreground mb-2">
              Target: {agent.unitsTarget}
            </div>
            <div className="text-3xl font-black text-primary">
              {Math.round(unitsProgress)}% COMPLETE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
