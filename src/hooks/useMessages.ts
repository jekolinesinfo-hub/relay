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
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, userId]);

  const sendMessage = async (text: string, recipientId: string) => {
    if (!conversationId || !text.trim()) return;

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
        .single();

      if (error) {
        console.error('Error sending message:', error);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        toast({
          title: 'Errore',
          description: 'Impossibile inviare il messaggio',
          variant: 'destructive',
        });
        return;
      }

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

      // Update conversation last message
      await supabase
        .from('conversations')
        .update({
          last_message: text,
          updated_at: new Date().toISOString(),
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