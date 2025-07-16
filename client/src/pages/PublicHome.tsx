import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, Trophy, BarChart3 } from "lucide-react";

const features = [
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Real-time Sales Tracking",
    description: "Monitor your team's performance in real-time with live updates and notifications."
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Team Management",
    description: "Organize your sales team efficiently with customizable team structures and roles."
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Leaderboards & Motivation",
    description: "Boost team morale with competitive leaderboards and achievement systems."
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Performance Analytics",
    description: "Get detailed insights into your sales performance with comprehensive reports."
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "29",
    currency: "USD",
    interval: "month",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 5 users",
      "Up to 10 agents",
      "Basic analytics",
      "Email support",
      "Real-time dashboard"
    ],
    popular: false
  },
  {
    name: "Professional",
    price: "79",
    currency: "USD", 
    interval: "month",
    description: "Ideal for growing sales teams",
    features: [
      "Up to 25 users",
      "Up to 50 agents",
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
      "Advanced reporting"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: "199",
    currency: "USD",
    interval: "month",
    description: "For large organizations with complex needs",
    features: [
      "Unlimited users",
      "Unlimited agents",
      "Enterprise analytics",
      "24/7 phone support",
      "Custom development",
      "White-label options"
    ],
    popular: false
  }
];

export default function PublicHome() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  SalesTracker Pro
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            Transform Your Sales Team
            <span className="text-blue-600 dark:text-blue-400"> Performance</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Boost your sales team's motivation and performance with our comprehensive real-time tracking,
            leaderboards, and analytics platform.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button size="lg" className="px-8 py-3">
                View Live Demo
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Everything You Need to Excel
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Powerful features designed to drive sales performance and team engagement
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Choose the plan that fits your team size and needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">/{plan.interval}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => setSelectedPlan(plan.name)}
                  >
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 dark:bg-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Transform Your Sales Team?
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Join thousands of teams already using SalesTracker Pro to boost performance
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="px-8 py-3">
                  Start Your Free Trial
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 SalesTracker Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}