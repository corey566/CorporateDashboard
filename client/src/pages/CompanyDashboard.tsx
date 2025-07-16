import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Settings,
  LogOut
} from "lucide-react";

interface CompanyUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
}

interface CompanySubscription {
  id: number;
  planName: string;
  status: string;
  endDate: string;
  maxUsers: number;
  maxAgents: number;
  currentUsers: number;
  currentAgents: number;
}

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch company users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/company/users'],
    queryFn: () => apiRequest<CompanyUser[]>('/api/company/users'),
  });

  // Fetch company subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/company/subscription'],
    queryFn: () => apiRequest<CompanySubscription>('/api/company/subscription'),
  });

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    window.location.href = "/login";
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription?.currentUsers || 0}/{subscription?.maxUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription?.maxUsers ? Math.round(((subscription?.currentUsers || 0) / subscription.maxUsers) * 100) : 0}% of plan limit
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription?.currentAgents || 0}/{subscription?.maxAgents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription?.maxAgents ? Math.round(((subscription?.currentAgents || 0) / subscription.maxAgents) * 100) : 0}% of plan limit
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                {subscription?.planName || 'No Plan'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription?.endDate ? `Expires: ${new Date(subscription.endDate).toLocaleDateString()}` : 'No expiration'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your team and access key features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Users className="w-8 h-8" />
              <span>Manage Team</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <TrendingUp className="w-8 h-8" />
              <span>View Analytics</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Settings className="w-8 h-8" />
              <span>Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {users?.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
          <CardDescription>
            Manage your subscription plan and billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptionLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : subscription ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Current Plan</h3>
                  <Badge variant="default" className="text-lg p-2">
                    {subscription.planName}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                    {subscription.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Plan Limits</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Users:</span>
                      <span>{subscription.currentUsers}/{subscription.maxUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Agents:</span>
                      <span>{subscription.currentAgents}/{subscription.maxAgents}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Expiration</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Need to upgrade?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Contact support to upgrade your plan or add more users.
                </p>
                <Button variant="outline">
                  Contact Support
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No subscription information available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Company Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Welcome back! Here's your company overview.
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Team</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {renderOverviewTab()}
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            {renderUsersTab()}
          </TabsContent>

          <TabsContent value="subscription" className="mt-6">
            {renderSubscriptionTab()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}