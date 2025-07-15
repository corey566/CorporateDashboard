import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft, ArrowRight } from "lucide-react";

interface FullscreenMediaPresentationProps {
  slides: any[];
  isVisible: boolean;
  onComplete: () => void;
}

export default function FullscreenMediaPresentation({ 
  slides, 
  isVisible, 
  onComplete 
}: FullscreenMediaPresentationProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!isVisible || !slides || slides.length === 0) {
      return;
    }

    const slide = slides[currentSlide];
    const duration = (slide?.duration || 10) * 1000;
    setTimeLeft(duration / 1000);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Move to next slide or complete presentation
          if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
            return (slides[currentSlide + 1]?.duration || 10);
          } else {
            onComplete();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, currentSlide, slides, onComplete]);

  useEffect(() => {
    if (isVisible) {
      setCurrentSlide(0);
    }
  }, [isVisible]);

  if (!isVisible || !slides || slides.length === 0) {
    return null;
  }

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Timer and progress indicator */}
      <div className="absolute top-4 right-4 flex items-center space-x-4 text-white">
        <Badge variant="secondary" className="bg-black/50 text-white">
          <Clock className="w-4 h-4 mr-1" />
          {timeLeft}s
        </Badge>
        <Badge variant="secondary" className="bg-black/50 text-white">
          {currentSlide + 1} / {slides.length}
        </Badge>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white p-2 rounded-full bg-black/30 hover:bg-black/50"
        disabled={currentSlide === 0}
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white p-2 rounded-full bg-black/30 hover:bg-black/50"
        disabled={currentSlide === slides.length - 1}
      >
        <ArrowRight className="w-6 h-6" />
      </button>

      {/* Slide content */}
      <div className="w-full h-full flex items-center justify-center p-8">
        {slide.type === 'image' && slide.imageUrl ? (
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <Card className="max-w-4xl w-full bg-gradient-to-br from-corporate-50 to-corporate-100 border-2 border-corporate-200">
            <CardContent className="p-12 text-center">
              {slide.title && (
                <h1 className="text-4xl font-bold text-corporate-900 mb-6">
                  {slide.title}
                </h1>
              )}
              {slide.content && (
                <p className="text-xl text-corporate-700 leading-relaxed">
                  {slide.content}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/30">
        <div 
          className="h-full bg-gradient-to-r from-accent to-accent-foreground transition-all duration-1000"
          style={{ 
            width: `${((slides[currentSlide]?.duration || 10) - timeLeft) / (slides[currentSlide]?.duration || 10) * 100}%` 
          }}
        />
      </div>
    </div>
  );
}