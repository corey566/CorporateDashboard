import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Images, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface MediaSlidesProps {
  slides: any[];
}

export default function MediaSlides({ slides }: MediaSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [slides.length]);

  if (!slides || slides.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Images className="w-5 h-5 text-accent mr-2" />
            Company Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-8 text-center">
            <Images className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No media slides available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const slide = slides[currentSlide];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Images className="w-5 h-5 text-accent mr-2" />
          Company Updates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative">
          {slide.type === 'image' && slide.url ? (
            <img
              src={slide.url}
              alt={slide.title}
              className="w-full h-32 object-cover rounded-lg"
            />
          ) : slide.type === 'text' ? (
            <div className="w-full h-32 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center p-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-corporate-800 mb-1">{slide.title}</h3>
                <p className="text-sm text-corporate-600">{slide.content}</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-32 bg-gradient-to-r from-corporate-50 to-blue-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Images className="w-12 h-12 text-corporate-400 mx-auto mb-2" />
                <p className="text-sm text-corporate-500">{slide.title}</p>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
            <h3 className="text-white font-semibold">{slide.title}</h3>
            {slide.content && (
              <p className="text-white/90 text-sm">{slide.content}</p>
            )}
          </div>

          {/* Navigation arrows */}
          {slides.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
        
        {/* Slide indicators */}
        {slides.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-primary' : 'bg-corporate-200'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
