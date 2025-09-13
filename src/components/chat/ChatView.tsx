import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { useMessages, Message } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { DatabaseContact } from "@/hooks/useContacts";

interface ChatViewProps {
  contact: DatabaseContact;
  onBack: () => void;
}

export const ChatView = ({ contact, onBack }: ChatViewProps) => {
  const { userId } = useAuth();
  const { messages, sendMessage } = useMessages(contact.conversationId || null, userId || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!userId || !contact.conversationId) return;
    await sendMessage(text, contact.id);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ChatHeader
        contactName={contact.name}
        contactId={contact.id}
        isOnline={contact.isOnline}
        onBack={onBack}
      />
      
      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto px-2 py-2 pb-safe"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f5f5f5' fill-opacity='0.3'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: 'hsl(var(--chat-background))'
        }}
      >
        <div className="w-full max-w-none">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="flex-shrink-0">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};