import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sent: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  sender_id: string;
  conversation_id: string;
}

export const useMessages = (conversationId: string | null, userId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }

        const formattedMessages: Message[] = data.map((msg) => ({
          id: msg.id,
          text: msg.content || '',
          timestamp: new Date(msg.created_at),
          sent: msg.sender_id === userId,
          status: 'sent',
          sender_id: msg.sender_id,
          conversation_id: msg.conversation_id,
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            text: payload.new.content || '',
            timestamp: new Date(payload.new.created_at),
            sent: payload.new.sender_id === userId,
            status: 'sent',
            sender_id: payload.new.sender_id,
            conversation_id: payload.new.conversation_id,
          };
          
          setMessages((prev) => [...prev, newMessage]);

          // Show notification for received messages
          if (payload.new.sender_id !== userId) {
            toast({
              title: "Nuovo messaggio",
              description: payload.new.content || "Hai ricevuto un nuovo messaggio",
              duration: 3000,
            });

            // Play notification sound
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxEw4fH');
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Could not play notification sound:', e));

            // Browser notification if tab is not active
            if (document.hidden && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification('Nuovo messaggio', {
                  body: payload.new.content || 'Hai ricevuto un nuovo messaggio',
                  icon: '/favicon.ico',
                  tag: 'new-message'
                });
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    new Notification('Nuovo messaggio', {
                      body: payload.new.content || 'Hai ricevuto un nuovo messaggio',
                      icon: '/favicon.ico',
                      tag: 'new-message'
                    });
                  }
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, userId]);

  const sendMessage = async (text: string, recipientId: string) => {
    if (!conversationId || !text.trim()) {
      console.log('Cannot send message:', { conversationId, text: text.trim() });
      return;
    }

    console.log('Sending message:', { conversationId, userId, text, recipientId });

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      text,
      timestamp: new Date(),
      sent: true,
      status: 'sending',
      sender_id: userId,
      conversation_id: conversationId,
    };

    // Add optimistic message
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_id: userId,
            content: text,
          }
        ])
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error sending message:', error);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        toast({
          title: 'Errore',
          description: `Impossibile inviare il messaggio: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      if (!data) {
        console.error('No data returned from message insert');
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        toast({
          title: 'Errore',
          description: 'Impossibile inviare il messaggio - nessun dato ritornato',
          variant: 'destructive',
        });
        return;
      }

      console.log('Message sent successfully:', data);

      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                id: data.id,
                status: 'sent',
              }
            : msg
        )
      );

        await supabase
        .from('conversations')
        .update({
          last_message: text,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      toast({
        title: 'Errore',
        description: 'Impossibile inviare il messaggio',
        variant: 'destructive',
      });
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
  };
};