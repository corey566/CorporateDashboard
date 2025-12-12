import { useState } from 'react';
import { useNavigate } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SetupPage() {
  const [, navigate] = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    dbHost: 'localhost',
    dbPort: '5432',
    dbName: 'sales_dashboard',
    dbUser: 'postgres',
    dbPassword: '',
    adminUsername: 'admin',
    adminPassword: '',
    confirmPassword: '',
    appPort: '5000',
    appDomain: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateStep1 = () => {
    if (!formData.dbHost || !formData.dbPort || !formData.dbName || !formData.dbUser || !formData.dbPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all database fields',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.adminUsername || !formData.adminPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all admin fields',
        variant: 'destructive',
      });
      return false;
    }
    if (formData.adminPassword !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return false;
    }
    if (formData.adminPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Setup completed successfully. Redirecting...',
        });

        setTimeout(() => {
          window.location.href = '/auth';
        }, 2000);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Setup failed',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Setup failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Sales Dashboard Setup</CardTitle>
          <CardDescription>
            {step === 1 ? 'Step 1: Database Configuration' : 'Step 2: Admin Account & Application Settings'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbHost">Database Host</Label>
                    <Input
                      id="dbHost"
                      name="dbHost"
                      value={formData.dbHost}
                      onChange={handleChange}
                      placeholder="localhost"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dbPort">Database Port</Label>
                    <Input
                      id="dbPort"
                      name="dbPort"
                      value={formData.dbPort}
                      onChange={handleChange}
                      placeholder="5432"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dbName">Database Name</Label>
                  <Input
                    id="dbName"
                    name="dbName"
                    value={formData.dbName}
                    onChange={handleChange}
                    placeholder="sales_dashboard"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dbUser">Database User</Label>
                  <Input
                    id="dbUser"
                    name="dbUser"
                    value={formData.dbUser}
                    onChange={handleChange}
                    placeholder="postgres"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dbPassword">Database Password</Label>
                  <Input
                    id="dbPassword"
                    name="dbPassword"
                    type="password"
                    value={formData.dbPassword}
                    onChange={handleChange}
                    placeholder="Enter database password"
                    required
                  />
                </div>

                <Button type="button" onClick={handleNext} className="w-full">
                  Next: Admin Setup
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminUsername">Admin Username</Label>
                  <Input
                    id="adminUsername"
                    name="adminUsername"
                    value={formData.adminUsername}
                    onChange={handleChange}
                    placeholder="admin"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Admin Password</Label>
                  <Input
                    id="adminPassword"
                    name="adminPassword"
                    type="password"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    placeholder="Enter password (min 6 characters)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appPort">Application Port</Label>
                  <Input
                    id="appPort"
                    name="appPort"
                    value={formData.appPort}
                    onChange={handleChange}
                    placeholder="Auto-detect free port"
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Port will be automatically detected from available ports
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appDomain">Domain (Optional)</Label>
                  <Input
                    id="appDomain"
                    name="appDomain"
                    value={formData.appDomain}
                    onChange={handleChange}
                    placeholder="yourdomain.com"
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty to use IP address or auto-detected port
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">
                    Back
                  </Button>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Complete Setup
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}