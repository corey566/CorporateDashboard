import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Save, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CurrencySettings {
  symbol: string;
  code: string;
  name: string;
}

const commonCurrencies = [
  { symbol: "$", code: "USD", name: "US Dollar" },
  { symbol: "€", code: "EUR", name: "Euro" },
  { symbol: "£", code: "GBP", name: "British Pound" },
  { symbol: "¥", code: "JPY", name: "Japanese Yen" },
  { symbol: "₹", code: "INR", name: "Indian Rupee" },
  { symbol: "LKR", code: "LKR", name: "Sri Lankan Rupee" },
  { symbol: "RS", code: "PKR", name: "Pakistani Rupee" },
  { symbol: "¢", code: "GHS", name: "Ghanaian Cedi" },
  { symbol: "₦", code: "NGN", name: "Nigerian Naira" },
  { symbol: "R", code: "ZAR", name: "South African Rand" },
];

export default function CurrencySettings() {
  const [customSymbol, setCustomSymbol] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [customName, setCustomName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentSettings } = useQuery({
    queryKey: ["/api/currency-settings"],
  });

  const getCurrentCurrency = (): CurrencySettings => {
    return {
      symbol: currentSettings?.currencySymbol || "$",
      code: currentSettings?.currencyCode || "USD",
      name: currentSettings?.currencyName || "US Dollar",
    };
  };

  const updateCurrencyMutation = useMutation({
    mutationFn: async (currency: CurrencySettings) => {
      // Update currency symbol
      await apiRequest("PUT", `/api/system-settings/currencySymbol`, {
        value: currency.symbol,
      });
      
      // Update currency code
      await apiRequest("PUT", `/api/system-settings/currencyCode`, {
        value: currency.code,
      });
      
      // Update currency name
      await apiRequest("PUT", `/api/system-settings/currencyName`, {
        value: currency.name,
      });
    },
    onSuccess: () => {
      // Invalidate all currency and dashboard related queries to force refresh
      queryClient.invalidateQueries({ queryKey: ["/api/currency-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cash-offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      
      // Refetch all to immediately update UI
      queryClient.refetchQueries();
      
      toast({
        title: "Currency Updated",
        description: "Currency settings have been successfully updated throughout the application.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update currency settings.",
        variant: "destructive",
      });
    },
  });

  const handlePresetCurrency = (currency: CurrencySettings) => {
    updateCurrencyMutation.mutate(currency);
  };

  const handleCustomCurrency = () => {
    if (!customSymbol.trim()) {
      toast({
        title: "Error",
        description: "Please enter a currency symbol.",
        variant: "destructive",
      });
      return;
    }

    updateCurrencyMutation.mutate({
      symbol: customSymbol.trim(),
      code: customCode.trim() || "CUSTOM",
      name: customName.trim() || "Custom Currency",
    });

    setCustomSymbol("");
    setCustomCode("");
    setCustomName("");
  };

  const currentCurrency = getCurrentCurrency();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Currency Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure the currency symbol and format used throughout the platform
        </p>
      </div>

      {/* Current Currency Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Current Currency
          </CardTitle>
          <CardDescription>
            This currency will be used for all sales amounts and reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{currentCurrency.symbol}</span>
              <Badge variant="secondary">{currentCurrency.code}</Badge>
            </div>
            <div>
              <p className="font-medium text-foreground">{currentCurrency.name}</p>
              <p className="text-sm text-muted-foreground">
                Example: {currentCurrency.symbol}1,234.56
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preset Currencies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Quick Select
          </CardTitle>
          <CardDescription>
            Choose from common currencies used worldwide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {commonCurrencies.map((currency) => (
              <Button
                key={currency.code}
                variant={
                  currentCurrency.symbol === currency.symbol && 
                  currentCurrency.code === currency.code
                    ? "default" 
                    : "outline"
                }
                onClick={() => handlePresetCurrency(currency)}
                disabled={updateCurrencyMutation.isPending}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <span className="text-lg font-bold">{currency.symbol}</span>
                <span className="text-xs">{currency.code}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Currency */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Currency</CardTitle>
          <CardDescription>
            Set up a custom currency symbol and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customSymbol">
                Currency Symbol <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customSymbol"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value)}
                placeholder="e.g., $, €, ₹, LKR, RS"
                className="text-center text-lg font-bold"
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customCode">Currency Code</Label>
              <Input
                id="customCode"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                placeholder="e.g., USD, EUR, LKR"
                className="text-center font-mono"
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customName">Currency Name</Label>
              <Input
                id="customName"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., US Dollar, Euro"
                maxLength={30}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Button
              onClick={handleCustomCurrency}
              disabled={!customSymbol.trim() || updateCurrencyMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {updateCurrencyMutation.isPending ? "Saving..." : "Save Custom Currency"}
            </Button>
            {customSymbol && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Preview:</span>
                <span className="font-bold">{customSymbol}1,234.56</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}