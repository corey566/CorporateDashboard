import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Building, 
  Users, 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  companyId: string;
  subscription?: {
    planName: string;
    status: string;
    endDate: string;
    currentUsers: number;
    maxUsers: number;
  };
}

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  billingInterval: string;
  maxUsers: number;
  maxAgents: number;
  maxAdmins: number;
  features: string[];
  isActive: boolean;
}

interface NewPlan {
  name: string;
  description: string;
  price: string;
  currency: string;
  billingInterval: string;
  maxUsers: number;
  maxAgents: number;
  maxAdmins: number;
  features: string;
}

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("companies");
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [newPlan, setNewPlan] = useState<NewPlan>({
    name: "",
    description: "",
    price: "",
    currency: "USD",
    billingInterval: "monthly",
    maxUsers: 5,
    maxAgents: 10,
    maxAdmins: 2,
    features: ""
  });

  // Fetch companies
  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['/api/superadmin/companies'],
    queryFn: () => apiRequest<Company[]>('/api/superadmin/companies'),
  });

  // Fetch subscription plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/superadmin/plans'],
    queryFn: () => apiRequest<SubscriptionPlan[]>('/api/superadmin/plans'),
  });

  // Create subscription plan
  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const features = planData.features.split(',').map((f: string) => f.trim());
      return await apiRequest('/api/superadmin/plans', {
        method: 'POST',
        body: JSON.stringify({
          ...planData,
          features,
          price: parseFloat(planData.price),
          maxUsers: parseInt(planData.maxUsers),
          maxAgents: parseInt(planData.maxAgents),
          maxAdmins: parseInt(planData.maxAdmins),
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Plan created successfully",
        description: "The subscription plan has been created and is now available.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/superadmin/plans'] });
      setNewPlan({
        name: "",
        description: "",
        price: "",
        currency: "USD",
        billingInterval: "monthly",
        maxUsers: 5,
        maxAgents: 10,
        maxAdmins: 2,
        features: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create plan",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update subscription plan
  const updatePlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const features = planData.features.split(',').map((f: string) => f.trim());
      return await apiRequest(`/api/superadmin/plans/${planData.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...planData,
          features,
          price: parseFloat(planData.price),
          maxUsers: parseInt(planData.maxUsers),
          maxAgents: parseInt(planData.maxAgents),
          maxAdmins: parseInt(planData.maxAdmins),
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Plan updated successfully",
        description: "The subscription plan has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/superadmin/plans'] });
      setEditingPlan(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update plan",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete subscription plan
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      return await apiRequest(`/api/superadmin/plans/${planId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Plan deleted successfully",
        description: "The subscription plan has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/superadmin/plans'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete plan",
        description: error.message || "Cannot delete plan with active subscriptions.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePlan = () => {
    if (!newPlan.name || !newPlan.price) {
      toast({
        title: "Please fill in required fields",
        description: "Name and price are required.",
        variant: "destructive",
      });
      return;
    }
    createPlanMutation.mutate(newPlan);
  };

  const handleUpdatePlan = () => {
    if (!editingPlan) return;
    updatePlanMutation.mutate(editingPlan);
  };

  const handleDeletePlan = (planId: number) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      deletePlanMutation.mutate(planId);
    }
  };

  const renderCompaniesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies?.filter(c => c.subscription?.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${plans?.reduce((sum, plan) => sum + parseFloat(plan.price), 0).toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
          <CardDescription>
            Manage all registered companies and their subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {companiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {companies?.map((company) => (
                <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{company.name}</h3>
                    <p className="text-sm text-gray-600">{company.email}</p>
                    <p className="text-sm text-gray-500">ID: {company.companyId}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {company.subscription ? (
                      <div className="text-right">
                        <Badge variant={company.subscription.status === 'active' ? 'default' : 'secondary'}>
                          {company.subscription.planName}
                        </Badge>
                        <p className="text-sm text-gray-500">
                          {company.subscription.currentUsers}/{company.subscription.maxUsers} users
                        </p>
                        <p className="text-sm text-gray-500">
                          Expires: {new Date(company.subscription.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <Badge variant="outline">No subscription</Badge>
                    )}
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
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

  const renderPlansTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Subscription Plan</CardTitle>
          <CardDescription>
            Add a new subscription plan for companies to choose from
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="planName">Plan Name</Label>
              <Input
                id="planName"
                value={newPlan.name}
                onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Professional"
              />
            </div>
            <div>
              <Label htmlFor="planPrice">Price</Label>
              <Input
                id="planPrice"
                type="number"
                value={newPlan.price}
                onChange={(e) => setNewPlan(prev => ({ ...prev, price: e.target.value }))}
                placeholder="29.99"
              />
            </div>
            <div>
              <Label htmlFor="planCurrency">Currency</Label>
              <Select value={newPlan.currency} onValueChange={(value) => setNewPlan(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="planInterval">Billing Interval</Label>
              <Select value={newPlan.billingInterval} onValueChange={(value) => setNewPlan(prev => ({ ...prev, billingInterval: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxUsers">Max Users</Label>
              <Input
                id="maxUsers"
                type="number"
                value={newPlan.maxUsers}
                onChange={(e) => setNewPlan(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="maxAgents">Max Agents</Label>
              <Input
                id="maxAgents"
                type="number"
                value={newPlan.maxAgents}
                onChange={(e) => setNewPlan(prev => ({ ...prev, maxAgents: parseInt(e.target.value) }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="planDescription">Description</Label>
              <Input
                id="planDescription"
                value={newPlan.description}
                onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Perfect for growing teams"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="planFeatures">Features (comma-separated)</Label>
              <Input
                id="planFeatures"
                value={newPlan.features}
                onChange={(e) => setNewPlan(prev => ({ ...prev, features: e.target.value }))}
                placeholder="Real-time analytics, Advanced reporting, Priority support"
              />
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={handleCreatePlan} disabled={createPlanMutation.isPending}>
              {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Subscription Plans</CardTitle>
          <CardDescription>
            Manage your subscription plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plansLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans?.map((plan) => (
                <Card key={plan.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      <Badge variant={plan.isActive ? "default" : "secondary"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="text-2xl font-bold">
                      ${plan.price}/{plan.billingInterval}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Users:</span>
                        <span>{plan.maxUsers}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Agents:</span>
                        <span>{plan.maxAgents}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Admins:</span>
                        <span>{plan.maxAdmins}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingPlan(plan)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Plan Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the details of this subscription plan
            </DialogDescription>
          </DialogHeader>
          {editingPlan && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editPlanName">Plan Name</Label>
                <Input
                  id="editPlanName"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="editPlanPrice">Price</Label>
                <Input
                  id="editPlanPrice"
                  type="number"
                  value={editingPlan.price}
                  onChange={(e) => setEditingPlan(prev => prev ? { ...prev, price: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="editMaxUsers">Max Users</Label>
                <Input
                  id="editMaxUsers"
                  type="number"
                  value={editingPlan.maxUsers}
                  onChange={(e) => setEditingPlan(prev => prev ? { ...prev, maxUsers: parseInt(e.target.value) } : null)}
                />
              </div>
              <div>
                <Label htmlFor="editMaxAgents">Max Agents</Label>
                <Input
                  id="editMaxAgents"
                  type="number"
                  value={editingPlan.maxAgents}
                  onChange={(e) => setEditingPlan(prev => prev ? { ...prev, maxAgents: parseInt(e.target.value) } : null)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="editPlanDescription">Description</Label>
                <Input
                  id="editPlanDescription"
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="editPlanFeatures">Features (comma-separated)</Label>
                <Input
                  id="editPlanFeatures"
                  value={editingPlan.features.join(', ')}
                  onChange={(e) => setEditingPlan(prev => prev ? { ...prev, features: e.target.value.split(',').map(f => f.trim()) } : null)}
                />
              </div>
              <div className="md:col-span-2 flex space-x-2">
                <Button onClick={handleUpdatePlan} disabled={updatePlanMutation.isPending}>
                  {updatePlanMutation.isPending ? "Updating..." : "Update Plan"}
                </Button>
                <Button variant="outline" onClick={() => setEditingPlan(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage companies, subscription plans, and payments
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="mt-6">
            {renderCompaniesTab()}
          </TabsContent>

          <TabsContent value="plans" className="mt-6">
            {renderPlansTab()}
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
                <CardDescription>
                  View and manage payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Payment History</h3>
                  <p className="text-gray-600">Payment transaction history will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}