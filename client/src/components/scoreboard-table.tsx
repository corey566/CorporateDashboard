import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/hooks/use-currency";
import { Progress } from "@/components/ui/progress";

interface ScoreboardTableProps {
  agents: any[];
}

export default function ScoreboardTable({ agents }: ScoreboardTableProps) {
  const { formatCurrency } = useCurrency();

  const getProgressValue = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-yellow-500";
    if (percentage >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-4xl font-black text-foreground mb-2">
          LIVE SCOREBOARD
        </h2>
        <div className="text-xl font-bold text-muted-foreground">
          {agents.length} Active Agents • Real-time Performance
        </div>
      </div>

      <div className="bg-card rounded-2xl border-2 border-border shadow-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b-2 border-border">
              <TableHead className="text-xl font-black text-foreground py-6 px-6">
                AGENT
              </TableHead>
              <TableHead className="text-xl font-black text-foreground py-6 px-6 text-center">
                VOLUME PROGRESS
              </TableHead>
              <TableHead className="text-xl font-black text-foreground py-6 px-6 text-center">
                UNITS PROGRESS
              </TableHead>
              <TableHead className="text-xl font-black text-foreground py-6 px-6 text-center">
                CATEGORY
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent: any, index: number) => {
              const volumeProgress = getProgressValue(
                parseFloat(agent.currentVolume || "0"),
                parseFloat(agent.volumeTarget || "0")
              );
              const unitsProgress = getProgressValue(
                agent.currentUnits || 0,
                agent.unitsTarget || 0
              );

              return (
                <TableRow
                  key={agent.id}
                  className={`border-b border-border hover:bg-muted/30 transition-colors ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/10"
                  }`}
                >
                  {/* Agent Info */}
                  <TableCell className="py-6 px-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {agent.photo ? (
                          <img
                            src={agent.photo}
                            alt={agent.name}
                            className="w-16 h-16 rounded-full object-cover border-4 border-primary/20"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/20">
                            <span className="text-2xl font-black text-primary">
                              {agent.name?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                        <div
                          className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background ${
                            agent.isActive ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-foreground">
                          {agent.name}
                        </h3>
                        <p className="text-lg font-bold text-muted-foreground">
                          ID: {agent.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Volume Progress */}
                  <TableCell className="py-6 px-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-foreground">
                          {formatCurrency(agent.currentVolume || "0")}
                        </span>
                        <span className="text-lg font-bold text-muted-foreground">
                          / {formatCurrency(agent.volumeTarget || "0")}
                        </span>
                      </div>
                      <div className="relative">
                        <Progress
                          value={volumeProgress}
                          className="h-4 bg-muted"
                        />
                        <div
                          className={`absolute top-0 left-0 h-4 rounded-full transition-all duration-300 ${getProgressColor(
                            volumeProgress
                          )}`}
                          style={{ width: `${volumeProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-black text-foreground">
                          {volumeProgress.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Units Progress */}
                  <TableCell className="py-6 px-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-foreground">
                          {agent.currentUnits || 0}
                        </span>
                        <span className="text-lg font-bold text-muted-foreground">
                          / {agent.unitsTarget || 0}
                        </span>
                      </div>
                      <div className="relative">
                        <Progress
                          value={unitsProgress}
                          className="h-4 bg-muted"
                        />
                        <div
                          className={`absolute top-0 left-0 h-4 rounded-full transition-all duration-300 ${getProgressColor(
                            unitsProgress
                          )}`}
                          style={{ width: `${unitsProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-black text-foreground">
                          {unitsProgress.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="py-6 px-6 text-center">
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-black ${
                        agent.category === "Hardware"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : agent.category === "Software"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      }`}
                    >
                      {agent.category}
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