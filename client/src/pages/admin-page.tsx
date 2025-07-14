import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Users, TrendingUp, Gift, LogOut, ShieldQuestion, UsersIcon, UserPlus, Megaphone, Image } from "lucide-react";
import AdminTeamManagement from "@/components/admin-team-management";
import AdminAgentManagement from "@/components/admin-agent-management";
import AdminSalesEntry from "@/components/admin-sales-entry";
import AdminCashOffers from "@/components/admin-cash-offers";
import AdminAnnouncements from "@/components/admin-announcements";
import AdminMedia from "@/components/admin-media";
import UICustomization from "@/components/ui-customization";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";

export default function AdminPage() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { isConnected } = useWebSocket();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    refetchInterval: 5000,
  });

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
    todaysSales: dashboardData?.sales?.reduce((sum: number, sale: any) => {
      const today = new Date().toDateString();
      const saleDate = new Date(sale.createdAt).toDateString();
      return today === saleDate ? sum + parseFloat(sale.amount) : sum;
    }, 0) || 0,
    activeOffers: dashboardData?.cashOffers?.length || 0,
  };

  return (
    <div className="min-h-screen bg-corporate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-corporate-100 px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <ShieldQuestion className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-corporate-800">Admin Panel</h1>
              <p className="text-corporate-500">Sales Leaderboard Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </div>
            
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="bg-primary text-white hover:bg-secondary border-primary"
            >
              <Monitor className="w-4 h-4 mr-2" />
              TV Dashboard
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-corporate-600 hover:text-corporate-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            
            <div className="flex items-center space-x-2 text-corporate-600">
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-corporate-500 text-sm">Total Agents</p>
                  <p className="text-2xl font-bold text-corporate-800">{stats.totalAgents}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-corporate-500 text-sm">Active Teams</p>
                  <p className="text-2xl font-bold text-corporate-800">{stats.activeTeams}</p>
                </div>
                <Users className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-corporate-500 text-sm">Today's Sales</p>
                  <p className="text-2xl font-bold text-corporate-800">
                    ${stats.todaysSales.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-corporate-500 text-sm">Active Offers</p>
                  <p className="text-2xl font-bold text-corporate-800">{stats.activeOffers}</p>
                </div>
                <Gift className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="sales">Sales Entry</TabsTrigger>
            <TabsTrigger value="offers">Cash Offers</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
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
          
          <TabsContent value="customization" className="space-y-6">
            <UICustomization />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
