import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertSaleSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DollarSign, 
  Target, 
  TrendingUp, 
  User, 
  LogOut, 
  Plus,
  Calendar,
  Award,
  BarChart3
} from "lucide-react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type SaleFormData = z.infer<typeof insertSaleSchema>;

export default function MobileDashboardPage() {
  const [, setLocation] = useLocation();
  const [showSaleForm, setShowSaleForm] = useState(false);
  const { toast } = useToast();

  // Get current agent data
  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: ["/api/mobile/agent"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/mobile/agent");
      return await res.json();
    },
  });

  // Get agent's sales data
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ["/api/mobile/sales"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/mobile/sales");
      return await res.json();
    },
  });

  const form = useForm<SaleFormData>({
    resolver: zodResolver(insertSaleSchema),
    defaultValues: {
      amount: "0",
      units: 1,
      category: "",
      clientName: "",
      description: "",
      subscriptionPeriod: "",
    },
  });

  const saleMutation = useMutation({
    mutationFn: async (data: SaleFormData) => {
      const saleData = {
        ...data,
        agentId: agent?.id,
        amount: parseFloat(data.amount),
      };
      return apiRequest("POST", "/api/mobile/sales", saleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mobile/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success!",
        description: "Sale recorded successfully",
      });
      setShowSaleForm(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/mobile/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/mobile/auth");
    },
  });

  const handleSaleSubmit = (data: SaleFormData) => {
    saleMutation.mutate(data);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (agentLoading || salesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    setLocation("/mobile/auth");
    return null;
  }

  const totalSales = salesData?.sales?.reduce((sum: number, sale: any) => sum + parseFloat(sale.amount), 0) || 0;
  const totalUnits = salesData?.sales?.reduce((sum: number, sale: any) => sum + sale.units, 0) || 0;
  const volumeProgress = agent.volumeTarget > 0 ? (totalSales / parseFloat(agent.volumeTarget)) * 100 : 0;
  const unitsProgress = agent.unitsTarget > 0 ? (totalUnits / agent.unitsTarget) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={agent.photo} alt={agent.name} />
              <AvatarFallback>
                {agent.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-gray-900">{agent.name}</h1>
              <p className="text-sm text-gray-600">{agent.category}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Performance Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Volume</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${totalSales.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <Progress value={Math.min(volumeProgress, 100)} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">
                {volumeProgress.toFixed(1)}% of ${parseFloat(agent.volumeTarget).toLocaleString()} target
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Units</p>
                  <p className="text-2xl font-bold text-blue-600">{totalUnits}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <Progress value={Math.min(unitsProgress, 100)} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">
                {unitsProgress.toFixed(1)}% of {agent.unitsTarget} target
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Sale Button */}
        <Card>
          <CardContent className="p-4">
            <Button
              onClick={() => setShowSaleForm(true)}
              className="w-full"
              size="lg"
              disabled={!agent.canSelfReport}
            >
              <Plus className="h-5 w-5 mr-2" />
              Record New Sale
            </Button>
            {!agent.canSelfReport && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Self-reporting is not enabled for your account
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Sales</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {salesData?.sales?.length > 0 ? (
              <div className="space-y-3">
                {salesData.sales.slice(0, 5).map((sale: any) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{sale.clientName}</p>
                      <p className="text-sm text-gray-600">{sale.category}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ${parseFloat(sale.amount).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">{sale.units} units</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No sales recorded yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sale Form Modal */}
      {showSaleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Record New Sale</CardTitle>
              <CardDescription>Enter the details of your sale</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSaleSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    placeholder="Enter client name"
                    {...form.register("clientName")}
                  />
                  {form.formState.errors.clientName && (
                    <p className="text-sm text-red-600">{form.formState.errors.clientName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Sale Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...form.register("amount")}
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">Units</Label>
                  <Input
                    id="units"
                    type="number"
                    min="1"
                    placeholder="1"
                    {...form.register("units", { valueAsNumber: true })}
                  />
                  {form.formState.errors.units && (
                    <p className="text-sm text-red-600">{form.formState.errors.units.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => form.setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New Sale">New Sale</SelectItem>
                      <SelectItem value="Renewal">Renewal</SelectItem>
                      <SelectItem value="Upgrade">Upgrade</SelectItem>
                      <SelectItem value="Cross-sell">Cross-sell</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscriptionPeriod">Subscription Period</Label>
                  <Select onValueChange={(value) => form.setValue("subscriptionPeriod", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Annual">Annual</SelectItem>
                      <SelectItem value="One-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional details about the sale"
                    {...form.register("description")}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSaleForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={saleMutation.isPending}
                  >
                    {saleMutation.isPending ? "Recording..." : "Record Sale"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}