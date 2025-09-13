import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Phone, Settings, Users } from 'lucide-react';

interface SwipeablePagesProps {
  children: React.ReactNode[];
  currentPage: number;
  onPageChange: (page: number) => void;
}

const pages = [
  { name: 'Status', icon: Users },
  { name: 'Chat', icon: MessageCircle },
  { name: 'Chiamate', icon: Phone },
  { name: 'Impostazioni', icon: Settings },
];

export const SwipeablePages = ({ children, currentPage, onPageChange }: SwipeablePagesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      const newTranslateX = -currentPage * 100;
      setTranslateX(newTranslateX);
    }
  }, [currentPage]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    const newTranslateX = -currentPage * 100 + (diff / window.innerWidth) * 100;
    setTranslateX(newTranslateX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;
    const threshold = window.innerWidth * 0.2; // 20% of screen width
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentPage > 0) {
        onPageChange(currentPage - 1);
      } else if (diff < 0 && currentPage < children.length - 1) {
        onPageChange(currentPage + 1);
      }
    }
    
    setIsDragging(false);
    setTranslateX(-currentPage * 100);
  };

  const handleMouseStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const diff = currentX - startX;
    const newTranslateX = -currentPage * 100 + (diff / window.innerWidth) * 100;
    setTranslateX(newTranslateX);
  };

  const handleMouseEnd = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const endX = e.clientX;
    const diff = endX - startX;
    const threshold = window.innerWidth * 0.2;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentPage > 0) {
        onPageChange(currentPage - 1);
      } else if (diff < 0 && currentPage < children.length - 1) {
        onPageChange(currentPage + 1);
      }
    }
    
    setIsDragging(false);
    setTranslateX(-currentPage * 100);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Navigation dots */}
      <div className="flex justify-center gap-2 py-2 bg-gradient-to-r from-relay-primary to-relay-secondary flex-shrink-0">
        {pages.map((page, index) => {
          const IconComponent = page.icon;
          return (
            <button
              key={index}
              onClick={() => onPageChange(index)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentPage === index 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-xs font-medium">{page.name}</span>
            </button>
          );
        })}
      </div>

      {/* Swipeable content */}
      <div 
        ref={containerRef}
        className="flex flex-1 touch-pan-x select-none overflow-hidden"
        style={{
          transform: `translateX(${translateX}%)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseStart}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseEnd}
        onMouseLeave={handleMouseEnd}
      >
        {children.map((child, index) => (
          <div 
            key={index}
            className="flex-shrink-0 w-full h-full overflow-y-auto"
            style={{ minWidth: '100%' }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};