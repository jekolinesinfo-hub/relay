import { useState, useRef, useEffect } from 'react';


interface SwipeablePagesProps {
  children: React.ReactNode[];
  currentPage: number;
  onPageChange: (page: number) => void;
}


export const SwipeablePages = ({ children, currentPage, onPageChange }: SwipeablePagesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const startYRef = useRef(0);
  const isSwipingRef = useRef(false);
  const [translateX, setTranslateX] = useState(0);

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    if (target.closest('[data-swipe-exempt="true"]')) return true;
    return !!target.closest('input, textarea, select, button, [role="button"], [contenteditable="true"]');
  };

  useEffect(() => {
    if (containerRef.current) {
      const newTranslateX = -currentPage * 100;
      setTranslateX(newTranslateX);
    }
  }, [currentPage]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isInteractiveTarget(e.target)) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    startYRef.current = e.touches[0].clientY;
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const dx = currentX - startX;
    const dy = currentY - startYRef.current;

    // Direction lock: only start horizontal swipe when dominant
    if (!isSwipingRef.current) {
      if (Math.abs(dx) < 16 || Math.abs(dx) <= Math.abs(dy) * 1.2) {
        return; // treat as vertical scroll or minor movement
      }
      isSwipingRef.current = true;
    }

    e.preventDefault(); // prevent vertical scroll while swiping between pages
    const newTranslateX = -currentPage * 100 + (dx / window.innerWidth) * 100;
    setTranslateX(newTranslateX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const endX = e.changedTouches[0].clientX;
    const dx = endX - startX;
    const thresholdPx = Math.max(window.innerWidth * 0.35, 90); // less sensitive

    if (isSwipingRef.current && Math.abs(dx) > thresholdPx) {
      if (dx > 0 && currentPage > 0) {
        onPageChange(currentPage - 1);
      } else if (dx < 0 && currentPage < children.length - 1) {
        onPageChange(currentPage + 1);
      }
    }

    setIsDragging(false);
    isSwipingRef.current = false;
    setTranslateX(-currentPage * 100);
  };

  const handleMouseStart = (e: React.MouseEvent) => {
    if (isInteractiveTarget(e.target)) return;
    setIsDragging(true);
    setStartX(e.clientX);
    startYRef.current = e.clientY;
    isSwipingRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startYRef.current;

    if (!isSwipingRef.current) {
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy) * 1.2) {
        return;
      }
      isSwipingRef.current = true;
    }

    const newTranslateX = -currentPage * 100 + (dx / window.innerWidth) * 100;
    setTranslateX(newTranslateX);
  };

  const handleMouseEnd = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const thresholdPx = Math.max(window.innerWidth * 0.35, 90);

    if (isSwipingRef.current && Math.abs(dx) > thresholdPx) {
      if (dx > 0 && currentPage > 0) {
        onPageChange(currentPage - 1);
      } else if (dx < 0 && currentPage < children.length - 1) {
        onPageChange(currentPage + 1);
      }
    }

    setIsDragging(false);
    isSwipingRef.current = false;
    setTranslateX(-currentPage * 100);
  };

  return (
    <div className="relative flex flex-col h-full bg-background overflow-hidden overscroll-contain pb-[env(safe-area-inset-bottom)]">

      {/* Swipeable content */}
      <div 
        ref={containerRef}
        className="flex flex-1 min-h-0 touch-pan-x"
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
            className="flex-shrink-0 w-full h-full min-h-0 overflow-hidden"
            style={{ minWidth: '100%' }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};