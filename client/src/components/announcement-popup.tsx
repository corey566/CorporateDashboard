import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Megaphone, AlertTriangle, CakeSlice, Bell } from "lucide-react";
import confetti from "canvas-confetti";

interface AnnouncementPopupProps {
  announcement: any;
  onClose: () => void;
}

export default function AnnouncementPopup({ announcement, onClose }: AnnouncementPopupProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [sparkleCount, setSparkleCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Confetti animation
  const fireConfetti = () => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
    
    confetti({
      particleCount: 60,
      spread: 55,
      origin: { y: 0.6 },
      colors: colors,
      gravity: 0.9,
      scalar: 0.8
    });
  };

  // Play audio if sound URL is provided
  const playAudio = () => {
    if (announcement.soundUrl) {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        
        audioRef.current = new Audio(announcement.soundUrl);
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch(() => {
          console.log('Audio playback failed');
        });
      } catch (error) {
        console.log('Audio setup failed');
      }
    }
  };

  // Sparkle effect
  const createSparkle = () => {
    setSparkleCount(prev => prev + 1);
    setTimeout(() => setSparkleCount(prev => prev - 1), 1000);
  };

  useEffect(() => {
    // Trigger confetti and audio immediately
    fireConfetti();
    playAudio();
    
    // Trigger sparkle effect multiple times
    const sparkleInterval = setInterval(createSparkle, 300);
    const sparkleTimer = setTimeout(() => clearInterval(sparkleInterval), 2000);
    
    // Auto-close after 5 seconds
    const autoCloseTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500);
    }, 5000);

    return () => {
      clearTimeout(autoCloseTimer);
      clearTimeout(sparkleTimer);
      clearInterval(sparkleInterval);
      // Clean up audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [announcement, onClose]);

  const handleClose = () => {
    // Stop audio when closing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsVisible(false);
    setTimeout(onClose, 500);
  };

  const getAnnouncementIcon = () => {
    switch (announcement.type) {
      case "birthday":
        return <CakeSlice className="w-12 h-12 text-white" />;
      case "emergency":
        return <AlertTriangle className="w-12 h-12 text-white" />;
      default:
        return <Megaphone className="w-12 h-12 text-white" />;
    }
  };

  const getAnnouncementColors = () => {
    switch (announcement.type) {
      case "birthday":
        return "from-pink-400 via-pink-500 to-pink-600";
      case "emergency":
        return "from-red-400 via-red-500 to-red-600";
      default:
        return "from-blue-400 via-blue-500 to-blue-600";
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Sparkle effects */}
      {Array.from({ length: sparkleCount }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-ping"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            animationDelay: `${Math.random() * 0.5}s`
          }}
        >
          <div className="w-4 h-4 bg-blue-400 rounded-full opacity-75"></div>
        </div>
      ))}
      
      <div className={`bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 max-w-2xl w-full mx-4 text-center shadow-2xl transform transition-all duration-500 border-2 border-blue-200 ${
        isVisible ? 'scale-100 rotate-0' : 'scale-95 rotate-1'
      }`}>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </Button>
        
        {/* Announcement header */}
        <div className="relative mb-6">
          <div className={`w-24 h-24 bg-gradient-to-r ${getAnnouncementColors()} rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse shadow-2xl`}>
            {getAnnouncementIcon()}
          </div>
          
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
            <Bell className="w-8 h-8 text-blue-500 animate-bounce" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {announcement.title}
        </h1>
        
        <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
          {announcement.type?.charAt(0).toUpperCase() + announcement.type?.slice(1) || 'Announcement'}
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-700 text-lg leading-relaxed">
            {announcement.content}
          </p>
          
          {announcement.priority && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 font-medium uppercase text-sm tracking-wide">
                {announcement.priority} Priority
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}