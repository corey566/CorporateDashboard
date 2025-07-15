import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, DollarSign, Target, Calendar } from "lucide-react";
import confetti from "canvas-confetti";

interface CashOfferPopupProps {
  offer: any;
  onClose: () => void;
}

export default function CashOfferPopup({ offer, onClose }: CashOfferPopupProps) {
  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#059669', '#047857']
    });

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in-0">
      <Card className="w-full max-w-md mx-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 shadow-2xl animate-in slide-in-from-bottom-4">
        <CardHeader className="relative pb-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 text-green-600 hover:text-green-800 hover:bg-green-200"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-center text-xl font-bold text-green-800">
            New Cash Offer Available!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              {offer.title}
            </h3>
            <p className="text-green-700 text-sm mb-3">
              {offer.description}
            </p>
          </div>
          
          <div className="flex justify-center mb-4">
            <Badge className="bg-green-500 text-white text-lg px-4 py-2">
              ${offer.reward}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-green-700">
                <Target className="w-4 h-4 mr-1" />
                Target Sales:
              </div>
              <span className="font-semibold text-green-800">{offer.target}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-green-700">
                <Calendar className="w-4 h-4 mr-1" />
                Expires:
              </div>
              <span className="font-semibold text-green-800">
                {new Date(offer.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="text-center pt-4">
            <p className="text-green-600 text-sm font-medium">
              Good luck reaching your target! 🎯
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}