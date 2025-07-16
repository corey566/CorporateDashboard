import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Users, TrendingUp, Target, Building2, LogOut, Settings, BarChart3 } from "lucide-react";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  companyId: number;
}

interface Company {
  id: number;
  name: string;
  email: string;
  companyId: string;
  logo?: string;
}

interface DashboardData {
  agents: any[];
  teams: any[];
  sales: any[];
  cashOffers: any[];
  stats: {
    totalSales: number;
    totalAgents: number;
    totalTeams: number;
    monthlyRevenue: number;
  };
}

export default function CompanyDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");
    const companyData = localStorage.getItem("company");
    
    if (!token || !userData || !companyData) {
      setLocation("/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
      setCompany(JSON.parse(companyData));
    } catch (error) {
      console.error("Error parsing user data:", error);
      setLocation("/login");
    }
  }, [setLocation]);

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["/api/company/dashboard"],
    enabled: !!user?.companyId,
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      return await apiRequest<DashboardData>("/api/company/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onError: (error: any) => {
      if (error.message.includes("401")) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive",
        });
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("company");
        setLocation("/login");
      }
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    setLocation("/login");
  };

  if (!user || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {company.logo && (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {company.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome back, {user.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">{user.role}</Badge>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">
              Error loading dashboard: {error.message}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.stats?.totalSales || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +2.5% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.stats?.totalAgents || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.agents?.filter(a => a.isActive).length || 0} active
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Teams</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.stats?.totalTeams || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.teams?.filter(t => t.isActive).length || 0} active
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    LKR {dashboardData?.stats?.monthlyRevenue?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12.5% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="dashboard" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="agents">
                  <Users className="h-4 w-4 mr-2" />
                  Agents
                </TabsTrigger>
                <TabsTrigger value="teams">
                  <Building2 className="h-4 w-4 mr-2" />
                  Teams
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Sales</CardTitle>
                      <CardDescription>
                        Latest sales transactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dashboardData?.sales?.slice(0, 5).map((sale, index) => (
                        <div key={sale.id || index} className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium">{sale.customerName || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{sale.productName || 'Product'}</p>
                          </div>
                          <p className="font-bold">LKR {sale.amount}</p>
                        </div>
                      )) || (
                        <p className="text-center py-4 text-muted-foreground">
                          No recent sales
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Cash Offers</CardTitle>
                      <CardDescription>
                        Current promotional offers
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dashboardData?.cashOffers?.filter(offer => offer.isActive).map((offer, index) => (
                        <div key={offer.id || index} className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium">{offer.title}</p>
                            <p className="text-sm text-muted-foreground">{offer.description}</p>
                          </div>
                          <Badge variant="secondary">LKR {offer.amount}</Badge>
                        </div>
                      )) || (
                        <p className="text-center py-4 text-muted-foreground">
                          No active offers
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="agents">
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Performance</CardTitle>
                    <CardDescription>
                      Monitor your sales team performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dashboardData?.agents?.map((agent, index) => (
                        <Card key={agent.id || index}>
                          <CardContent className="pt-6">
                            <div className="flex items-center space-x-4">
                              <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                                {agent.name?.charAt(0) || 'A'}
                              </div>
                              <div>
                                <p className="font-medium">{agent.name}</p>
                                <p className="text-sm text-muted-foreground">{agent.category}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )) || (
                        <p className="text-center py-4 text-muted-foreground col-span-full">
                          No agents found
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="teams">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Management</CardTitle>
                    <CardDescription>
                      Organize your sales teams
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData?.teams?.map((team, index) => (
                        <Card key={team.id || index}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{team.name}</p>
                                <p className="text-sm text-muted-foreground">{team.description}</p>
                              </div>
                              <Badge variant={team.isActive ? "default" : "secondary"}>
                                {team.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      )) || (
                        <p className="text-center py-4 text-muted-foreground">
                          No teams found
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Settings</CardTitle>
                    <CardDescription>
                      Manage your company configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Company Information</h3>
                        <p className="text-sm text-muted-foreground">Name: {company.name}</p>
                        <p className="text-sm text-muted-foreground">Email: {company.email}</p>
                        <p className="text-sm text-muted-foreground">Company ID: {company.companyId}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">User Information</h3>
                        <p className="text-sm text-muted-foreground">Name: {user.name}</p>
                        <p className="text-sm text-muted-foreground">Email: {user.email}</p>
                        <p className="text-sm text-muted-foreground">Role: {user.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}