import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

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
}

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  planId: number;
  billingInterval: string;
}

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<RegistrationData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    planId: 0,
    billingInterval: "monthly"
  });
  
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [step, setStep] = useState(1); // 1: Company Info, 2: Plan Selection, 3: Payment

  // Fetch subscription plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/public/subscription-plans'],
    queryFn: () => apiRequest<SubscriptionPlan[]>('/api/public/subscription-plans'),
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      return await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Registration successful!",
        description: "Welcome to SalesTracker Pro! You can now access your dashboard.",
      });
      
      // Store authentication data
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("company", JSON.stringify(data.company));
      
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof RegistrationData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.companyName) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        variant: "destructive",
      });
      return false;
    }
    
    if (formData.password.length < 6) {
      toast({
        title: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!selectedPlan) {
      toast({
        title: "Please select a subscription plan",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = () => {
    if (selectedPlan) {
      registerMutation.mutate({
        ...formData,
        planId: selectedPlan.id,
      });
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData(prev => ({ ...prev, planId: plan.id }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="john@company.com"
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          value={formData.companyName}
          onChange={(e) => handleInputChange('companyName', e.target.value)}
          placeholder="Acme Corporation"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm password"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="billingInterval">Billing Interval</Label>
        <Select value={formData.billingInterval} onValueChange={(value) => handleInputChange('billingInterval', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly (Save 20%)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {plansLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans?.map((plan) => (
            <Card 
              key={plan.id} 
              className={`cursor-pointer transition-all ${
                selectedPlan?.id === plan.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handlePlanSelect(plan)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {selectedPlan?.id === plan.id && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-2xl font-bold">
                  ${plan.price}/{formData.billingInterval === 'yearly' ? 'year' : 'month'}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Users:</span>
                    <Badge variant="secondary">{plan.maxUsers}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Agents:</span>
                    <Badge variant="secondary">{plan.maxAgents}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Admins:</span>
                    <Badge variant="secondary">{plan.maxAdmins}</Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Features:</p>
                  <ul className="text-sm space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h3 className="font-semibold mb-4">Order Summary</h3>
        {selectedPlan && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span>{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Billing:</span>
              <span className="capitalize">{formData.billingInterval}</span>
            </div>
            <div className="flex justify-between">
              <span>Company:</span>
              <span>{formData.companyName}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${selectedPlan.price}/{formData.billingInterval === 'yearly' ? 'year' : 'month'}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Payment Options</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Choose your preferred payment method to complete registration:
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center"
            onClick={handleSubmit}
            disabled={registerMutation.isPending}
          >
            <div className="text-lg font-semibold mb-1">Demo Payment</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Start with a simulated payment for demo purposes
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center"
            onClick={() => {
              toast({
                title: "PayPal Integration",
                description: "PayPal payment will be available once configured by admin.",
              });
            }}
          >
            <div className="text-lg font-semibold mb-1">PayPal</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pay securely with PayPal
            </div>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?
            </span>
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepNumber ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 ${
                    step > stepNumber ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Company Info</span>
            <span>Choose Plan</span>
            <span>Payment</span>
          </div>
        </div>

        {/* Main Content */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Create Your Account"}
              {step === 2 && "Choose Your Plan"}
              {step === 3 && "Complete Registration"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Enter your company information to get started"}
              {step === 2 && "Select the plan that best fits your team"}
              {step === 3 && "Choose your payment method and complete setup"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
              >
                Previous
              </Button>
              
              {step < 3 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}