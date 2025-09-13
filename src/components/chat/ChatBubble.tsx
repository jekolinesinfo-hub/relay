import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sent: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return '🕐';
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '✓';
    }
  };

  return (
    <div
      className={cn(
        "message-appear flex max-w-[85%] mb-2",
        message.sent ? "ml-auto justify-end" : "mr-auto justify-start"
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-3 py-2 shadow-sm relative",
          message.sent 
            ? "bg-whatsapp-green text-white rounded-br-md" 
            : "bg-chat-bubble-received text-foreground rounded-bl-md"
        )}
        style={{ 
          boxShadow: 'var(--shadow-message)',
          transition: 'var(--transition-smooth)'
        }}
      >
        <p className="text-sm leading-relaxed break-words">
          {message.text}
        </p>
        <div 
          className={cn(
            "flex items-center justify-end gap-1 mt-1 text-xs",
            message.sent ? "text-white/70" : "text-muted-foreground"
          )}
        >
          <span>{formatTime(message.timestamp)}</span>
          {message.sent && (
            <span className={cn(
              "text-xs",
              message.status === 'read' ? "text-blue-300" : "text-white/70"
            )}>
              {getStatusIcon(message.status)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};