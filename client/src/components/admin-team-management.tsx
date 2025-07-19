import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTeamSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, Trophy, Target } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";

const teamFormSchema = insertTeamSchema.extend({
  volumeTarget: z.string().min(1, "Volume target is required").transform(val => parseFloat(val)),
  unitsTarget: z.string().min(1, "Units target is required").transform(val => parseInt(val)),
  targetCycle: z.string().default("monthly"),
  resetDay: z.string().default("1").transform(val => parseInt(val)),
  resetMonth: z.string().optional().transform(val => val ? parseInt(val) : 1),
});

type TeamFormData = z.infer<typeof teamFormSchema>;

export default function AdminTeamManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const { toast } = useToast();

  const { data: teams, isLoading } = useQuery({
    queryKey: ["/api/teams"],
    refetchInterval: 5000,
  });

  const { data: agents } = useQuery({
    queryKey: ["/api/agents"],
  });

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      color: "#3B82F6",
      volumeTarget: "",
      unitsTarget: "",
      targetCycle: "monthly",
      resetDay: "1",
      resetMonth: "1",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TeamFormData) => {
      const teamData = {
        ...data,
        volumeTarget: data.volumeTarget,
        unitsTarget: data.unitsTarget,
      };
      return apiRequest("POST", "/api/teams", teamData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Team created successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TeamFormData }) => {
      const teamData = {
        ...data,
        volumeTarget: data.volumeTarget,
        unitsTarget: data.unitsTarget,
      };
      return apiRequest("PUT", `/api/teams/${id}`, teamData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Team updated successfully",
      });
      setIsDialogOpen(false);
      setEditingTeam(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/teams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (team: any) => {
    setEditingTeam(team);
    form.reset({
      name: team.name,
      color: team.color,
      volumeTarget: team.volumeTarget.toString(),
      unitsTarget: team.unitsTarget.toString(),
      targetCycle: team.targetCycle || "monthly",
      resetDay: (team.resetDay || 1).toString(),
      resetMonth: (team.resetMonth || 1).toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: TeamFormData) => {
    if (editingTeam) {
      updateMutation.mutate({ id: editingTeam.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    const teamAgents = agents?.filter((agent: any) => agent.teamId === id);
    if (teamAgents && teamAgents.length > 0) {
      toast({
        title: "Cannot Delete Team",
        description: "Please reassign or remove all agents from this team first.",
        variant: "destructive",
      });
      return;
    }
    
    if (confirm("Are you sure you want to delete this team?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary" />
            Team Management
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingTeam(null);
                  form.reset();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTeam ? "Edit Team" : "Add New Team"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Team Name</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Enter team name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="color">Team Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="color"
                      type="color"
                      {...form.register("color")}
                      className="w-20 h-10"
                    />
                    <Input
                      {...form.register("color")}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                  {form.formState.errors.color && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.color.message}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="volumeTarget">Volume Target ($)</Label>
                    <Input
                      id="volumeTarget"
                      type="number"
                      {...form.register("volumeTarget")}
                      placeholder="100000"
                    />
                    {form.formState.errors.volumeTarget && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.volumeTarget.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="unitsTarget">Units Target</Label>
                    <Input
                      id="unitsTarget"
                      type="number"
                      {...form.register("unitsTarget")}
                      placeholder="50"
                    />
                    {form.formState.errors.unitsTarget && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.unitsTarget.message}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Target Cycle Configuration */}
                <div className="border-t pt-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Target Cycle Settings</h3>
                    <p className="text-sm text-gray-600">Configure how often targets reset for this team</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="targetCycle">Target Cycle</Label>
                      <Select
                        value={form.watch("targetCycle")}
                        onValueChange={(value) => form.setValue("targetCycle", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cycle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.targetCycle && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.targetCycle.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="resetDay">
                        {form.watch("targetCycle") === "yearly" ? "Day of Year" : "Day of Month"}
                      </Label>
                      <Input
                        id="resetDay"
                        type="number"
                        min="1"
                        max={form.watch("targetCycle") === "yearly" ? "366" : "31"}
                        {...form.register("resetDay")}
                        placeholder="1"
                      />
                      {form.formState.errors.resetDay && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.resetDay.message}
                        </p>
                      )}
                    </div>
                    
                    {form.watch("targetCycle") === "yearly" && (
                      <div>
                        <Label htmlFor="resetMonth">Month</Label>
                        <Input
                          id="resetMonth"
                          type="number"
                          min="1"
                          max="12"
                          {...form.register("resetMonth")}
                          placeholder="1"
                        />
                        {form.formState.errors.resetMonth && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.resetMonth.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingTeam ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Volume Target</TableHead>
                <TableHead>Units Target</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams?.map((team: any) => {
                const teamAgents = agents?.filter((agent: any) => agent.teamId === team.id) || [];
                return (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        <div>
                          <p className="font-semibold text-corporate-800">{team.name}</p>
                          <p className="text-xs text-corporate-500">Team ID: {team.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-corporate-500" />
                        <span className="text-sm">{teamAgents.length} agents</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span>${parseFloat(team.volumeTarget).toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span>{team.unitsTarget} units</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(team)}
                        >
                          <Edit className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(team.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {(!teams || teams.length === 0) && (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No teams created yet</p>
            <p className="text-sm text-gray-400">Create your first team to get started with agent management</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}