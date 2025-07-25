import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export default function NewsTicker() {
  const [currentMessage, setCurrentMessage] = useState(0);
  
  const { data: newsData } = useQuery({
    queryKey: ["/api/news-ticker"],
    refetchInterval: 5000,
  });

  const messages = newsData || [];

  useEffect(() => {
    if (messages.length > 1) {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length);
      }, 8000); // Change message every 8 seconds

      return () => clearInterval(interval);
    }
  }, [messages.length]);

  if (!messages || messages.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground py-2 overflow-hidden shadow-lg border-t-2 border-primary/20">
        <div className="flex items-center justify-center">
          <span className="text-sm font-medium">📈 Welcome to the Sales Leaderboard Dashboard!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground py-2 overflow-hidden shadow-lg border-t-2 border-primary/20">
      <div className="animate-marquee flex items-center space-x-8">
        {messages.map((message: any, index: number) => (
          <span key={`${message.id}-${index}`} className="whitespace-nowrap text-sm font-medium">
            {message.message}
          </span>
        ))}
      </div>
    </div>
  );
}
