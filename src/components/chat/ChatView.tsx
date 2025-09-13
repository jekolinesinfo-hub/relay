import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sent: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface Contact {
  id: string;
  name: string;
  isOnline?: boolean;
}

interface ChatViewProps {
  contact: Contact;
  onBack: () => void;
}

export const ChatView = ({ contact, onBack }: ChatViewProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Ciao! Questo è un messaggio di test da ${contact.name}`,
      timestamp: new Date(Date.now() - 60000),
      sent: false,
      status: 'read'
    },
    {
      id: '2', 
      text: 'Ciao! Come stai?',
      timestamp: new Date(Date.now() - 30000),
      sent: true,
      status: 'read'
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      sent: true,
      status: 'sending'
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Simula invio messaggio - qui andrà la logica di rete
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        contactName={contact.name}
        contactId={contact.id}
        isOnline={contact.isOnline}
        onBack={onBack}
      />
      
      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-2"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f5f5f5' fill-opacity='0.3'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: 'hsl(var(--chat-background))'
        }}
      >
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};