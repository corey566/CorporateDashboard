import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2, TrendingUp, Shield } from "lucide-react";

const loginSchema = insertUserSchema.extend({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (user) {
    navigate("/admin");
    return null;
  }

  const handleLogin = async (data: LoginData) => {
    await loginMutation.mutateAsync(data);
    navigate("/admin");
  };

  const handleRegister = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-corporate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-corporate-800">Sales Leaderboard</h1>
              <p className="text-xl text-corporate-500">Real-time Performance Dashboard</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <p className="text-corporate-700">Secure admin panel for complete system control</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <p className="text-corporate-700">Real-time sales tracking and team management</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <p className="text-corporate-700">Interactive TV dashboard for call center display</p>
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-corporate-800 mb-2">Admin Features</h3>
            <ul className="space-y-2 text-corporate-600">
              <li>• Agent and team management</li>
              <li>• Sales entry and tracking</li>
              <li>• Cash offers and rewards</li>
              <li>• Media slides and announcements</li>
              <li>• Real-time dashboard updates</li>
            </ul>
          </div>
        </div>

        {/* Right side - Authentication form */}
        <div className="w-full max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Admin Access</CardTitle>
              <CardDescription className="text-center">
                Sign in to manage the sales leaderboard system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        {...loginForm.register("username")}
                        placeholder="Enter your username"
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        {...loginForm.register("password")}
                        placeholder="Enter your password"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        {...registerForm.register("username")}
                        placeholder="Choose a username"
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        {...registerForm.register("password")}
                        placeholder="Create a password"
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
