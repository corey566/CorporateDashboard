import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface WebSocketMessage {
  type: string;
  data?: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log("WebSocket message received:", message);
          setLastMessage(message);
          handleMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect...");
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      setIsConnected(false);
    }
  };

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case "sale_created":
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
        
        // Show sale celebration toast
        if (message.data) {
          toast({
            title: "🎉 New Sale!",
            description: `Sale of $${parseFloat(message.data.amount).toLocaleString()} recorded`,
            duration: 5000,
          });
        }
        break;

      case "agent_created":
      case "agent_updated":
      case "agent_deleted":
        queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        break;

      case "team_created":
      case "team_updated":
      case "team_deleted":
        queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        break;

      case "cash_offer_created":
      case "cash_offer_updated":
      case "cash_offer_deleted":
        queryClient.invalidateQueries({ queryKey: ["/api/cash-offers"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        break;

      case "media_slide_created":
      case "media_slide_updated":
      case "media_slide_deleted":
        queryClient.invalidateQueries({ queryKey: ["/api/media-slides"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        break;

      case "announcement_created":
        queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
        
        // Show announcement popup
        if (message.data) {
          toast({
            title: message.data.title || "Announcement",
            description: message.data.message,
            duration: 8000,
          });
          
          // Play sound if available
          if (message.data.soundUrl) {
            try {
              const audio = new Audio(message.data.soundUrl);
              audio.play().catch(console.error);
            } catch (error) {
              console.error("Error playing sound:", error);
            }
          }
        }
        break;

      case "news_ticker_created":
      case "news_ticker_updated":
      case "news_ticker_deleted":
        queryClient.invalidateQueries({ queryKey: ["/api/news-ticker"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        break;

      case "team_target_reached":
        // Show team celebration
        if (message.data) {
          toast({
            title: "🏆 Team Target Reached!",
            description: `${message.data.teamName} has reached their target!`,
            duration: 10000,
          });
          
          // Play celebration sound
          try {
            const audio = new Audio("/sounds/celebration.mp3");
            audio.play().catch(console.error);
          } catch (error) {
            console.error("Error playing celebration sound:", error);
          }
        }
        break;

      case "system_settings_updated":
        queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        break;

      default:
        console.log("Unknown message type:", message.type);
    }
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
}
