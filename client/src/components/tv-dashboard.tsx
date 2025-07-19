import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Wifi, TrendingUp, Settings, Building } from "lucide-react";
import AgentCard from "./agent-card";
import TeamLeaderboard from "./team-leaderboard";
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
  const [soundEffectCache, setSoundEffectCache] = useState<{[key: string]: any}>({});
  const { isConnected, lastMessage } = useWebSocket();
  const { formatCurrency } = useCurrency();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    refetchInterval: 10000, // Reduced from 2 seconds to 10 seconds
  });

  const { data: systemSettings } = useQuery({
    queryKey: ["/api/system-settings"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Pre-load sound effects on component mount
  useEffect(() => {
    const preloadSoundEffects = async () => {
      const eventTypes = ["sale", "announcement", "cash_offer"];
      
      for (const eventType of eventTypes) {
        try {
          const response = await fetch(`/api/sound-effects/event/${eventType}`);
          if (response.ok) {
            const soundEffect = await response.json();
            setSoundEffectCache(prev => ({
              ...prev,
              [eventType]: soundEffect
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
      console.log(`${eventType.charAt(0).toUpperCase() + eventType.slice(1)} sound effect triggered`);
      
      // Use cached sound effect if available
      let soundEffect = soundEffectCache[eventType];
      
      // If not cached, fetch it
      if (!soundEffect) {
        const response = await fetch(`/api/sound-effects/event/${eventType}`);
        if (response.ok) {
          soundEffect = await response.json();
          // Cache it for future use
          setSoundEffectCache(prev => ({
            ...prev,
            [eventType]: soundEffect
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
          playPromise.catch(error => {
            console.error('Error playing sound:', error);
          });
        }
      }
    } catch (error) {
      console.error('Error playing sound effect:', error);
    }
  };

  // Extract data from query result
  const rawAgents = dashboardData?.agents || [];
  const teams = dashboardData?.teams || [];
  const cashOffers = dashboardData?.cashOffers || [];
  const mediaSlides = dashboardData?.mediaSlides || [];
  const announcements = dashboardData?.announcements || [];
  const recentSales = dashboardData?.sales?.slice(0, 5) || [];
  const allSales = dashboardData?.sales || [];

  // Extract system settings
  const companyName = systemSettings?.find((s: any) => s.key === "companyName")?.value || "Sales Dashboard";
  const logoUrl = systemSettings?.find((s: any) => s.key === "logoUrl")?.value || "";
  const primaryColor = systemSettings?.find((s: any) => s.key === "primaryColor")?.value || "#3B82F6";
  const accentColor = systemSettings?.find((s: any) => s.key === "accentColor")?.value || "#10B981";

  // Process agents with their current sales calculations
  const agents = rawAgents.map((agent: any) => {
    const agentSales = allSales.filter((sale: any) => sale.agentId === agent.id);
    
    // Calculate current volume and units
    const currentVolume = agentSales.reduce((sum: number, sale: any) => sum + (parseFloat(sale.amount) || 0), 0);
    const currentUnits = agentSales.reduce((sum: number, sale: any) => sum + (sale.units || 0), 0);
    
    // Find associated team
    const team = teams.find((t: any) => t.id === agent.teamId);
    
    return {
      ...agent,
      currentVolume: currentVolume.toString(),
      currentUnits: currentUnits,
      team: team
    };
  });

  // Handle WebSocket messages for sale notifications and currency updates
  useEffect(() => {
    if (lastMessage?.type === "sale_created" && lastMessage.data && dashboardData?.agents) {
      // Play sound effect immediately
      playEventSound("sale");
      
      // Find the agent who made the sale
      const saleAgent = dashboardData.agents.find(agent => agent.id === lastMessage.data.agentId);
      if (saleAgent) {
        const saleWithAgent = {
          ...lastMessage.data,
          agentName: saleAgent.name,
          agentPhoto: saleAgent.photo
        };
        setSalePopup(saleWithAgent);
      }
    } else if (lastMessage?.type === "announcement_created" && lastMessage.data) {
      playEventSound("announcement");
      setAnnouncementPopup(lastMessage.data);
    } else if (lastMessage?.type === "cash_offer_created" && lastMessage.data) {
      playEventSound("cash_offer");
      setCashOfferPopup(lastMessage.data);
    } else if (lastMessage?.type === "currency_updated" && lastMessage.data) {
      // Force refresh all components by reloading the page
      console.log("Currency update received via WebSocket, refreshing page...");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, [lastMessage, dashboardData?.agents]);

  // Media presentation timer - uses dashboard duration setting
  useEffect(() => {
    if (mediaSlides.length > 0) {
      // Get dashboard duration from system settings (default 30 seconds)
      const dashboardDuration = parseInt(systemSettings?.find((s: any) => s.key === "dashboardDuration")?.value) || 30;
      const durationMs = dashboardDuration * 1000; // Convert to milliseconds
      
      console.log(`Dashboard will transition to media slides every ${dashboardDuration} seconds`);
      
      const interval = setInterval(() => {
        setShowMediaPresentation(true);
      }, durationMs);

      return () => clearInterval(interval);
    }
  }, [mediaSlides, systemSettings]);

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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card shadow-lg border-b border-border px-4 py-3 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex items-center space-x-4">
            {/* Company Logo */}
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={companyName} 
                className="w-12 h-12 object-contain rounded-xl border border-border"
              />
            ) : (
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
                <Building className="w-6 h-6 text-primary-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                {companyName}
              </h1>
              <p className="text-muted-foreground text-sm">Real-time Performance Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 lg:space-x-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-semibold text-foreground text-sm">
                {formatTimeElapsed(lastUpdated)}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isConnected ? 'bg-accent' : 'bg-destructive'
            }`}>
              <Wifi className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 h-[calc(100vh-120px)] overflow-hidden">
        {/* Left Side - Agent Leaderboard */}
        <div className="lg:col-span-8 h-full overflow-hidden flex flex-col">
          {/* Individual Agent Cards */}
          <div className="flex-1 min-h-0">
            <Card className="h-full bg-card border-border shadow-md">
              <CardHeader className="pb-3 flex-shrink-0 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl lg:text-3xl font-black text-foreground flex items-center gap-3">
                    👥 Sales Agents Performance
                  </CardTitle>
                  <Badge variant="secondary" className="bg-accent text-accent-foreground px-4 py-2 text-base lg:text-lg font-bold">
                    <Users className="w-5 h-5 mr-2" />
                    {agents.length} ACTIVE AGENTS
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-2 lg:p-4 h-[calc(100%-5rem)] overflow-y-auto custom-scrollbar">
                <div className="space-y-2 lg:space-y-4">
                  {agents.map((agent: any) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>


        </div>

        {/* Right Side - Team Leaderboard & Recent Sales */}
        <div className="col-span-4 space-y-4 h-full overflow-hidden flex flex-col">
          {/* Team Leaderboard - Fixed height */}
          <div className="flex-1 min-h-0">
            <TeamLeaderboard teams={teams} agents={agents} />
          </div>
          
          {/* Cash Offers - Fixed height */}
          <div className="flex-1 min-h-0">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-sm">$</span>
                  </div>
                  Cash Offers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-[calc(100%-4rem)] overflow-y-auto">
                <div className="space-y-3">
                  {cashOffers.map((offer: any) => (
                    <div
                      key={offer.id}
                      className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-green-800">{offer.title}</h4>
                        <Badge className="bg-green-500 text-white">
                          {formatCurrency(offer.reward)}
                        </Badge>
                      </div>
                      <p className="text-sm text-green-700 mb-2">{offer.description}</p>
                      <div className="text-xs text-green-600">
                        Target: {offer.target} sales | Expires: {new Date(offer.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {cashOffers.length === 0 && (
                    <div className="text-center py-8 text-corporate-500">
                      No active cash offers
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Sales - Fixed height */}
          <div className="flex-1 min-h-0">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <div className="w-6 h-6 bg-warning rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-sm">!</span>
                  </div>
                  Recent Sales
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-[calc(100%-4rem)] overflow-y-auto">
                <div className="space-y-2">
                  {recentSales.map((sale: any, index: number) => {
                    const agent = agents.find((a: any) => a.id === sale.agentId);
                    const bgColors = ['bg-green-50', 'bg-blue-50', 'bg-purple-50'];
                    const textColors = ['text-green-600', 'text-blue-600', 'text-purple-600'];
                    
                    return (
                      <div
                        key={sale.id}
                        className={`flex items-center space-x-3 p-2 rounded-lg ${bgColors[index % 3]}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${textColors[index % 3].replace('text-', 'bg-')}`} />
                        <div>
                          <p className="text-xs font-medium text-corporate-800">
                            {agent?.name} closed ${parseFloat(sale.amount).toLocaleString()} deal
                          </p>
                          <p className="text-xs text-corporate-500">
                            {new Date(sale.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom News Ticker */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <NewsTicker />
      </div>
      
      {/* Sale Popup */}
      {salePopup && (
        <SalePopup
          sale={salePopup}
          onClose={() => setSalePopup(null)}
        />
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
