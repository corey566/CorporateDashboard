import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSaleSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign, Package, Edit, Trash2 } from "lucide-react";
import { z } from "zod";

const saleFormSchema = insertSaleSchema.extend({
  amount: z.string().min(1, "Amount is required"),
  units: z.string().min(1, "Units is required"),
  agentId: z.string().min(1, "Agent is required"),
});

type SaleFormData = z.infer<typeof saleFormSchema>;

export default function AdminSalesEntry() {
  const [editingSale, setEditingSale] = useState<any>(null);
  const { toast } = useToast();

  const { data: agents } = useQuery({
    queryKey: ["/api/agents"],
  });

  const { data: sales } = useQuery({
    queryKey: ["/api/sales"],
    refetchInterval: 5000,
  });

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      agentId: "",
      amount: "",
      units: "",
      category: "",
      clientName: "",
      description: "",
      subscriptionPeriod: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SaleFormData) => {
      const saleData = {
        ...data,
        agentId: parseInt(data.agentId),
        amount: data.amount,
        units: parseInt(data.units),
      };
      return apiRequest("POST", "/api/sales", saleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Sale recorded successfully",
      });
      form.reset();
      setEditingSale(null);
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
    mutationFn: async ({ id, data }: { id: number; data: SaleFormData }) => {
      const saleData = {
        ...data,
        agentId: parseInt(data.agentId),
        amount: data.amount,
        units: parseInt(data.units),
      };
      return apiRequest("PUT", `/api/sales/${id}`, saleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Sale updated successfully",
      });
      form.reset();
      setEditingSale(null);
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
      return apiRequest("DELETE", `/api/sales/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Sale deleted successfully",
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

  const handleEdit = (sale: any) => {
    setEditingSale(sale);
    form.reset({
      agentId: sale.agentId.toString(),
      amount: sale.amount.toString(),
      units: sale.units.toString(),
      category: sale.category,
      clientName: sale.clientName,
      description: sale.description,
      subscriptionPeriod: sale.subscriptionPeriod,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this sale?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: SaleFormData) => {
    if (editingSale) {
      updateMutation.mutate({ id: editingSale.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const todaysSales = sales?.filter((sale: any) => {
    const today = new Date().toDateString();
    const saleDate = new Date(sale.createdAt).toDateString();
    return today === saleDate;
  }) || [];

  const totalSalesAmount = todaysSales.reduce((sum: number, sale: any) => {
    return sum + parseFloat(sale.amount);
  }, 0);

  const totalUnits = todaysSales.reduce((sum: number, sale: any) => {
    return sum + sale.units;
  }, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sales Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingSale ? "Edit Sale" : "Quick Sales Entry"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="agentId">Agent</Label>
                <Select
                  value={form.watch("agentId")}
                  onValueChange={(value) => form.setValue("agentId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents?.map((agent: any) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.agentId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.agentId.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="amount">Sale Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...form.register("amount")}
                  placeholder="0.00"
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="units">Units</Label>
                <Input
                  id="units"
                  type="number"
                  {...form.register("units")}
                  placeholder="1"
                />
                {form.formState.errors.units && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.units.message}
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
            
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                {...form.register("clientName")}
                placeholder="Client name"
              />
              {form.formState.errors.clientName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.clientName.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Sale description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="subscriptionPeriod">Subscription Period</Label>
              <Input
                id="subscriptionPeriod"
                {...form.register("subscriptionPeriod")}
                placeholder="e.g., 12 months"
              />
            </div>
            
            <div className="flex space-x-2">
              {editingSale && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingSale(null);
                    form.reset();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingSale ? (
                  <Edit className="w-4 h-4 mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {editingSale ? "Update Sale" : "Record Sale"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Today's Sales Summary */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Sales Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <DollarSign className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold text-corporate-800">
                  ${totalSalesAmount.toLocaleString()}
                </p>
                <p className="text-sm text-corporate-500">Total Sales</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-corporate-800">{totalUnits}</p>
                <p className="text-sm text-corporate-500">Units Sold</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {todaysSales.slice(0, 10).map((sale: any) => {
                const agent = agents?.find((a: any) => a.id === sale.agentId);
                return (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-corporate-50 to-blue-50 rounded-lg border"
                  >
                    <div>
                      <p className="font-semibold text-corporate-800">
                        {agent?.name}
                      </p>
                      <p className="text-sm text-corporate-600">
                        {sale.clientName} - {sale.category}
                      </p>
                      <p className="text-xs text-corporate-500">
                        {new Date(sale.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-accent">
                          ${parseFloat(sale.amount).toLocaleString()}
                        </p>
                        <p className="text-sm text-corporate-500">
                          {sale.units} units
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(sale)}
                        >
                          <Edit className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(sale.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
