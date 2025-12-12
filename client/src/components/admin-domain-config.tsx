
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Globe, Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDomainConfig() {
  const { toast } = useToast();
  const [domain, setDomain] = useState("");
  const [enableSSL, setEnableSSL] = useState(true);

  const { data: domainStatus, refetch } = useQuery({
    queryKey: ["/api/domain/status"],
    refetchInterval: 10000,
  });

  const configureDomainMutation = useMutation({
    mutationFn: async (data: { domain: string; enableSSL: boolean }) => {
      const res = await fetch("/api/domain/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to configure domain");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Domain Configuration",
        description: data.message || "Domain configured successfully",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Configuration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) {
      toast({
        title: "Error",
        description: "Please enter a domain name",
        variant: "destructive",
      });
      return;
    }

    configureDomainMutation.mutate({ domain: domain.trim(), enableSSL });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Domain Configuration
          </CardTitle>
          <CardDescription>
            Configure custom domain and SSL for your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {domainStatus && (
            <Alert>
              <AlertDescription className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Current Status:</span>
                  <div className="flex items-center gap-2">
                    {domainStatus.configured ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span>{domainStatus.configured ? "Configured" : "Not Configured"}</span>
                  </div>
                </div>
                {domainStatus.domain && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Domain:</span>
                      <span className="text-sm">{domainStatus.domain}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Port:</span>
                      <span className="text-sm">{domainStatus.port}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">SSL:</span>
                      <div className="flex items-center gap-2">
                        {domainStatus.ssl ? (
                          <>
                            <Shield className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Enabled</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">Not Enabled</span>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                type="text"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your custom domain (without http:// or https://)
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="ssl">Enable SSL/HTTPS</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically configure SSL certificate (requires certbot on traditional servers)
                </p>
              </div>
              <Switch
                id="ssl"
                checked={enableSSL}
                onCheckedChange={setEnableSSL}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={configureDomainMutation.isPending}
            >
              {configureDomainMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Configuring...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Configure Domain
                </>
              )}
            </Button>
          </form>

          <Alert>
            <AlertDescription className="text-xs space-y-2">
              <p className="font-semibold">On Replit:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Domain configuration is saved to your environment</li>
                <li>Go to Deployment → Domains to add DNS records</li>
                <li>SSL is automatically handled by Replit</li>
              </ul>
              <p className="font-semibold mt-3">On Traditional Server:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Requires Nginx and Certbot installed</li>
                <li>Add DNS A record pointing to your server IP</li>
                <li>SSL certificate will be auto-generated</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
