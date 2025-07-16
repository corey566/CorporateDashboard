import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Download, FileText, TrendingUp, Users, DollarSign, Target, Filter } from "lucide-react";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/use-currency";

interface ReportFilters {
  startDate: string;
  endDate: string;
  agentId?: string;
  teamId?: string;
  reportType: "sales" | "performance" | "summary";
}

interface ReportData {
  totalSales: number;
  totalVolume: number;
  averageValue: number;
  salesCount: number;
  topPerformer: string;
  conversionRate: number;
  salesByAgent: any[];
  salesByTeam: any[];
  salesByDate: any[];
  performance: any[];
}

export default function AdminReports() {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    reportType: "sales"
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const { formatCurrency } = useCurrency();

  const { data: agents } = useQuery({
    queryKey: ["/api/agents"],
  });

  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
  });

  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ["/api/reports", filters],
    enabled: !!filters.startDate && !!filters.endDate,
  });

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const exportReport = async (format: "csv" | "pdf" | "excel") => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/reports/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...filters,
          format,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sales-report-${filters.startDate}-to-${filters.endDate}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };



  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports & Analytics</h2>
          <p className="text-muted-foreground">Generate detailed reports and export data</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => exportReport("csv")}
            disabled={isGenerating}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => exportReport("excel")}
            disabled={isGenerating}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
          <Button
            onClick={() => exportReport("pdf")}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
          <CardDescription>
            Configure the parameters for your report generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Agent</Label>
              <Select value={filters.agentId || "all"} onValueChange={(value) => handleFilterChange("agentId", value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {agents?.map((agent: any) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Team</Label>
              <Select value={filters.teamId || "all"} onValueChange={(value) => handleFilterChange("teamId", value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams?.map((team: any) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={filters.reportType} onValueChange={(value) => handleFilterChange("reportType", value as "sales" | "performance" | "summary")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="performance">Performance Report</SelectItem>
                  <SelectItem value="summary">Summary Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Data */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Sales</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(reportData.totalVolume)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Transactions</p>
                    <p className="text-2xl font-bold text-foreground">
                      {reportData.salesCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Average Sale Value</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(reportData.averageValue)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Top Performer</p>
                    <p className="text-2xl font-bold text-foreground">
                      {reportData.topPerformer || "N/A"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Tables */}
          <Tabs defaultValue="agents" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="agents">By Agent</TabsTrigger>
              <TabsTrigger value="teams">By Team</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="agents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Agent</CardTitle>
                  <CardDescription>Individual agent performance breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.salesByAgent?.map((agent: any, index: number) => (
                      <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{agent.name}</p>
                            <p className="text-sm text-muted-foreground">{agent.team}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 text-right">
                          <div>
                            <p className="font-bold text-foreground">{formatCurrency(agent.totalVolume)}</p>
                            <p className="text-sm text-muted-foreground">{agent.salesCount} sales</p>
                          </div>
                          <Badge variant="secondary">
                            {formatPercentage(agent.conversionRate)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teams" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Team</CardTitle>
                  <CardDescription>Team performance breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.salesByTeam?.map((team: any, index: number) => (
                      <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{team.name}</p>
                            <p className="text-sm text-muted-foreground">{team.agentCount} agents</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 text-right">
                          <div>
                            <p className="font-bold text-foreground">{formatCurrency(team.totalVolume)}</p>
                            <p className="text-sm text-muted-foreground">{team.salesCount} sales</p>
                          </div>
                          <Badge variant="secondary">
                            {formatCurrency(team.averagePerAgent)} avg
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Timeline</CardTitle>
                  <CardDescription>Daily sales breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.salesByDate?.map((day: any) => (
                      <div key={day.date} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{format(new Date(day.date), "MMM dd, yyyy")}</p>
                            <p className="text-sm text-muted-foreground">{day.salesCount} transactions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">{formatCurrency(day.totalVolume)}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(day.averageValue)} avg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No data available for the selected filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}