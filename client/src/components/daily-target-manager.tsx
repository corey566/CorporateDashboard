import { useState, useEffect, useCallback } from "react";
import { useCurrency } from "@/hooks/use-currency";

interface DailyTargetManagerProps {
  teams: any[];
  agents: any[];
  onTargetAlert: (message: string, teamName: string) => void;
}

export default function DailyTargetManager({ teams, agents, onTargetAlert }: DailyTargetManagerProps) {
  const { formatCurrency } = useCurrency();
  const [workingHours, setWorkingHours] = useState({ start: 9, end: 17 }); // 9 AM to 5 PM
  const [alertTime, setAlertTime] = useState(16); // 4 PM alert time
  const [dailyTargets, setDailyTargets] = useState<any[]>([]);
  const [customWorkingDays, setCustomWorkingDays] = useState<number | null>(null); // Allow manual override
  const [lastAlertTime, setLastAlertTime] = useState<{ [teamId: number]: number }>({});

  // Calculate working days remaining in current month (excluding only Sundays)
  const calculateRemainingWorkingDays = () => {
    if (customWorkingDays !== null) {
      // If custom working days is set, calculate proportional remaining days
      const now = new Date();
      const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysElapsed = now.getDate() - 1; // Days that have already passed
      const remainingDaysInMonth = totalDaysInMonth - now.getDate() + 1;
      
      // Proportional calculation based on custom working days
      const workingDaysPerRegularDay = customWorkingDays / totalDaysInMonth;
      return Math.round(remainingDaysInMonth * workingDaysPerRegularDay);
    }
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    
    // Get last day of current month
    const lastDay = new Date(year, month + 1, 0);
    
    let remainingWorkingDays = 0;
    for (let day = today; day <= lastDay.getDate(); day++) {
      const checkDate = new Date(year, month, day);
      // Skip only Sundays (Sunday = 0)
      if (checkDate.getDay() !== 0) {
        remainingWorkingDays++;
      }
    }
    
    return remainingWorkingDays;
  };

  // Calculate total working days in current month (excluding only Sundays)
  const calculateTotalWorkingDays = () => {
    // Return custom working days if set
    if (customWorkingDays !== null) {
      return customWorkingDays;
    }
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let workingDays = 0;
    for (let day = new Date(firstDay); day <= lastDay; day.setDate(day.getDate() + 1)) {
      // Skip only Sundays (Sunday = 0)
      if (day.getDay() !== 0) {
        workingDays++;
      }
    }
    
    return workingDays;
  };

  // Get the total number of Sundays in the current month
  const getSundaysInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let sundays = 0;
    for (let day = new Date(firstDay); day <= lastDay; day.setDate(day.getDate() + 1)) {
      if (day.getDay() === 0) {
        sundays++;
      }
    }
    
    return sundays;
  };

  // Calculate team's current daily progress
  const calculateTeamProgress = (teamId: number) => {
    const teamAgents = agents.filter((agent: any) => agent.teamId === teamId);
    const totalVolume = teamAgents.reduce((sum: number, agent: any) => 
      sum + parseFloat(agent.currentVolume || "0"), 0);
    const totalUnits = teamAgents.reduce((sum: number, agent: any) => 
      sum + (agent.currentUnits || 0), 0);
    
    return { totalVolume, totalUnits };
  };

  // Calculate dynamic daily targets with redistribution
  const calculateDynamicTargets = useCallback(() => {
    const remainingDays = calculateRemainingWorkingDays();
    const totalDays = calculateTotalWorkingDays();
    const today = new Date().getDate();
    
    return teams.map((team: any) => {
      const monthlyVolumeTarget = parseFloat(team.volumeTarget || "0");
      const monthlyUnitsTarget = parseInt(team.unitsTarget || "0");
      const progress = calculateTeamProgress(team.id);
      
      // Calculate what should have been achieved by today
      const daysElapsed = totalDays - remainingDays + 1;
      const expectedVolumeByToday = (monthlyVolumeTarget / totalDays) * daysElapsed;
      const expectedUnitsByToday = (monthlyUnitsTarget / totalDays) * daysElapsed;
      
      // Calculate remaining targets
      const remainingVolumeTarget = Math.max(0, monthlyVolumeTarget - progress.totalVolume);
      const remainingUnitsTarget = Math.max(0, monthlyUnitsTarget - progress.totalUnits);
      
      // Redistribute remaining targets across remaining days
      const adjustedDailyVolumeTarget = remainingDays > 0 ? remainingVolumeTarget / remainingDays : 0;
      const adjustedDailyUnitsTarget = remainingDays > 0 ? remainingUnitsTarget / remainingDays : 0;
      
      // Calculate today's progress percentage
      const originalDailyVolumeTarget = monthlyVolumeTarget / totalDays;
      const originalDailyUnitsTarget = monthlyUnitsTarget / totalDays;
      
      const volumeProgress = originalDailyVolumeTarget > 0 ? 
        (progress.totalVolume / expectedVolumeByToday) * 100 : 100;
      const unitsProgress = originalDailyVolumeTarget > 0 ? 
        (progress.totalUnits / expectedUnitsByToday) * 100 : 100;
      
      const isBehindSchedule = volumeProgress < 90 || unitsProgress < 90;
      
      return {
        ...team,
        originalDailyVolumeTarget,
        originalDailyUnitsTarget,
        adjustedDailyVolumeTarget,
        adjustedDailyUnitsTarget,
        currentVolume: progress.totalVolume,
        currentUnits: progress.totalUnits,
        remainingVolumeTarget,
        remainingUnitsTarget,
        remainingDays,
        volumeProgress,
        unitsProgress,
        isBehindSchedule,
        expectedVolumeByToday,
        expectedUnitsByToday
      };
    });
  }, [teams, agents]);

  // Check for alerts and trigger voice notifications
  const checkForAlerts = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentTime = now.getTime();
    
    // Check during working hours and only after the initial alert time
    if (currentHour >= workingHours.start && currentHour <= workingHours.end && currentHour >= alertTime) {
      const targets = calculateDynamicTargets();
      
      targets.forEach((target: any) => {
        if (target.isBehindSchedule) {
          const teamId = target.id;
          const lastAlert = lastAlertTime[teamId] || 0;
          const timeSinceLastAlert = currentTime - lastAlert;
          
          // Only alert if 15 minutes (900,000 ms) have passed since last alert for this team
          if (timeSinceLastAlert >= 15 * 60 * 1000) {
            const message = `Attention: Daily target not achieved for team ${target.name}. Volume progress is ${target.volumeProgress.toFixed(1)} percent. Units progress is ${target.unitsProgress.toFixed(1)} percent. Please take action to meet today's targets.`;
            
            // Only use text-to-speech alert (no visual display)
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(message);
              utterance.rate = 0.9;
              utterance.pitch = 1.0;
              utterance.volume = 1.0;
              speechSynthesis.speak(utterance);
            }
            
            // Update last alert time for this team
            setLastAlertTime(prev => ({
              ...prev,
              [teamId]: currentTime
            }));
            
            // Log for debugging but don't show visually
            console.log(`Voice alert (15-min interval): ${message}`);
          }
        }
      });
    }
  }, [workingHours, alertTime, calculateDynamicTargets, onTargetAlert, lastAlertTime]);

  // Update targets every minute
  useEffect(() => {
    const updateTargets = () => {
      setDailyTargets(calculateDynamicTargets());
    };
    
    updateTargets();
    const interval = setInterval(updateTargets, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [calculateDynamicTargets]);

  // Check for alerts every 5 minutes (but only announce every 15 minutes per team)
  useEffect(() => {
    checkForAlerts();
    const interval = setInterval(checkForAlerts, 5 * 60 * 1000); // Check every 5 minutes for responsiveness
    
    return () => clearInterval(interval);
  }, [checkForAlerts]);

  return {
    dailyTargets,
    workingHours,
    setWorkingHours,
    alertTime,
    setAlertTime,
    remainingWorkingDays: calculateRemainingWorkingDays(),
    totalWorkingDays: calculateTotalWorkingDays(),
    customWorkingDays,
    setCustomWorkingDays,
    sundaysInMonth: getSundaysInMonth(),
    totalDaysInMonth: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  };
}