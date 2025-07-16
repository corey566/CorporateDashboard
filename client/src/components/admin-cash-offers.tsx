import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCashOfferSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Gift, Trash2, Clock, DollarSign } from "lucide-react";
import { z } from "zod";
import { useCurrency } from "@/hooks/use-currency";

const cashOfferFormSchema = insertCashOfferSchema.extend({
  reward: z.string().min(1, "Reward is required").transform(val => parseFloat(val)),
  target: z.string().min(1, "Target is required").transform(val => parseFloat(val)),
  expiresAt: z.string().min(1, "Expiry date is required"),
});

type CashOfferFormData = z.infer<typeof cashOfferFormSchema>;

export default function AdminCashOffers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const { data: cashOffers, isLoading } = useQuery({
    queryKey: ["/api/cash-offers"],
    refetchInterval: 5000,
  });

  const form = useForm<CashOfferFormData>({
    resolver: zodResolver(cashOfferFormSchema),
    defaultValues: {
      title: "",
      description: "",
      reward: "",
      type: "",
      target: "",
      expiresAt: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CashOfferFormData) => {
      const offerData = {
        ...data,
        reward: data.reward,
        target: data.target,
        expiresAt: new Date(data.expiresAt).toISOString(),
      };
      return apiRequest("POST", "/api/cash-offers", offerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cash-offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Cash offer created successfully",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/cash-offers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cash-offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Cash offer deleted successfully",
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

  const handleSubmit = (data: CashOfferFormData) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this cash offer?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Active Cash Offers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Cash Offers</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Offer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Cash Offer</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      {...form.register("title")}
                      placeholder="Volume Bonus"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...form.register("description")}
                      placeholder="$500 bonus for next $10,000 in sales"
                      rows={3}
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reward">Reward Amount</Label>
                      <Input
                        id="reward"
                        type="number"
                        step="0.01"
                        {...form.register("reward")}
                        placeholder="500"
                      />
                      {form.formState.errors.reward && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.reward.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={form.watch("type")}
                        onValueChange={(value) => form.setValue("type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="volume">Volume</SelectItem>
                          <SelectItem value="units">Units</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.type && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.type.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="target">Target</Label>
                      <Input
                        id="target"
                        type="number"
                        step="0.01"
                        {...form.register("target")}
                        placeholder="10000"
                      />
                      {form.formState.errors.target && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.target.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="expiresAt">Expires At</Label>
                      <Input
                        id="expiresAt"
                        type="datetime-local"
                        {...form.register("expiresAt")}
                      />
                      {form.formState.errors.expiresAt && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.expiresAt.message}
                        </p>
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
                      disabled={createMutation.isPending}
                    >
                      Create Offer
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cashOffers?.map((offer: any) => (
              <div
                key={offer.id}
                className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-5 h-5 text-warning" />
                    <h3 className="font-semibold text-corporate-800">{offer.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-warning text-white">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {offer.reward}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(offer.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-corporate-600 mb-2">{offer.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-corporate-500">
                    Target: {offer.type === 'volume' ? formatCurrency(offer.target) : parseFloat(offer.target).toLocaleString()}
                    {offer.type === 'units' ? ' units' : ''}
                  </span>
                  <div className="flex items-center space-x-1 text-warning">
                    <Clock className="w-4 h-4" />
                    <span>{formatTimeRemaining(offer.expiresAt)}</span>
                  </div>
                </div>
                
                <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                  <div className="bg-warning h-2 rounded-full" style={{ width: "35%" }}></div>
                </div>
              </div>
            ))}
            
            {(!cashOffers || cashOffers.length === 0) && (
              <div className="text-center py-8 text-corporate-500">
                <Gift className="w-12 h-12 mx-auto mb-4 text-corporate-300" />
                <p>No active cash offers</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Offer Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                form.reset({
                  title: "Volume Bonus",
                  description: "$500 bonus for next $10,000 in sales",
                  reward: "500",
                  type: "volume",
                  target: "10000",
                  expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
                });
                setIsDialogOpen(true);
              }}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Volume Bonus Template
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                form.reset({
                  title: "Units Challenge",
                  description: "$300 for 5 units before end of day",
                  reward: "300",
                  type: "units",
                  target: "5",
                  expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString().slice(0, 16),
                });
                setIsDialogOpen(true);
              }}
            >
              <Gift className="w-4 h-4 mr-2" />
              Units Challenge Template
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                form.reset({
                  title: "Daily Special",
                  description: "$1000 bonus for $20,000 in sales today",
                  reward: "1000",
                  type: "volume",
                  target: "20000",
                  expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString().slice(0, 16),
                });
                setIsDialogOpen(true);
              }}
            >
              <Clock className="w-4 h-4 mr-2" />
              Daily Special Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
