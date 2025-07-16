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
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import CompanyDashboard from "@/pages/CompanyDashboard";
import NotFound from "@/pages/not-found";

function Router() {
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
      
      {/* SaaS Authentication Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/superadmin" component={SuperAdminDashboard} />
      <Route path="/dashboard" component={CompanyDashboard} />
      
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
