import { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatabaseContact } from '@/hooks/useContacts';

interface ChatItemProps {
  contact: DatabaseContact;
  onSelect: (contact: DatabaseContact) => void;
  onDelete: (contactId: string) => void;
  formatTimestamp: (date?: Date) => string;
}

export const ChatItem = ({ contact, onSelect, onDelete, formatTimestamp }: ChatItemProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    startX.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    
    const diff = clientX - startX.current;
    const maxSwipe = 80; // Maximum swipe distance
    
    // Only allow left swipe (negative values) and limit vertical scroll interference
    if (diff <= 0) {
      const newTranslateX = Math.max(diff, -maxSwipe);
      setTranslateX(newTranslateX);
      setShowDelete(Math.abs(newTranslateX) > 30);
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (Math.abs(translateX) > 40) {
      // Show delete button
      setTranslateX(-80);
      setShowDelete(true);
    } else {
      // Snap back
      setTranslateX(0);
      setShowDelete(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
    // Prevent page scroll during swipe
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleMove(e.touches[0].clientX);
      // Prevent page scroll during swipe
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    handleEnd();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(contact.id);
  };

  const handleClick = () => {
    if (showDelete) {
      // Reset if delete button is showing
      setTranslateX(0);
      setShowDelete(false);
    } else {
      onSelect(contact);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Delete button background */}
      <div className="absolute right-0 top-0 h-full w-20 bg-red-500 flex items-center justify-center">
        <Button
          onClick={handleDelete}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-red-600 p-2 h-full w-full"
        >
          <Trash2 className="h-6 w-6" />
        </Button>
      </div>

      {/* Chat item */}
      <div
        ref={containerRef}
        className="relative bg-background border-b hover:bg-accent/50 cursor-pointer transition-colors touch-pan-y"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center gap-3 p-4">
          <div className="relative">
            <div className="w-12 h-12 bg-whatsapp-green-light rounded-full flex items-center justify-center">
              <span className="text-whatsapp-green font-medium text-lg">
                {contact.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {contact.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground truncate">{contact.name}</h3>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(contact.timestamp)}
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-muted-foreground truncate flex-1 mr-2">
                {(contact.hasNewMessage || (contact.unreadCount ?? 0) > 0) ? (
                  <span className="text-whatsapp-green font-medium">Nuovo messaggio</span>
                ) : (
                  contact.lastMessage || `ID: ${contact.id}`
                )}
              </p>
              <div className="flex items-center gap-2">
                {(contact.unreadCount ?? 0) > 0 && (
                  <span className="bg-whatsapp-green text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-medium">
                    {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};