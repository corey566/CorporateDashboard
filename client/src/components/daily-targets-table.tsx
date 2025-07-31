import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, AlertTriangle, Clock, Target } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { useState } from "react";
import DailyTargetManager from "./daily-target-manager";

interface DailyTargetsTableProps {
  teams: any[];
  agents: any[];
}

export default function DailyTargetsTable({ teams, agents }: DailyTargetsTableProps) {
  const { formatCurrency } = useCurrency();
  const [showSettings, setShowSettings] = useState(false);
  const [alertMessages, setAlertMessages] = useState<string[]>([]);

  // Handle target alerts
  const handleTargetAlert = (message: string, teamName: string) => {
    setAlertMessages(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Use the daily target manager
  const targetManager = DailyTargetManager({ teams, agents, onTargetAlert: handleTargetAlert });
  const { dailyTargets, workingHours, setWorkingHours, alertTime, setAlertTime, remainingWorkingDays, totalWorkingDays } = targetManager;

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full space-y-4">
      {/* Alert Messages */}
      {alertMessages.length > 0 && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Target Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertMessages.slice(-3).map((message, index) => (
              <p key={index} className="text-sm text-red-600 dark:text-red-400 mb-1">
                {message}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="bg-card rounded-2xl border-2 border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary/10 p-4 border-b-2 border-border">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h2 className="text-2xl font-black text-foreground">
                DYNAMIC DAILY TARGETS - {currentMonth.toUpperCase()}
              </h2>
              <p className="text-lg font-bold text-muted-foreground">
                {remainingWorkingDays} Days Remaining / {totalWorkingDays} Total Days
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="ml-4"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 bg-background rounded-lg border grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-hour">Work Start Hour</Label>
                <Input
                  id="start-hour"
                  type="number"
                  min="0"
                  max="23"
                  value={workingHours.start}
                  onChange={(e) => setWorkingHours(prev => ({ ...prev, start: parseInt(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end-hour">Work End Hour</Label>
                <Input
                  id="end-hour"
                  type="number"
                  min="0"
                  max="23"
                  value={workingHours.end}
                  onChange={(e) => setWorkingHours(prev => ({ ...prev, end: parseInt(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="alert-time">Alert Time (Hour)</Label>
                <Input
                  id="alert-time"
                  type="number"
                  min="0"
                  max="23"
                  value={alertTime}
                  onChange={(e) => setAlertTime(parseInt(e.target.value))}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Alert will trigger at {alertTime}:00 if targets are not met
                </p>
              </div>
            </div>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b-2 border-border">
              <TableHead className="text-3xl font-black text-foreground py-3 px-6">
                TEAM
              </TableHead>
              <TableHead className="text-3xl font-black text-foreground py-3 px-6 text-center">
                TODAY'S TARGET
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dailyTargets.map((target: any, index: number) => {
              return (
                <TableRow
                  key={target.id}
                  className={`border-b border-border hover:bg-muted/30 transition-colors ${
                    target.isBehindSchedule ? "bg-red-50 dark:bg-red-950/20" : 
                    index % 2 === 0 ? "bg-background" : "bg-muted/10"
                  }`}
                >
                  {/* Team Info */}
                  <TableCell className="py-3 px-6">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: target.color }}
                      ></div>
                      <div>
                        <div className="text-2xl font-black text-foreground">
                          {target.name}
                        </div>
                        <div className="text-lg font-bold text-muted-foreground">
                          {remainingWorkingDays} days remaining
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Today's Target with Progress Bars */}
                  <TableCell className="py-3 px-6 text-center">
                    <div className="space-y-3">
                      {/* Volume Target */}
                      <div>
                        <div className="text-2xl font-black text-foreground mb-2">
                          {formatCurrency(target.adjustedDailyVolumeTarget.toFixed(2))}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              target.volumeProgress >= 90 ? 'bg-green-500' : 
                              target.volumeProgress >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(target.volumeProgress, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-sm font-bold text-muted-foreground mt-1">
                          {target.volumeProgress.toFixed(1)}% Volume
                        </div>
                      </div>

                      {/* Units Target */}
                      <div>
                        <div className="text-2xl font-black text-foreground mb-2">
                          {Math.round(target.adjustedDailyUnitsTarget)} units
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              target.unitsProgress >= 90 ? 'bg-green-500' : 
                              target.unitsProgress >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(target.unitsProgress, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-sm font-bold text-muted-foreground mt-1">
                          {target.unitsProgress.toFixed(1)}% Units
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}