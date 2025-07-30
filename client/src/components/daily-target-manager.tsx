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

  // Calculate working days remaining in current month
  const calculateRemainingWorkingDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    
    // Get last day of current month
    const lastDay = new Date(year, month + 1, 0);
    
    let remainingWorkingDays = 0;
    for (let day = today; day <= lastDay.getDate(); day++) {
      const checkDate = new Date(year, month, day);
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (checkDate.getDay() !== 0 && checkDate.getDay() !== 6) {
        remainingWorkingDays++;
      }
    }
    
    return remainingWorkingDays;
  };

  // Calculate total working days in current month
  const calculateTotalWorkingDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let workingDays = 0;
    for (let day = new Date(firstDay); day <= lastDay; day.setDate(day.getDate() + 1)) {
      if (day.getDay() !== 0 && day.getDay() !== 6) {
        workingDays++;
      }
    }
    
    return workingDays;
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
    
    // Only check during working hours and at alert time
    if (currentHour >= workingHours.start && currentHour <= workingHours.end && currentHour === alertTime) {
      const targets = calculateDynamicTargets();
      
      targets.forEach((target: any) => {
        if (target.isBehindSchedule) {
          const message = `Daily target not achieved for team ${target.name}. Volume: ${target.volumeProgress.toFixed(1)}%, Units: ${target.unitsProgress.toFixed(1)}%`;
          onTargetAlert(message, target.name);
          
          // Text-to-speech alert
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 0.8;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            speechSynthesis.speak(utterance);
          }
        }
      });
    }
  }, [workingHours, alertTime, calculateDynamicTargets, onTargetAlert]);

  // Update targets every minute
  useEffect(() => {
    const updateTargets = () => {
      setDailyTargets(calculateDynamicTargets());
    };
    
    updateTargets();
    const interval = setInterval(updateTargets, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [calculateDynamicTargets]);

  // Check for alerts every hour
  useEffect(() => {
    checkForAlerts();
    const interval = setInterval(checkForAlerts, 3600000); // Check every hour
    
    return () => clearInterval(interval);
  }, [checkForAlerts]);

  return {
    dailyTargets,
    workingHours,
    setWorkingHours,
    alertTime,
    setAlertTime,
    remainingWorkingDays: calculateRemainingWorkingDays(),
    totalWorkingDays: calculateTotalWorkingDays()
  };
}