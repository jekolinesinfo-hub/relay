import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Mic } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = 120; // Max 4-5 lines
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
    }
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      // Reset height after sending
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }, 0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const handleFocus = () => {
    // Avoid forcing page scroll on focus; just ensure height is correct
    setTimeout(() => {
      adjustTextareaHeight();
    }, 0);
  };

  return (
    <div className="bg-background border-t border-border px-3 py-4 safe-area-inset-bottom">
      <div className="flex items-end gap-3 max-w-none">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-whatsapp-green p-2 h-10 w-10 flex-shrink-0 mb-1"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            placeholder="Scrivi un messaggio..."
            className="bg-chat-input border-border rounded-2xl pr-14 resize-none text-base leading-5 min-h-[44px] max-h-[120px] py-3 px-4 focus-visible:ring-2 focus-visible:ring-whatsapp-green focus-visible:ring-offset-0"
            disabled={disabled}
            autoComplete="off"
            autoCorrect="on"
            autoCapitalize="sentences"
            spellCheck="true"
            rows={1}
          />
          
          {message.trim() ? (
            <Button
              onClick={handleSend}
              disabled={disabled}
              className="absolute right-2 bottom-2 h-9 w-9 p-0 bg-whatsapp-green hover:bg-whatsapp-green-dark rounded-full flex-shrink-0"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="absolute right-2 bottom-2 h-9 w-9 p-0 text-muted-foreground hover:text-whatsapp-green flex-shrink-0"
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};