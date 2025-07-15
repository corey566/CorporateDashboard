import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Wifi, TrendingUp, Settings } from "lucide-react";
import AgentCard from "./agent-card";
import TeamLeaderboard from "./team-leaderboard";
import NewsTicker from "./news-ticker";
import SalePopup from "./sale-popup";
import CompanySlidesOverlay from "./company-slides-overlay";
import MediaSlides from "./media-slides";
import { useWebSocket } from "@/hooks/use-websocket";
import { useState, useEffect } from "react";

export default function TvDashboard() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [salePopup, setSalePopup] = useState<any>(null);
  const [showCompanySlides, setShowCompanySlides] = useState(false);
  const { isConnected, lastMessage } = useWebSocket();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    refetchInterval: 10000, // Reduced from 2 seconds to 10 seconds
  });

  // Extract data from query result
  const agents = dashboardData?.agents || [];
  const teams = dashboardData?.teams || [];
  const cashOffers = dashboardData?.cashOffers || [];
  const mediaSlides = dashboardData?.mediaSlides || [];
  const recentSales = dashboardData?.sales?.slice(0, 5) || [];

  // Handle WebSocket messages for sale notifications
  useEffect(() => {
    if (lastMessage?.type === "sale_created" && lastMessage.data && dashboardData?.agents) {
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
    }
  }, [lastMessage, dashboardData?.agents]);

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-corporate-100 px-4 py-2 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-corporate-800">Sales Leaderboard</h1>
              <p className="text-corporate-500">Real-time Performance Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm text-corporate-500">Last Updated</p>
              <p className="font-semibold text-corporate-800">
                {formatTimeElapsed(lastUpdated)}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isConnected ? 'bg-accent' : 'bg-red-500'
            }`}>
              <Wifi className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4 p-4 h-[calc(100vh-120px)] overflow-hidden">
        {/* Left Side - Agent Leaderboard */}
        <div className="col-span-8 h-full overflow-hidden flex flex-col">
          {/* Individual Agent Cards */}
          <div className="flex-1 min-h-0">
            <Card className="h-full">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Sales Agents</CardTitle>
                  <Badge variant="secondary" className="bg-accent text-white">
                    <Users className="w-4 h-4 mr-1" />
                    {agents.length} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 h-[calc(100%-5rem)] overflow-y-auto">
                <div className="space-y-3">
                  {agents.map((agent: any) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cash Offers Section */}
          {cashOffers.length > 0 && (
            <div className="mt-4 flex-shrink-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <div className="w-6 h-6 bg-warning rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-sm">$</span>
                    </div>
                    Active Cash Offers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cashOffers.map((offer: any) => (
                      <div
                        key={offer.id}
                        className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-corporate-800 text-sm">{offer.title}</h3>
                          <Badge variant="secondary" className="bg-warning text-white text-xs">
                            ${offer.reward}
                          </Badge>
                        </div>
                        <p className="text-xs text-corporate-600 mb-2">{offer.description}</p>
                        <div className="w-full bg-yellow-200 rounded-full h-1.5">
                          <div className="bg-warning h-1.5 rounded-full" style={{ width: "35%" }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Side - Team Leaderboard & Recent Sales */}
        <div className="col-span-4 space-y-4 h-full overflow-hidden flex flex-col">
          {/* Team Leaderboard - Fixed height */}
          <div className="flex-1 min-h-0">
            <TeamLeaderboard teams={teams} agents={agents} />
          </div>
          
          {/* Media Slides - Fixed height */}
          <div className="flex-1 min-h-0">
            <MediaSlides slides={mediaSlides} />
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

      {/* Company Slides Overlay */}
      <CompanySlidesOverlay
        isVisible={showCompanySlides}
        onClose={() => setShowCompanySlides(false)}
      />
    </div>
  );
}
