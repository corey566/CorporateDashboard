import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Wifi, TrendingUp, Settings, Building } from "lucide-react";
import AgentCard from "./agent-card";
import TeamLeaderboard from "./team-leaderboard";
import ScoreboardTable from "./scoreboard-table";
import DailyTargetsTable from "./daily-targets-table";
import NewsTicker from "./news-ticker";
import SalePopup from "./sale-popup";
import AnnouncementPopup from "./announcement-popup";
import CashOfferPopup from "./cash-offer-popup";
import FullscreenMediaPresentation from "./fullscreen-media-presentation";
import { useWebSocket } from "@/hooks/use-websocket";
import { useState, useEffect } from "react";
import { useCurrency } from "@/hooks/use-currency";
import { BackgroundBeams } from "@/components/ui/aceternity/background-beams";
import { Spotlight } from "@/components/ui/aceternity/spotlight";
import { GradientBackground } from "@/components/ui/aceternity/gradient-bg";
import { AnimatedCard } from "@/components/ui/aceternity/animated-card";
import { Meteors } from "@/components/ui/aceternity/meteors";

export default function TvDashboard() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [salePopup, setSalePopup] = useState<any>(null);
  const [announcementPopup, setAnnouncementPopup] = useState<any>(null);
  const [cashOfferPopup, setCashOfferPopup] = useState<any>(null);
  const [showMediaPresentation, setShowMediaPresentation] = useState(false);
  const [soundEffectCache, setSoundEffectCache] = useState<{
    [key: string]: any;
  }>({});
  const { isConnected, lastMessage } = useWebSocket();
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    refetchInterval: 10000, // Reduced from 2 seconds to 10 seconds
  });

  const { data: systemSettings } = useQuery({
    queryKey: ["/api/system-settings"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Get display settings
  const getSystemSetting = (key: string, defaultValue: string = "true") => {
    if (!systemSettings || !Array.isArray(systemSettings)) return defaultValue === "true";
    const setting = systemSettings.find((s: any) => s.key === key);
    return setting?.value === "true";
  };
  
  const showTeamRankings = getSystemSetting("showTeamRankings");
  const enableTeams = getSystemSetting("enableTeams");

  // Pre-load sound effects on component mount
  useEffect(() => {
    const preloadSoundEffects = async () => {
      const eventTypes = ["sale", "announcement", "cash_offer"];

      for (const eventType of eventTypes) {
        try {
          const response = await fetch(`/api/sound-effects/event/${eventType}`);
          if (response.ok) {
            const soundEffect = await response.json();
            setSoundEffectCache((prev) => ({
              ...prev,
              [eventType]: soundEffect,
            }));
          }
        } catch (error) {
          console.error(`Error preloading ${eventType} sound effect:`, error);
        }
      }
    };

    preloadSoundEffects();
  }, []);

  // Function to play event sound (optimized with cache)
  const playEventSound = async (eventType: string) => {
    try {
      console.log(
        `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} sound effect triggered`,
      );

      // Use cached sound effect if available
      let soundEffect = soundEffectCache[eventType];

      // If not cached, fetch it
      if (!soundEffect) {
        const response = await fetch(`/api/sound-effects/event/${eventType}`);
        if (response.ok) {
          soundEffect = await response.json();
          // Cache it for future use
          setSoundEffectCache((prev) => ({
            ...prev,
            [eventType]: soundEffect,
          }));
        }
      }

      if (soundEffect) {
        // Create and play audio immediately
        const audio = new Audio(soundEffect.fileUrl);
        audio.volume = soundEffect.volume || 0.5;

        // Pre-load and play
        audio.load();
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error playing sound:", error);
          });
        }
      }
    } catch (error) {
      console.error("Error playing sound effect:", error);
    }
  };

  // Extract data from query result with proper defaults
  const dashboardDataSafe = dashboardData || {
    agents: [],
    teams: [],
    cashOffers: [],
    mediaSlides: [],
    announcements: [],
    sales: []
  };
  const rawAgents = dashboardDataSafe.agents || [];
  const teams = dashboardDataSafe.teams || [];
  const cashOffers = dashboardDataSafe.cashOffers || [];
  const mediaSlides = dashboardDataSafe.mediaSlides || [];
  const announcements = dashboardDataSafe.announcements || [];
  const recentSales = dashboardDataSafe.sales?.slice(0, 5) || [];
  const allSales = dashboardDataSafe.sales || [];

  // Extract system settings with proper defaults
  const systemSettingsArray = Array.isArray(systemSettings)
    ? systemSettings
    : [];
  const companyName =
    systemSettingsArray.find((s: any) => s?.key === "companyName")?.value ||
    "Sales Dashboard";
  const logoUrl =
    systemSettingsArray.find((s: any) => s?.key === "logoUrl")?.value || "";
  const primaryColor =
    systemSettingsArray.find((s: any) => s?.key === "primaryColor")?.value ||
    "#3B82F6";
  const accentColor =
    systemSettingsArray.find((s: any) => s?.key === "accentColor")?.value ||
    "#10B981";

  // Process agents with their current sales calculations
  const agents = rawAgents.map((agent: any) => {
    const agentSales = allSales.filter(
      (sale: any) => sale.agentId === agent.id,
    );

    // Calculate current volume and units
    const currentVolume = agentSales.reduce(
      (sum: number, sale: any) => sum + (parseFloat(sale.amount) || 0),
      0,
    );
    const currentUnits = agentSales.reduce(
      (sum: number, sale: any) => sum + (sale.units || 0),
      0,
    );

    // Find associated team
    const team = teams.find((t: any) => t.id === agent.teamId);

    return {
      ...agent,
      currentVolume: currentVolume.toString(),
      currentUnits: currentUnits,
      team: team,
    };
  });

  // Handle WebSocket messages for sale notifications and currency updates
  useEffect(() => {
    if (
      lastMessage?.type === "sale_created" &&
      lastMessage.data &&
      rawAgents.length > 0
    ) {
      console.log("Sale created WebSocket message received:", lastMessage.data);
      
      // Play sound effect immediately with enhanced error handling
      const playSound = async () => {
        try {
          await playEventSound("sale");
          console.log("Sale sound effect played successfully");
        } catch (error) {
          console.error("Failed to play sale sound:", error);
          // Fallback: try to play a simple beep or system sound
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUcBz2V3OvKfSgHKWq87aKfVAoLWKre6qhVFglAn+DyvmUcBz2U3OvKfSgHKWq87aKfVAoLWKre6qhVFglAn+DyvmUcBz2U3OvKfSgHKWq87aKfVAoLWKre6qhVFglAn+DyvmUcBz2U3OvKfSgHKWq87aKfVAoLWKre6qhVFglAn+DyvmUcBz2U3OvKfSgHKWq87aKfVAoLWKre6qhVFglAn+DyvmUcBz2U3ObXfSgHKWq87aKfVAoLWKre6qhVFglAn+DyvmUcBz2U3OvKfSgHKWq87aKfVAoLWKre6qhVFglAn+DyvmUcBz2U3OvKfSgHKWq87aKfVAoLWKre6qhVFglAn+DyvmUcBz2U3OvKfSgHKWq87aKfVAoLWKre6qhVFglAn+DyvmUcBz2U3OvKfSgHKWq87aKfVAoLWKre6qhVFglAn+DyvmUcBz');
            audio.play();
          } catch (fallbackError) {
            console.error("Even fallback sound failed:", fallbackError);
          }
        }
      };
      playSound();

      // Find the agent who made the sale
      const saleAgent = rawAgents.find(
        (agent: any) => agent.id === lastMessage.data.agentId,
      );
      if (saleAgent) {
        const saleWithAgent = {
          ...lastMessage.data,
          agentName: saleAgent.name,
          agentPhoto: saleAgent.photo,
        };
        setSalePopup(saleWithAgent);
        console.log("Sale popup set for agent:", saleAgent.name);
      }
    } else if (
      lastMessage?.type === "announcement_created" &&
      lastMessage.data
    ) {
      playEventSound("announcement");
      setAnnouncementPopup(lastMessage.data);
    } else if (lastMessage?.type === "cash_offer_created" && lastMessage.data) {
      playEventSound("cash_offer");
      setCashOfferPopup(lastMessage.data);
    } else if (lastMessage?.type === "currency_updated" && lastMessage.data) {
      // Invalidate currency-related queries to refresh data without page reload
      console.log("Currency update received via WebSocket, refreshing data...");
      queryClient.invalidateQueries({ queryKey: ["/api/currency-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    } else if (lastMessage?.type === "system_settings_updated" && lastMessage.data) {
      // Handle system settings updates (team visibility, etc.)  
      console.log("System settings update received via WebSocket, refreshing display settings...");
      queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    }
  }, [lastMessage, rawAgents]);

  // Media presentation timer - uses dashboard duration setting
  useEffect(() => {
    if (mediaSlides.length > 0) {
      // Get dashboard duration from system settings (default 30 seconds)
      const dashboardDuration =
        parseInt(
          systemSettingsArray.find((s: any) => s?.key === "dashboardDuration")
            ?.value,
        ) || 30;
      const durationMs = dashboardDuration * 1000; // Convert to milliseconds

      // Only log once when setting up the timer
      console.log(
        `Dashboard will transition to media slides every ${dashboardDuration} seconds`,
      );

      const interval = setInterval(() => {
        setShowMediaPresentation(true);
      }, durationMs);

      return () => clearInterval(interval);
    }
  }, [mediaSlides.length]);

  // Auto-close announcement popup after 5 seconds
  useEffect(() => {
    if (announcementPopup) {
      const timer = setTimeout(() => {
        setAnnouncementPopup(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [announcementPopup]);

  // Auto-close cash offer popup after 5 seconds
  useEffect(() => {
    if (cashOfferPopup) {
      const timer = setTimeout(() => {
        setCashOfferPopup(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [cashOfferPopup]);

  // Auto-close sale popup after 5 seconds
  useEffect(() => {
    if (salePopup) {
      const timer = setTimeout(() => {
        setSalePopup(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [salePopup]);

  // Update last updated timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format time elapsed
  const formatTimeElapsed = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hours ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-corporate-500 text-xl">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Elegant Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>
      
      <div className="relative z-10 p-6 min-h-screen">
      
      {/* Elegant WebSocket Status Indicator */}
      {isConnected && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 border border-emerald-400/20">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium tracking-wide">LIVE</span>
          </div>
        </div>
      )}
      {/* Elegant Cash Offers Banner */}
      {cashOffers && cashOffers.length > 0 && (
        <div className="mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">💰</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Active Cash Offers
                    </h2>
                    <p className="text-emerald-100 font-medium">
                      {cashOffers.length} promotions available
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  {cashOffers.slice(0, 4).map((offer: any) => (
                    <div
                      key={offer.id}
                      className="bg-white/10 backdrop-blur rounded-xl p-4 text-center min-w-[160px] border border-white/20"
                    >
                      <div className="text-xl font-semibold text-white mb-1">
                        {formatCurrency(offer.reward)}
                      </div>
                      <div className="text-sm font-medium text-emerald-100 mb-2">
                        {offer.title}
                      </div>
                      <div className="text-xs text-emerald-200">
                        Target: {offer.target} sales
                      </div>
                      <div className="text-xs text-emerald-200">
                        Expires: {new Date(offer.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-12 gap-6" style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
        {/* Main Sales Scoreboard Table */}
        <div className="col-span-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm h-full overflow-hidden">
            <ScoreboardTable agents={agents} />
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="col-span-4 space-y-6">
          {/* Daily Targets Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <DailyTargetsTable teams={teams} agents={agents} />
          </div>
          
          {/* Team Rankings - Conditional display */}
          {showTeamRankings && enableTeams && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <TeamLeaderboard teams={teams} agents={agents} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom News Ticker - Fixed position */}
      <div className="fixed bottom-0 left-0 right-0 z-20 h-16 bg-background">
        <NewsTicker />
      </div>

      {/* Sale Popup */}
      {salePopup && (
        <SalePopup sale={salePopup} onClose={() => setSalePopup(null)} />
      )}

      {/* Announcement Popup */}
      {announcementPopup && (
        <AnnouncementPopup
          announcement={announcementPopup}
          onClose={() => setAnnouncementPopup(null)}
        />
      )}

      {/* Cash Offer Popup */}
      {cashOfferPopup && (
        <CashOfferPopup
          offer={cashOfferPopup}
          onClose={() => setCashOfferPopup(null)}
        />
      )}

      {/* Fullscreen Media Presentation */}
      <FullscreenMediaPresentation
        slides={mediaSlides}
        isVisible={showMediaPresentation}
        onComplete={() => setShowMediaPresentation(false)}
      />
      </div>
    </div>
  );
}
