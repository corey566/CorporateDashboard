import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/hooks/use-currency";

interface ScoreboardTableProps {
  agents: any[];
}

export default function ScoreboardTable({ agents }: ScoreboardTableProps) {
  const { formatCurrency } = useCurrency();

  return (
    <div className="w-full">
      <div className="bg-card rounded-2xl border-2 border-border shadow-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b-2 border-border">
              <TableHead className="text-4xl font-black text-foreground py-2 px-6">
                AGENT
              </TableHead>
              <TableHead className="text-4xl font-black text-foreground py-2 px-6 text-center">
                PROGRESS
              </TableHead>
              <TableHead className="text-4xl font-black text-foreground py-2 px-6 text-center">
                VOLUME/UNITS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent: any, index: number) => {
              return (
                <TableRow
                  key={agent.id}
                  className={`border-b border-border hover:bg-muted/30 transition-colors ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/10"
                  }`}
                >
                  {/* Agent Info */}
                  <TableCell className="py-1 px-6">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        {agent.photo ? (
                          <img
                            src={agent.photo}
                            alt={agent.name}
                            className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/20">
                            <span className="text-2xl font-black text-primary">
                              {agent.name?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                        <div
                          className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-background ${
                            agent.isActive ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-foreground">
                          {agent.name}
                        </h3>
                        <p className="text-xl font-bold text-muted-foreground">
                          Team: {agent.teamName || "Unassigned"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Progress Bars */}
                  <TableCell className="py-1 px-6">
                    <div className="space-y-2">
                      {/* Volume Progress */}
                      <div>
                        <div className="flex justify-between text-sm font-bold text-foreground mb-1">
                          <span>Volume</span>
                          <span>{Math.round((parseFloat(agent.currentVolume || "0") / parseFloat(agent.volumeTarget || "1")) * 100)}%</span>
                        </div>
                        <Progress 
                          value={Math.min((parseFloat(agent.currentVolume || "0") / parseFloat(agent.volumeTarget || "1")) * 100, 100)} 
                          className="h-3" 
                        />
                      </div>
                      {/* Units Progress */}
                      <div>
                        <div className="flex justify-between text-sm font-bold text-foreground mb-1">
                          <span>Units</span>
                          <span>{Math.round(((agent.currentUnits || 0) / (agent.unitsTarget || 1)) * 100)}%</span>
                        </div>
                        <Progress 
                          value={Math.min(((agent.currentUnits || 0) / (agent.unitsTarget || 1)) * 100, 100)} 
                          className="h-3" 
                        />
                      </div>
                    </div>
                  </TableCell>

                  {/* Current Volume/Units */}
                  <TableCell className="py-1 px-6 text-center">
                    <div className="space-y-1">
                      <div className="text-3xl font-black text-foreground">
                        {formatCurrency(agent.currentVolume || "0")} / {agent.currentUnits || 0}
                      </div>
                      <div className="text-2xl font-bold text-muted-foreground">
                        Target: {formatCurrency(agent.volumeTarget || "0")} / {agent.unitsTarget || 0}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}