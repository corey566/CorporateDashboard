import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Settings, UserCog } from "lucide-react";
import TvDashboard from "@/components/tv-dashboard";
import { useWebSocket } from "@/hooks/use-websocket";

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { isConnected } = useWebSocket();

  return (
    <div className="min-h-screen bg-gradient-to-br from-corporate-50 to-blue-50">
      {/* Admin Panel Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => navigate("/admin")}
          className="bg-corporate-800 hover:bg-corporate-700 text-white shadow-lg"
        >
          <Settings className="w-4 h-4 mr-2" />
          Admin Panel
        </Button>
      </div>

      {/* Connection Status */}
      <div className="fixed top-4 left-4 z-50">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <TvDashboard />
    </div>
  );
}
