import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Monitor, Users, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminDisplaySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: systemSettings, isLoading } = useQuery({
    queryKey: ["/api/system-settings"],
  });

  const getCurrentSetting = (key: string, defaultValue: string = "true") => {
    const setting = systemSettings?.find((s: any) => s.key === key);
    return setting?.value === "true";
  };

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return await apiRequest("PUT", `/api/system-settings/${key}`, { value });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      const settingNames = {
        showTeamRankings: "Team Rankings Visibility",
        enableTeams: "Teams Functionality"
      };
      
      toast({
        title: "Setting Updated",
        description: `${settingNames[variables.key as keyof typeof settingNames]} has been ${variables.value === "true" ? "enabled" : "disabled"}.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update display setting.",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: string, enabled: boolean) => {
    updateSettingMutation.mutate({
      key,
      value: enabled.toString(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Display Settings
        </h3>
        <p className="text-sm text-muted-foreground">
          Control what appears on the TV dashboard and manage team functionality
        </p>
      </div>

      {/* Team Rankings Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Team Rankings Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="show-team-rankings" className="text-base font-medium">
                Show Team Rankings
              </Label>
              <p className="text-sm text-muted-foreground">
                Display the team leaderboard panel on the TV dashboard
              </p>
            </div>
            <Switch
              id="show-team-rankings"
              checked={getCurrentSetting("showTeamRankings")}
              onCheckedChange={(checked) =>
                handleSettingChange("showTeamRankings", checked)
              }
              disabled={updateSettingMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Teams Functionality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Teams Functionality
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="enable-teams" className="text-base font-medium">
                Enable Teams
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable the entire teams system across the application
              </p>
            </div>
            <Switch
              id="enable-teams"
              checked={getCurrentSetting("enableTeams")}
              onCheckedChange={(checked) =>
                handleSettingChange("enableTeams", checked)
              }
              disabled={updateSettingMutation.isPending}
            />
          </div>
          
          <Separator />
          
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-2">When teams are disabled:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Team rankings will be hidden from the dashboard</li>
              <li>Team management will be disabled in admin panel</li>
              <li>Agents will not be grouped by teams</li>
              <li>Team-based reports will be unavailable</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Dashboard Layout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-2">Current Layout:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Live Scoreboard: Table format with agent performance</li>
              <li>Team Rankings: {getCurrentSetting("showTeamRankings") ? "Visible" : "Hidden"}</li>
              <li>Teams System: {getCurrentSetting("enableTeams") ? "Enabled" : "Disabled"}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}