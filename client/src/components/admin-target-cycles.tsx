import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw, History, RotateCcw, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCurrency } from "@/hooks/use-currency";

export default function AdminTargetCycles() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ["/api/agents"],
    refetchInterval: 30000,
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["/api/teams"],
    refetchInterval: 30000,
  });

  const { data: agentHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/agents", selectedAgent?.id, "target-history"],
    enabled: !!selectedAgent,
  });

  const { data: teamHistory, isLoading: teamHistoryLoading } = useQuery({
    queryKey: ["/api/teams", selectedTeam?.id, "target-history"],
    enabled: !!selectedTeam,
  });

  const initializeCyclesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/target-cycles/initialize");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Success",
        description: "Target cycles initialized successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize cycles",
        variant: "destructive",
      });
    },
  });

  const resetCyclesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/target-cycles/reset");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Success",
        description: "Target cycles reset successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset cycles",
        variant: "destructive",
      });
    },
  });

  const getNextResetDate = (cycle: string, resetDay: number, resetMonth?: number) => {
    const now = new Date();
    let nextReset: Date;

    if (cycle === "yearly") {
      nextReset = new Date(now.getFullYear(), (resetMonth || 1) - 1, resetDay);
      if (nextReset <= now) {
        nextReset = new Date(now.getFullYear() + 1, (resetMonth || 1) - 1, resetDay);
      }
    } else {
      nextReset = new Date(now.getFullYear(), now.getMonth(), resetDay);
      if (nextReset <= now) {
        nextReset = new Date(now.getFullYear(), now.getMonth() + 1, resetDay);
      }
    }

    return nextReset.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (agentsLoading || teamsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Target Cycle Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={() => initializeCyclesMutation.mutate()}
              disabled={initializeCyclesMutation.isPending}
              className="flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Initialize Cycles
            </Button>
            <Button
              onClick={() => resetCyclesMutation.mutate()}
              disabled={resetCyclesMutation.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Cycles
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agent Cycles */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Target Cycles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Cycle Type</TableHead>
                <TableHead>Next Reset</TableHead>
                <TableHead>Current Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents?.map((agent: any) => {
                const team = teams?.find((t: any) => t.id === agent.teamId);
                const nextReset = getNextResetDate(
                  agent.targetCycle || "monthly",
                  agent.resetDay || 1,
                  agent.resetMonth
                );

                return (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={agent.photo || `https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32`}
                          alt={agent.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="font-medium">{agent.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{team?.name || "Unknown"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {agent.targetCycle || "Monthly"}
                      </Badge>
                    </TableCell>
                    <TableCell>{nextReset}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          Volume: {formatCurrency(agent.currentVolume || 0)} / {formatCurrency(agent.volumeTarget)}
                        </div>
                        <div className="text-sm">
                          Units: {agent.currentUnits || 0} / {agent.unitsTarget}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAgent(agent)}
                          >
                            <History className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Target History - {agent.name}</DialogTitle>
                          </DialogHeader>
                          <div className="max-h-96 overflow-y-auto">
                            {historyLoading ? (
                              <div className="flex items-center justify-center p-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Achieved</TableHead>
                                    <TableHead>Achievement %</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {agentHistory?.map((record: any) => (
                                    <TableRow key={record.id}>
                                      <TableCell>
                                        {new Date(record.periodStart).toLocaleDateString()} - {new Date(record.periodEnd).toLocaleDateString()}
                                      </TableCell>
                                      <TableCell>
                                        <div className="space-y-1">
                                          <div>{formatCurrency(record.volumeTarget)}</div>
                                          <div>{record.unitsTarget} units</div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="space-y-1">
                                          <div>{formatCurrency(record.volumeAchieved)}</div>
                                          <div>{record.unitsAchieved} units</div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="space-y-1">
                                          <div>{((record.volumeAchieved / record.volumeTarget) * 100).toFixed(1)}%</div>
                                          <div>{((record.unitsAchieved / record.unitsTarget) * 100).toFixed(1)}%</div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Team Cycles */}
      <Card>
        <CardHeader>
          <CardTitle>Team Target Cycles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Cycle Type</TableHead>
                <TableHead>Next Reset</TableHead>
                <TableHead>Current Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams?.map((team: any) => {
                const nextReset = getNextResetDate(
                  team.targetCycle || "monthly",
                  team.resetDay || 1,
                  team.resetMonth
                );

                return (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium text-sm">
                            {team.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{team.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {team.targetCycle || "Monthly"}
                      </Badge>
                    </TableCell>
                    <TableCell>{nextReset}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          Volume: {formatCurrency(team.currentVolume || 0)} / {formatCurrency(team.volumeTarget)}
                        </div>
                        <div className="text-sm">
                          Units: {team.currentUnits || 0} / {team.unitsTarget}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTeam(team)}
                          >
                            <History className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Target History - {team.name}</DialogTitle>
                          </DialogHeader>
                          <div className="max-h-96 overflow-y-auto">
                            {teamHistoryLoading ? (
                              <div className="flex items-center justify-center p-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Achieved</TableHead>
                                    <TableHead>Achievement %</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {teamHistory?.map((record: any) => (
                                    <TableRow key={record.id}>
                                      <TableCell>
                                        {new Date(record.periodStart).toLocaleDateString()} - {new Date(record.periodEnd).toLocaleDateString()}
                                      </TableCell>
                                      <TableCell>
                                        <div className="space-y-1">
                                          <div>{formatCurrency(record.volumeTarget)}</div>
                                          <div>{record.unitsTarget} units</div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="space-y-1">
                                          <div>{formatCurrency(record.volumeAchieved)}</div>
                                          <div>{record.unitsAchieved} units</div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="space-y-1">
                                          <div>{((record.volumeAchieved / record.volumeTarget) * 100).toFixed(1)}%</div>
                                          <div>{((record.unitsAchieved / record.unitsTarget) * 100).toFixed(1)}%</div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}