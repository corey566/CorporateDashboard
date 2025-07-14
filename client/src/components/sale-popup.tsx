import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, X, DollarSign } from "lucide-react";

interface SalePopupProps {
  sale: any;
  onClose: () => void;
}

export default function SalePopup({ sale, onClose }: SalePopupProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow fade out animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl transform transition-all duration-300 ${
        isVisible ? 'scale-100' : 'scale-95'
      }`}>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={handleClose}
        >
          <X className="w-4 h-4" />
        </Button>
        
        <div className="w-20 h-20 bg-gradient-to-r from-accent to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-corporate-800 mb-2">Congratulations!</h2>
        
        <div className="space-y-2 mb-4">
          <p className="text-lg text-corporate-600">
            <span className="font-semibold">{sale.agentName}</span> just closed a deal!
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-corporate-500">
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>${parseFloat(sale.amount).toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>📦</span>
              <span>{sale.units} units</span>
            </div>
          </div>
          
          <p className="text-sm text-corporate-500">
            Client: {sale.clientName}
          </p>
        </div>
        
        <Button
          onClick={handleClose}
          className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg"
        >
          Awesome! 🎉
        </Button>
      </div>
    </div>
  );
}
