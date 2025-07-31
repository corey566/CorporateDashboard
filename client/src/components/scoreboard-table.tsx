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
import { useEffect, useRef, useState } from "react";

interface ScoreboardTableProps {
  agents: any[];
}

export default function ScoreboardTable({ agents }: ScoreboardTableProps) {
  const { formatCurrency } = useCurrency();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // Row-based auto-scroll functionality - first row moves to last
  const [visibleAgents, setVisibleAgents] = useState(agents);

  useEffect(() => {
    setVisibleAgents(agents);
  }, [agents]);

  useEffect(() => {
    if (visibleAgents.length <= 2) {
      setIsAutoScrolling(false);
      return;
    }

    setIsAutoScrolling(true);
    console.log('Starting row rotation with', visibleAgents.length, 'agents');
    
    const rotateRows = () => {
      console.log('Rotating rows...');
      setVisibleAgents(prevAgents => {
        if (prevAgents.length <= 1) return prevAgents;
        
        // Move first row to last position
        const [firstAgent, ...restAgents] = prevAgents;
        const newOrder = [...restAgents, firstAgent];
        console.log('New order:', newOrder.map(a => a.name));
        return newOrder;
      });
    };

    // Start rotation after 3 seconds, then every 3 seconds
    let intervalId: NodeJS.Timeout;
    const startTimeout = setTimeout(() => {
      console.log('Starting interval for row rotation');
      intervalId = setInterval(rotateRows, 3000);
    }, 3000);

    return () => {
      console.log('Cleaning up row rotation');
      clearTimeout(startTimeout);
      if (intervalId) clearInterval(intervalId);
      setIsAutoScrolling(false);
    };
  }, [visibleAgents.length]);

  return (
    <div className="h-full">
      {/* Elegant Header */}
      <div className="bg-gray-50 dark:bg-slate-900/50 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-6xl font-black text-gray-900 dark:text-white">
              Sales Leaderboard
            </h2>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">
              Real-time performance tracking
            </p>
          </div>
          {isAutoScrolling && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-2xl font-black">Auto-Scrolling</span>
            </div>
          )}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="overflow-hidden custom-scrollbar"
        style={{ height: "calc(100% - 80px)" }}
      >
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-900/50">
              <TableHead className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-wider py-3 px-6 text-center">
                Agent
              </TableHead>
              <TableHead className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-wider py-3 px-6 text-center">
                Progress
              </TableHead>
              <TableHead className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-wider py-3 px-6 text-center">
                Volume/Units
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleAgents.map((agent: any, index: number) => {
              return (
                <TableRow
                  key={`${agent.id}-${index}`}
                  className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all duration-500"
                >
                  {/* Agent Info */}
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {agent.photo ? (
                          <img
                            src={agent.photo}
                            alt={agent.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-200 dark:border-slate-600">
                            <span className="text-lg font-semibold text-white">
                              {agent.name?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
                            agent.isActive ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        ></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-4xl font-black text-gray-900 dark:text-white truncate">
                          {agent.name}
                        </h3>
                        <p className="text-2xl font-bold text-gray-500 dark:text-gray-400 truncate">
                          {agent.teamName || "Unassigned"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Progress Bars */}
                  <TableCell className="py-4 px-6">
                    <div className="space-y-3">
                      {/* Volume Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-2xl font-black text-gray-600 dark:text-gray-400">
                            Volume
                          </span>
                          <span className="text-2xl font-black text-gray-900 dark:text-white">
                            {Math.round(
                              (parseFloat(agent.currentVolume || "0") /
                                parseFloat(agent.volumeTarget || "1")) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              Math.min(
                                (parseFloat(agent.currentVolume || "0") /
                                  parseFloat(agent.volumeTarget || "1")) *
                                  100,
                                100,
                              ) >= 100
                                ? "bg-emerald-500"
                                : Math.min(
                                      (parseFloat(agent.currentVolume || "0") /
                                        parseFloat(agent.volumeTarget || "1")) *
                                        100,
                                      100,
                                    ) >= 75
                                  ? "bg-blue-500"
                                  : Math.min(
                                        (parseFloat(
                                          agent.currentVolume || "0",
                                        ) /
                                          parseFloat(
                                            agent.volumeTarget || "1",
                                          )) *
                                          100,
                                        100,
                                      ) >= 50
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                (parseFloat(agent.currentVolume || "0") /
                                  parseFloat(agent.volumeTarget || "1")) *
                                  100,
                                100,
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      {/* Units Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-2xl font-black text-gray-600 dark:text-gray-400">
                            Units
                          </span>
                          <span className="text-2xl font-black text-gray-900 dark:text-white">
                            {Math.round(
                              ((agent.currentUnits || 0) /
                                (agent.unitsTarget || 1)) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              Math.min(
                                ((agent.currentUnits || 0) /
                                  (agent.unitsTarget || 1)) *
                                  100,
                                100,
                              ) >= 100
                                ? "bg-emerald-500"
                                : Math.min(
                                      ((agent.currentUnits || 0) /
                                        (agent.unitsTarget || 1)) *
                                        100,
                                      100,
                                    ) >= 75
                                  ? "bg-blue-500"
                                  : Math.min(
                                        ((agent.currentUnits || 0) /
                                          (agent.unitsTarget || 1)) *
                                          100,
                                        100,
                                      ) >= 50
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                ((agent.currentUnits || 0) /
                                  (agent.unitsTarget || 1)) *
                                  100,
                                100,
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Current Volume/Units */}
                  <TableCell className="py-4 px-6 text-center">
                    <div className="space-y-2">
                      <div className="text-4xl font-black text-gray-900 dark:text-white">
                        {formatCurrency(agent.currentVolume || "0")} /{" "}
                        {agent.currentUnits || 0}
                      </div>
                      <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                        Target: {formatCurrency(agent.volumeTarget || "0")} /{" "}
                        {agent.unitsTarget || 0}
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
