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
    <div className="h-full">
      {/* Elegant Header */}
      <div className="bg-gray-50 dark:bg-slate-900/50 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Sales Leaderboard
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Real-time performance tracking
        </p>
      </div>

      <div
        className="overflow-y-auto custom-scrollbar"
        style={{ height: "calc(100% - 80px)" }}
      >
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-900/50">
              <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-6">
                Agent
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-6 text-center">
                Progress
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-6 text-center">
                Volume/Units
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent: any, index: number) => {
              return (
                <TableRow
                  key={agent.id}
                  className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all duration-200"
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
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {agent.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
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
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Volume
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {Math.round(
                              (parseFloat(agent.currentVolume || "0") /
                                parseFloat(agent.volumeTarget || "1")) *
                                100,
                            )}%
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
                              ) >= 100 ? 'bg-emerald-500' : 
                              Math.min(
                                (parseFloat(agent.currentVolume || "0") /
                                  parseFloat(agent.volumeTarget || "1")) *
                                  100,
                                100,
                              ) >= 75 ? 'bg-blue-500' : 
                              Math.min(
                                (parseFloat(agent.currentVolume || "0") /
                                  parseFloat(agent.volumeTarget || "1")) *
                                  100,
                                100,
                              ) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(
                              (parseFloat(agent.currentVolume || "0") /
                                parseFloat(agent.volumeTarget || "1")) *
                                100,
                              100,
                            )}%` }}
                          ></div>
                        </div>
                      </div>
                      {/* Units Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Units
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {Math.round(
                              ((agent.currentUnits || 0) /
                                (agent.unitsTarget || 1)) *
                                100,
                            )}%
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
                              ) >= 100 ? 'bg-emerald-500' : 
                              Math.min(
                                ((agent.currentUnits || 0) /
                                  (agent.unitsTarget || 1)) *
                                  100,
                                100,
                              ) >= 75 ? 'bg-blue-500' : 
                              Math.min(
                                ((agent.currentUnits || 0) /
                                  (agent.unitsTarget || 1)) *
                                  100,
                                100,
                              ) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(
                              ((agent.currentUnits || 0) /
                                (agent.unitsTarget || 1)) *
                                100,
                              100,
                            )}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Current Volume/Units */}
                  <TableCell className="py-4 px-6 text-center">
                    <div className="space-y-2">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(agent.currentVolume || "0")} / {agent.currentUnits || 0}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
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
