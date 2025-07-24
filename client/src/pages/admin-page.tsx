import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Monitor,
  Users,
  TrendingUp,
  Gift,
  LogOut,
  ShieldQuestion,
  UsersIcon,
  UserPlus,
  Megaphone,
  Image,
  FolderOpen,
  Volume2,
} from "lucide-react";
import AdminTeamManagement from "@/components/admin-team-management";
import AdminAgentManagement from "@/components/admin-agent-management";
import AdminSalesEntry from "@/components/admin-sales-entry";
import AdminCashOffers from "@/components/admin-cash-offers";
import AdminAnnouncements from "@/components/admin-announcements";
import AdminMedia from "@/components/admin-media";
import AdminFileManager from "@/components/admin-file-manager";
import AdminSoundEffects from "@/components/admin-sound-effects";
import AdminReports from "@/components/admin-reports";
import AdminTargetCycles from "@/components/admin-target-cycles";
import UICustomization from "@/components/ui-customization";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";

export default function AdminPage() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { isConnected, lastMessage } = useWebSocket();
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    refetchInterval: 5000,
  });

  // Handle WebSocket currency updates
  useEffect(() => {
    if (lastMessage?.type === "currency_updated") {
      console.log("Currency update received in admin panel, refreshing data...");
      // Invalidate all relevant queries without page reload
      queryClient.invalidateQueries({ queryKey: ["/api/currency-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
    }
  }, [lastMessage, queryClient]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-corporate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-corporate-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalAgents: dashboardData?.agents?.length || 0,
    activeTeams: dashboardData?.teams?.length || 0,
    todaysSales:
      dashboardData?.sales?.reduce((sum: number, sale: any) => {
        const today = new Date().toDateString();
        const saleDate = new Date(sale.createdAt).toDateString();
        return today === saleDate ? sum + parseFloat(sale.amount) : sum;
      }, 0) || 0,
    activeOffers: dashboardData?.cashOffers?.length || 0,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card shadow-lg border-b border-border px-4 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <ShieldQuestion className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                Admin Panel
              </h1>
              <p className="text-muted-foreground">Sales Leaderboard Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isConnected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </div>

            <ThemeToggle />

            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Monitor className="w-4 h-4" />
              TV Dashboard
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>

            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm">{user?.username}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Agents</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalAgents}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Teams</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.activeTeams}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Today's Sales</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${stats.todaysSales.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-md">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Offers</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.activeOffers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-md">
                  <Gift className="w-6 h-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-11">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="sales">Sales Entry</TabsTrigger>
            <TabsTrigger value="offers">Cash Offers</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="sounds">Sounds</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="cycles">Target Cycles</TabsTrigger>
            <TabsTrigger value="customization">UI</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-6">
            <AdminTeamManagement />
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <AdminAgentManagement />
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <AdminSalesEntry />
          </TabsContent>

          <TabsContent value="offers" className="space-y-6">
            <AdminCashOffers />
          </TabsContent>

          <TabsContent value="announcements" className="space-y-6">
            <AdminAnnouncements />
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <AdminMedia />
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <AdminFileManager />
          </TabsContent>

          <TabsContent value="sounds" className="space-y-6">
            <AdminSoundEffects />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <AdminReports />
          </TabsContent>

          <TabsContent value="cycles" className="space-y-6">
            <AdminTargetCycles />
          </TabsContent>

          <TabsContent value="customization" className="space-y-6">
            <UICustomization />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
