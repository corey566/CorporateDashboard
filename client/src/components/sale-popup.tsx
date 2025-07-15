import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, X, DollarSign, Star, Users, Calendar } from "lucide-react";
import confetti from "canvas-confetti";
import applauseSoundPath from "../assets/applause-cheer.mp3";

interface SalePopupProps {
  sale: any;
  onClose: () => void;
}

export default function SalePopup({ sale, onClose }: SalePopupProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [applauseCount, setApplauseCount] = useState(0);

  // Confetti animation
  const fireConfetti = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
    
    // Reduced confetti bursts
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: colors,
      gravity: 0.9,
      scalar: 1.0
    });
    
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.7, x: 0.3 },
        colors: colors,
        gravity: 0.8,
        scalar: 0.7
      });
    }, 150);
    
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.7, x: 0.7 },
        colors: colors,
        gravity: 0.8,
        scalar: 0.7
      });
    }, 300);
  };

  // Applause sound effect
  const playApplause = () => {
    try {
      const audio = new Audio(applauseSoundPath);
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback if audio fails
        console.log('Applause sound effect triggered');
      });
    } catch (error) {
      console.log('Audio playback failed, using fallback');
    }
  };

  // Applause effect
  const createApplause = () => {
    setApplauseCount(prev => prev + 1);
    setTimeout(() => setApplauseCount(prev => prev - 1), 1000);
  };

  useEffect(() => {
    // Trigger confetti and applause immediately
    fireConfetti();
    playApplause();
    
    // Trigger applause effect multiple times
    const applauseInterval = setInterval(createApplause, 400);
    setTimeout(() => clearInterval(applauseInterval), 2000);
    
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(applauseInterval);
    };
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 500);
  };

  const handleCelebrate = () => {
    fireConfetti();
    playApplause();
    createApplause();
  };

  return (
    <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Applause effects */}
      {Array.from({ length: applauseCount }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-ping"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            animationDelay: `${Math.random() * 0.5}s`
          }}
        >
          <div className="w-6 h-6 bg-yellow-400 rounded-full opacity-75"></div>
        </div>
      ))}
      
      <div className={`bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 max-w-2xl w-full mx-4 text-center shadow-2xl transform transition-all duration-500 border-2 border-yellow-200 ${
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
        
        {/* Celebration header */}
        <div className="relative mb-6">
          <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse shadow-2xl">
            <Trophy className="w-16 h-16 text-white" />
          </div>
          
          {/* Floating stars */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 text-yellow-400 animate-bounce absolute"
                style={{
                  left: `${i * 8 - 16}px`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Agent photo and info */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <img
              src={sale.agentPhoto || `https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200`}
              alt={sale.agentName}
              className="w-24 h-24 rounded-full object-cover border-4 border-yellow-400 shadow-lg"
            />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <Trophy className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            CONGRATULATIONS!
          </h2>
          
          <h3 className="text-2xl font-semibold text-corporate-800 mb-2">
            {sale.agentName}
          </h3>
          
          <p className="text-lg text-corporate-600 mb-4">
            Just closed an amazing deal! 🎯
          </p>
        </div>
        
        {/* Sale details */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border border-gray-100">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                ${parseFloat(sale.amount).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Sale Amount</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {sale.units}
              </p>
              <p className="text-sm text-gray-500">Units Sold</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Client:</span> {sale.clientName}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Category:</span> {sale.category}
            </p>
            {sale.description && (
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Description:</span> {sale.description}
              </p>
            )}
            {sale.subscriptionPeriod && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Subscription:</span> {sale.subscriptionPeriod} months
              </p>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={handleCelebrate}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            🎉 Celebrate More!
          </Button>
          
          <Button
            onClick={handleClose}
            variant="outline"
            className="border-2 border-gray-300 text-gray-600 hover:bg-gray-100 px-8 py-3 rounded-full text-lg font-semibold"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
