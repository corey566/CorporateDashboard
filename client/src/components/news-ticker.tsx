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
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-2 overflow-hidden shadow-lg" style={{ height: '64px' }}>
        <div className="flex items-center justify-center h-full">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full font-semibold text-sm flex items-center mr-4">
            <span className="mr-2">📢</span>
            NEWS
          </div>
          <span className="text-lg font-medium text-gray-900 dark:text-white">📈 Welcome to the Sales Leaderboard Dashboard!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-2 overflow-hidden shadow-lg" style={{ height: '64px' }}>
      <div className="animate-marquee flex items-center space-x-8 h-full">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full font-semibold text-sm flex items-center mr-4">
          <span className="mr-2">📢</span>
          NEWS
        </div>
        {messages.map((message: any, index: number) => (
          <span key={`${message.id}-${index}`} className="whitespace-nowrap text-lg font-medium text-gray-900 dark:text-white">
            {message.message}
          </span>
        ))}
      </div>
    </div>
  );
}
