import { useQuery } from "@tanstack/react-query";

export function useCurrency() {
  const { data: currencySettings } = useQuery({
    queryKey: ["/api/currency-settings"],
  });

  const getCurrencySymbol = (): string => {
    return currencySettings?.currencySymbol || "$";
  };

  const getCurrencyCode = (): string => {
    return currencySettings?.currencyCode || "USD";
  };

  const getCurrencyName = (): string => {
    return currencySettings?.currencyName || "US Dollar";
  };

  const formatCurrency = (amount: number | string): string => {
    const symbol = getCurrencySymbol();
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) return `${symbol}0.00`;
    
    // Format number with commas and 2 decimal places
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
    
    return `${symbol}${formatted}`;
  };

  const formatCurrencyCompact = (amount: number | string): string => {
    const symbol = getCurrencySymbol();
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) return `${symbol}0`;
    
    // Format large numbers in compact form (K, M, B)
    if (numAmount >= 1000000000) {
      return `${symbol}${(numAmount / 1000000000).toFixed(1)}B`;
    } else if (numAmount >= 1000000) {
      return `${symbol}${(numAmount / 1000000).toFixed(1)}M`;
    } else if (numAmount >= 1000) {
      return `${symbol}${(numAmount / 1000).toFixed(1)}K`;
    }
    
    return `${symbol}${numAmount.toFixed(0)}`;
  };

  return {
    symbol: getCurrencySymbol(),
    code: getCurrencyCode(),
    name: getCurrencyName(),
    formatCurrency,
    formatCurrencyCompact,
  };
}