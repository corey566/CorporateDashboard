import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Wifi, TrendingUp, Settings, Building } from "lucide-react";
import AgentCard from "./agent-card";
import TeamLeaderboard from "./team-leaderboard";
import ScoreboardTable from "./scoreboard-table";
import NewsTicker from "./news-ticker";
import SalePopup from "./sale-popup";
import AnnouncementPopup from "./announcement-popup";
import CashOfferPopup from "./cash-offer-popup";
import FullscreenMediaPresentation from "./fullscreen-media-presentation";
import { useWebSocket } from "@/hooks/use-websocket";
import { useState, useEffect } from "react";
import { useCurrency } from "@/hooks/use-currency";

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
    const setting = systemSettings?.find((s: any) => s.key === key);
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
  const dashboardDataSafe = dashboardData || {};
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
      // Play sound effect immediately
      playEventSound("sale");

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
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Cash Offers Banner - Only show when promotions are active */}
      {cashOffers && cashOffers.length > 0 && (
        <div className="mb-4">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-2xl font-black">$</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">
                    ACTIVE CASH OFFERS
                  </h2>
                  <p className="text-lg text-green-100 font-bold">
                    {cashOffers.length} Promotions Live
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                {cashOffers.slice(0, 4).map((offer: any) => (
                  <div
                    key={offer.id}
                    className="bg-white/20 rounded-xl p-3 text-center min-w-[180px]"
                  >
                    <div className="text-2xl font-black text-white mb-1">
                      {formatCurrency(offer.reward)}
                    </div>
                    <div className="text-sm font-bold text-green-100 mb-1">
                      {offer.title}
                    </div>
                    <div className="text-xs text-green-200">
                      Target: {offer.target} sales
                    </div>
                    <div className="text-xs text-green-200">
                      Expires: {new Date(offer.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Layout - Fixed height to prevent overlap with news ticker */}
      <div className={`grid gap-4 ${showTeamRankings && enableTeams ? 'grid-cols-12' : 'grid-cols-1'}`} style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
        {/* Main Sales Scoreboard Table */}
        <div className={showTeamRankings && enableTeams ? 'col-span-8' : 'col-span-1'}>
          <ScoreboardTable agents={agents} />
        </div>

        {/* Team Rankings - Conditional Side Panel */}
        {showTeamRankings && enableTeams && (
          <div className="col-span-4">
            <TeamLeaderboard teams={teams} agents={agents} />
          </div>
        )}
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
  );
}
