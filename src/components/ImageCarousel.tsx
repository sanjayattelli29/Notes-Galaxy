
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
  images: string[];
  interval?: number; // Interval in milliseconds for automatic sliding
  size?: "small" | "medium" | "large";
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  interval = 5000,
  size = "medium"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide if more than one image
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  if (!images.length) return null;

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const getSizeClass = () => {
    switch (size) {
      case "small": return "max-h-[120px]";
      case "large": return "max-h-[220px]";
      case "medium":
      default: return "max-h-[180px]";
    }
  };

  return (
    <div className={`relative rounded-md overflow-hidden ${getSizeClass()}`}>
      <img 
        src={images[currentIndex]} 
        alt={`Image ${currentIndex + 1}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.src = '/placeholder.svg';
        }}
      />
      
      {images.length > 1 && (
        <>
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/40 text-white hover:bg-black/60"
            onClick={goToPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/40 text-white hover:bg-black/60"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
            {images.map((_, index) => (
              <span 
                key={index} 
                className={`h-1.5 w-1.5 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
