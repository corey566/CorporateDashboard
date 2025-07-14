import TvDashboard from "@/components/tv-dashboard";
import { useWebSocket } from "@/hooks/use-websocket";

export default function DashboardPage() {
  const { isConnected } = useWebSocket();

  return (
    <div className="min-h-screen bg-gradient-to-br from-corporate-50 to-blue-50">


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
