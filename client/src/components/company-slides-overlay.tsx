import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface CompanySlidesOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function CompanySlidesOverlay({ isVisible, onClose }: CompanySlidesOverlayProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [slideTimer, setSlideTimer] = useState(0);

  const { data: slides } = useQuery({
    queryKey: ["/api/media-slides"],
    enabled: isVisible,
    refetchInterval: 5000,
  });

  const activeSlides = slides?.filter((slide: any) => slide.isActive) || [];

  useEffect(() => {
    if (!isVisible || activeSlides.length === 0) return;

    const currentSlideData = activeSlides[currentSlide];
    const duration = (currentSlideData?.duration || 10) * 1000; // Convert to milliseconds
    
    setTimeRemaining(duration);
    setSlideTimer(duration);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 100) {
          // Move to next slide or close if last slide
          if (currentSlide < activeSlides.length - 1) {
            setCurrentSlide(currentSlide + 1);
            return (activeSlides[currentSlide + 1]?.duration || 10) * 1000;
          } else {
            onClose();
            return 0;
          }
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, currentSlide, activeSlides, onClose]);

  const nextSlide = () => {
    if (currentSlide < activeSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const progressPercentage = slideTimer > 0 ? ((slideTimer - timeRemaining) / slideTimer) * 100 : 0;

  if (!isVisible || activeSlides.length === 0) return null;

  const slide = activeSlides[currentSlide];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      <div className="w-full h-full max-w-7xl mx-auto p-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-blue-600 text-white">
              Company Update
            </Badge>
            <div className="flex items-center space-x-2 text-white">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {Math.ceil(timeRemaining / 1000)}s remaining
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-4xl bg-white/95 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="relative">
                {slide.type === 'image' && slide.url ? (
                  <img
                    src={slide.url}
                    alt={slide.title}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                ) : slide.type === 'video' && slide.url ? (
                  <video
                    src={slide.url}
                    autoPlay
                    muted
                    loop
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-t-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                      <p className="text-xl opacity-90">{slide.content}</p>
                    </div>
                  </div>
                )}

                {/* Navigation arrows */}
                {activeSlides.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={prevSlide}
                      disabled={currentSlide === 0}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={nextSlide}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </>
                )}
              </div>

              {/* Content Section */}
              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{slide.title}</h1>
                {slide.content && (
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">{slide.content}</p>
                )}
                
                {/* Slide indicators */}
                {activeSlides.length > 1 && (
                  <div className="flex justify-center space-x-2 mt-6">
                    {activeSlides.map((_, index) => (
                      <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        onClick={() => setCurrentSlide(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-4 text-white/70">
            <span className="text-sm">
              Slide {currentSlide + 1} of {activeSlides.length}
            </span>
            <span className="text-sm">•</span>
            <span className="text-sm">
              Auto-advancing in {Math.ceil(timeRemaining / 1000)}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}