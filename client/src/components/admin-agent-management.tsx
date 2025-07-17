import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAgentSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { z } from "zod";

const agentFormSchema = insertAgentSchema.omit({
  teamId: true,
  volumeTarget: true,
  unitsTarget: true,
  resetDay: true,
  resetMonth: true,
}).extend({
  teamId: z.string().min(1, "Team is required").transform(val => parseInt(val)),
  volumeTarget: z.string().min(1, "Volume target is required").transform(val => parseFloat(val)),
  unitsTarget: z.string().min(1, "Units target is required").transform(val => parseInt(val)),
  targetCycle: z.enum(["monthly", "yearly"]).default("monthly"),
  resetDay: z.string().min(1, "Reset day is required").transform(val => parseInt(val)),
  resetMonth: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  username: z.string().optional(),
  password: z.string().optional(),
  canSelfReport: z.boolean().default(false),
});

type AgentFormData = z.infer<typeof agentFormSchema>;

export default function AdminAgentManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const { toast } = useToast();

  const { data: agents, isLoading } = useQuery({
    queryKey: ["/api/agents"],
    refetchInterval: 5000,
  });

  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
  });

  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: "",
      photo: "",
      teamId: "",
      category: "",
      volumeTarget: "",
      unitsTarget: "",
      targetCycle: "monthly",
      resetDay: "1",
      resetMonth: "1",
      username: "",
      password: "",
      canSelfReport: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      const agentData = {
        ...data,
        // Only include auth fields if provided
        username: data.username || undefined,
        password: data.password || undefined,
      };
      return apiRequest("POST", "/api/agents", agentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Agent created successfully",
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
    mutationFn: async ({ id, data }: { id: number; data: AgentFormData }) => {
      const agentData = {
        ...data,
        // Only include auth fields if provided
        username: data.username || undefined,
        password: data.password || undefined,
      };
      return apiRequest("PUT", `/api/agents/${id}`, agentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Agent updated successfully",
      });
      setIsDialogOpen(false);
      setEditingAgent(null);
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
      return apiRequest("DELETE", `/api/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Agent deleted successfully",
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

  const handleEdit = (agent: any) => {
    setEditingAgent(agent);
    form.reset({
      name: agent.name,
      photo: agent.photo || "",
      teamId: agent.teamId.toString(),
      category: agent.category,
      volumeTarget: agent.volumeTarget.toString(),
      unitsTarget: agent.unitsTarget.toString(),
      targetCycle: agent.targetCycle || "monthly",
      resetDay: agent.resetDay?.toString() || "1",
      resetMonth: agent.resetMonth?.toString() || "1",
      username: agent.username || "",
      password: "",
      canSelfReport: agent.canSelfReport || false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: AgentFormData) => {
    if (editingAgent) {
      updateMutation.mutate({ id: editingAgent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this agent?")) {
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
          <CardTitle>Agent Management</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingAgent(null);
                  form.reset();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAgent ? "Edit Agent" : "Add New Agent"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Agent name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="photo">Photo URL</Label>
                    <Input
                      id="photo"
                      {...form.register("photo")}
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teamId">Team</Label>
                    <Select
                      value={form.watch("teamId")}
                      onValueChange={(value) => form.setValue("teamId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams?.map((team: any) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.teamId && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.teamId.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={form.watch("category")}
                      onValueChange={(value) => form.setValue("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="Hardware">Hardware</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.category && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.category.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="volumeTarget">Volume Target ($)</Label>
                    <Input
                      id="volumeTarget"
                      type="number"
                      {...form.register("volumeTarget")}
                      placeholder="35000"
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
                      placeholder="20"
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
                    <p className="text-sm text-gray-600">Configure how often targets reset for this agent</p>
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
                        <Select
                          value={form.watch("resetMonth")}
                          onValueChange={(value) => form.setValue("resetMonth", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">January</SelectItem>
                            <SelectItem value="2">February</SelectItem>
                            <SelectItem value="3">March</SelectItem>
                            <SelectItem value="4">April</SelectItem>
                            <SelectItem value="5">May</SelectItem>
                            <SelectItem value="6">June</SelectItem>
                            <SelectItem value="7">July</SelectItem>
                            <SelectItem value="8">August</SelectItem>
                            <SelectItem value="9">September</SelectItem>
                            <SelectItem value="10">October</SelectItem>
                            <SelectItem value="11">November</SelectItem>
                            <SelectItem value="12">December</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.resetMonth && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.resetMonth.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    {form.watch("targetCycle") === "monthly" 
                      ? `Targets will reset on day ${form.watch("resetDay") || 1} of each month`
                      : `Targets will reset on day ${form.watch("resetDay") || 1} of ${
                          ["", "January", "February", "March", "April", "May", "June", 
                           "July", "August", "September", "October", "November", "December"][
                            parseInt(form.watch("resetMonth")) || 1
                          ]
                        } each year`
                    }
                  </div>
                </div>
                
                {/* Mobile Authentication Section */}
                <div className="border-t pt-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Mobile App Access</h3>
                    <p className="text-sm text-gray-600">Configure mobile app login credentials for this agent</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username (Optional)</Label>
                      <Input
                        id="username"
                        {...form.register("username")}
                        placeholder="mobile_username"
                      />
                      {form.formState.errors.username && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="password">Password (Optional)</Label>
                      <Input
                        id="password"
                        type="password"
                        {...form.register("password")}
                        placeholder="Enter password"
                      />
                      {form.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <input
                        id="canSelfReport"
                        type="checkbox"
                        checked={form.watch("canSelfReport")}
                        onChange={(e) => form.setValue("canSelfReport", e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <Label htmlFor="canSelfReport" className="text-sm font-medium text-gray-700">
                        Allow self-reporting sales via mobile app
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Agent can record their own sales through the mobile app
                    </p>
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
                    {editingAgent ? "Update" : "Create"}
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
                <TableHead>Agent</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Volume Target</TableHead>
                <TableHead>Units Target</TableHead>
                <TableHead>Target Cycle</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents?.map((agent: any) => {
                const team = teams?.find((t: any) => t.id === agent.teamId);
                return (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={agent.photo || `https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50`}
                          alt={agent.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-corporate-800">{agent.name}</p>
                          <p className="text-xs text-corporate-500">{agent.category}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-primary text-white">
                        {team?.name || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>{agent.category}</TableCell>
                    <TableCell>${parseFloat(agent.volumeTarget).toLocaleString()}</TableCell>
                    <TableCell>{agent.unitsTarget}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium capitalize">{agent.targetCycle || "Monthly"}</div>
                        <div className="text-gray-500">
                          {agent.targetCycle === "yearly" 
                            ? `Reset: Day ${agent.resetDay || 1} of ${
                                ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                                 "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
                                  agent.resetMonth || 1
                                ]
                              }`
                            : `Reset: Day ${agent.resetDay || 1}`
                          }
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(agent)}
                        >
                          <Edit className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(agent.id)}
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
      </CardContent>
    </Card>
  );
}
