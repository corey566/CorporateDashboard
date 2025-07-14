import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Volume2, Megaphone, AlertTriangle, CakeSlice } from "lucide-react";

interface AnnouncementPopupProps {
  announcement: any;
  onClose: () => void;
}

export default function AnnouncementPopup({ announcement, onClose }: AnnouncementPopupProps) {
  const [timeRemaining, setTimeRemaining] = useState(10); // 10 seconds auto-dismiss

  useEffect(() => {
    // Play audio if sound URL is provided
    if (announcement.soundUrl) {
      const audio = new Audio(announcement.soundUrl);
      audio.play().catch(console.error);
    }

    // Auto-dismiss timer
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [announcement, onClose]);

  const getAnnouncementIcon = () => {
    switch (announcement.type) {
      case "birthday":
        return <CakeSlice className="w-6 h-6 text-pink-500" />;
      case "emergency":
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      default:
        return <Megaphone className="w-6 h-6 text-blue-500" />;
    }
  };

  const getAnnouncementColors = () => {
    switch (announcement.type) {
      case "birthday":
        return "bg-pink-50 border-pink-200 text-pink-800";
      case "emergency":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md animate-in zoom-in duration-300 ${getAnnouncementColors()}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getAnnouncementIcon()}
              <div>
                <h3 className="font-semibold text-lg">{announcement.title}</h3>
                <Badge variant="secondary" className="mt-1">
                  {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm mb-4 leading-relaxed">
            {announcement.message}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {announcement.soundUrl && (
                <div className="flex items-center space-x-1 text-xs">
                  <Volume2 className="w-3 h-3" />
                  <span>Audio played</span>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Auto-dismissing in {timeRemaining}s
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}