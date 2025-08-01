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
import { Settings, Clock, Target, ChevronUp, ChevronDown } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { useState, useEffect, useRef, useCallback } from "react";
import DailyTargetManager from "./daily-target-manager";

interface DailyTargetsTableProps {
  teams: any[];
  agents: any[];
}

export default function DailyTargetsTable({
  teams,
  agents,
}: DailyTargetsTableProps) {
  const { formatCurrency } = useCurrency();
  const [showSettings, setShowSettings] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);


  // Enhanced target alerts with 15-minute intervals and voice announcements
  const [lastAlertTime, setLastAlertTime] = useState<{ [teamId: number]: number }>({});
  
  const handleTargetAlert = useCallback((message: string, teamName: string) => {
    console.log(`Voice alert triggered for ${teamName}: ${message}`);
    
    // Use text-to-speech for voice alerts
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      utterance.lang = 'en-US';
      
      // Clear any existing speech
      window.speechSynthesis.cancel();
      
      // Speak the alert
      window.speechSynthesis.speak(utterance);
      
      console.log(`Voice alert spoken: "${message}" for team ${teamName}`);
    } else {
      console.warn('Text-to-speech not supported in this browser');
    }
  }, []);

  // Use the daily target manager
  const targetManager = DailyTargetManager({
    teams,
    agents,
    onTargetAlert: handleTargetAlert,
  });
  const {
    dailyTargets,
    workingHours,
    setWorkingHours,
    alertTime,
    setAlertTime,
    remainingWorkingDays,
    totalWorkingDays,
    customWorkingDays,
    setCustomWorkingDays,
    sundaysInMonth,
    totalDaysInMonth,
  } = targetManager;

  const currentMonth = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "numeric",
  });

  // Carousel functionality for multiple teams
  const teamsPerPage = 2; // Show 2 teams at a time for TV viewing
  const totalPages = Math.ceil(dailyTargets.length / teamsPerPage);
  const displayedTargets = dailyTargets.slice(
    currentIndex * teamsPerPage,
    (currentIndex + 1) * teamsPerPage
  );

  // Auto-scroll carousel every 6 seconds
  useEffect(() => {
    if (dailyTargets.length > teamsPerPage && isScrolling) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex >= totalPages - 1 ? 0 : prevIndex + 1
        );
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [dailyTargets.length, teamsPerPage, totalPages, isScrolling]);

  // Pagination handlers
  const nextPage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex >= totalPages - 1 ? 0 : prevIndex + 1
    );
  };

  const prevPage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex <= 0 ? totalPages - 1 : prevIndex - 1
    );
  };

  return (
    <div className="w-full space-y-4"
         onMouseEnter={() => setIsScrolling(false)}
         onMouseLeave={() => setIsScrolling(true)}>


      <div className="bg-card rounded-2xl border-2 border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary/10 p-4 border-b-2 border-border">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h2 className="text-4xl font-black text-foreground">
                DAILY TARGETS - {currentMonth.toUpperCase()}
              </h2>
              <p className="text-2xl font-bold text-muted-foreground">
                {remainingWorkingDays} Days Remaining / {totalWorkingDays} Working Days
                {!customWorkingDays && (
                  <span className="text-sm ml-2">
                    ({totalDaysInMonth} total - {sundaysInMonth} Sundays)
                  </span>
                )}
                {customWorkingDays && (
                  <span className="text-sm ml-2 text-blue-600 dark:text-blue-400">
                    (Custom: {customWorkingDays} days)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {/* Carousel controls - only show if more than 2 teams */}
              {dailyTargets.length > teamsPerPage && (
                <div className="flex items-center gap-1 mr-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    className="px-2"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium px-2">
                    {currentIndex + 1}/{totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    className="px-2"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <div className="ml-2 text-xs text-muted-foreground">
                    {isScrolling ? "Auto-scrolling" : "Paused"}
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 bg-background rounded-lg border space-y-6">
              {/* Working Days Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Working Days Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Month Calculation</Label>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      <div className="flex justify-between">
                        <span>Total days in month:</span>
                        <span className="font-semibold">{totalDaysInMonth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sundays in month:</span>
                        <span className="font-semibold">{sundaysInMonth}</span>
                      </div>
                      <div className="flex justify-between border-t mt-2 pt-2">
                        <span>Calculated working days:</span>
                        <span className="font-bold text-primary">
                          {customWorkingDays || (totalDaysInMonth - sundaysInMonth)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="customWorkingDays">Custom Working Days (Optional)</Label>
                    <Input
                      id="customWorkingDays"
                      type="number"
                      min="1"
                      max="31"
                      placeholder={`Default: ${totalDaysInMonth - sundaysInMonth}`}
                      value={customWorkingDays || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomWorkingDays(value ? parseInt(value) : null);
                      }}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Override automatic calculation (total days - Sundays)
                    </p>
                    {customWorkingDays && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setCustomWorkingDays(null)}
                      >
                        Reset to Auto
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Working Hours Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Alert Configuration
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-hour">Work Start Hour</Label>
                    <Input
                      id="start-hour"
                      type="number"
                      min="0"
                      max="23"
                      value={workingHours.start}
                      onChange={(e) =>
                        setWorkingHours((prev) => ({
                          ...prev,
                          start: parseInt(e.target.value),
                        }))
                      }
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
                      onChange={(e) =>
                        setWorkingHours((prev) => ({
                          ...prev,
                          end: parseInt(e.target.value),
                        }))
                      }
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
              </div>
            </div>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b-2 border-border">
              <TableHead className="text-2xl font-black text-foreground py-2 px-4">
                TEAM
              </TableHead>
              <TableHead className="text-2xl font-black text-foreground py-2 px-4 text-center">
                TODAY'S TARGET
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedTargets.map((target: any, index: number) => {
              return (
                <TableRow
                  key={target.id}
                  className={`border-b border-border hover:bg-muted/30 transition-colors ${
                    target.isBehindSchedule
                      ? "bg-red-50 dark:bg-red-950/20"
                      : index % 2 === 0
                        ? "bg-background"
                        : "bg-muted/10"
                  }`}
                >
                  {/* Team Info */}
                  <TableCell className="py-2 px-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: target.color }}
                      ></div>
                      <div>
                        <div className="text-xl font-black text-foreground">
                          {target.name}
                        </div>
                        <div className="text-xl font-bold text-foreground">
                          {remainingWorkingDays} days left
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Today's Target with Progress Bars */}
                  <TableCell className="py-2 px-4 text-center">
                    <div className="space-y-2">
                      {/* Targets on one line */}
                      <div className="flex justify-center items-center gap-4">
                        <div className="text-lg font-black text-foreground">
                          {formatCurrency(
                            target.adjustedDailyVolumeTarget.toFixed(2),
                          )}
                        </div>
                        <div className="text-lg font-black text-foreground">
                          {Math.round(target.adjustedDailyUnitsTarget)} units
                        </div>
                      </div>

                      {/* Progress bars below */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Volume Progress */}
                        <div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                target.volumeProgress >= 90
                                  ? "bg-green-500"
                                  : target.volumeProgress >= 70
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.min(target.volumeProgress, 100)}%`,
                              }}
                            ></div>
                          </div>
                          {/* <div className="text-xl font-bold text-muted-foreground mt-1">
                            {target.volumeProgress.toFixed(1)}% Volume
                          </div> */}
                        </div>

                        {/* Units Progress */}
                        <div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                target.unitsProgress >= 90
                                  ? "bg-green-500"
                                  : target.unitsProgress >= 70
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.min(target.unitsProgress, 100)}%`,
                              }}
                            ></div>
                          </div>
                          {/* <div className="text-xl font-bold text-foreground mt-1">
                            {target.unitsProgress.toFixed(1)}% Units
                          </div> */}
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
