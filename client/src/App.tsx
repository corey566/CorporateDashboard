import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { ProtectedRoute } from "@/lib/protected-route";
import DashboardPage from "@/pages/dashboard-page";
import AdminPage from "@/pages/admin-page";
import AuthPage from "@/pages/auth-page";
import MobileAuthPage from "@/pages/mobile-auth-page";
import MobileDashboardPage from "@/pages/mobile-dashboard-page";
import NotFound from "@/pages/not-found";
import SetupPage from "@/pages/setup-page";
import { useEffect, useState } from "react";

function Router() {
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/setup/status')
      .then(res => res.json())
      .then(data => setSetupComplete(data.complete))
      .catch(() => setSetupComplete(false));
  }, []);

  if (setupComplete === null) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>;
  }

  if (!setupComplete) {
    return <SetupPage />;
  }

  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/tv" component={DashboardPage} />
      <ProtectedRoute path="/admin-portal" component={AdminPage} />
      <ProtectedRoute path="/admin-portal/*" component={AdminPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/mobile/auth" component={MobileAuthPage} />
      <Route path="/mobile/dashboard" component={MobileDashboardPage} />
      <Route path="/mobile" component={MobileAuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;