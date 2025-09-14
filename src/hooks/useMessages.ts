import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { playModernNotificationSound } from '@/utils/notificationSound';

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
           
           setMessages((prev) => (prev.some(m => m.id === newMessage.id) ? prev : [...prev, newMessage]));

          // Show notification for received messages
          if (payload.new.sender_id !== userId) {
            toast({
              title: "Nuovo messaggio",
              description: payload.new.content || "Hai ricevuto un nuovo messaggio",
              duration: 3000,
            });

            // Play modern notification sound
            playModernNotificationSound();

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

  const sendMessage = async (text: string, recipientId: string): Promise<string | undefined> => {
    const trimmed = text.trim();
    if (!trimmed || !userId) {
      console.log('Cannot send message: missing text or userId', { trimmed, userId });
      return;
    }

    // Ensure we have a conversation id (find or create)
    let convId = conversationId || '';
    try {
      if (!convId) {
        console.log('[useMessages] No conversationId, searching/creating for', { userId, recipientId });
        const { data: existingConversation, error: findErr } = await supabase
          .from('conversations')
          .select('*')
          .or(`and(participant_1.eq.${userId},participant_2.eq.${recipientId}),and(participant_1.eq.${recipientId},participant_2.eq.${userId})`)
          .maybeSingle();

        if (findErr && findErr.code !== 'PGRST116') {
          console.error('Error finding conversation:', findErr);
        }

        if (existingConversation) {
          convId = existingConversation.id;
        } else {
          const { data: newConv, error: createErr } = await supabase
            .from('conversations')
            .insert({ participant_1: userId, participant_2: recipientId })
            .select()
            .single();
          if (createErr || !newConv) {
            console.error('Error creating conversation:', createErr);
            toast({
              title: 'Errore',
              description: 'Impossibile creare la conversazione',
              variant: 'destructive',
            });
            return;
          }
          convId = newConv.id;
          console.log('[useMessages] Conversation created', newConv);
        }
      }

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const tempMessage: Message = {
        id: tempId,
        text: trimmed,
        timestamp: new Date(),
        sent: true,
        status: 'sending',
        sender_id: userId,
        conversation_id: convId,
      };
      setMessages((prev) => [...prev, tempMessage]);

      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: convId,
            sender_id: userId,
            content: trimmed,
          },
        ])
        .select()
        .maybeSingle();

      if (error || !data) {
        console.error('Error sending message:', error);
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        toast({
          title: 'Errore',
          description: `Impossibile inviare il messaggio${error?.message ? `: ${error.message}` : ''}`,
          variant: 'destructive',
        });
        return;
      }

      // Replace optimistic message
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

      // Update conversation summary
      await supabase
        .from('conversations')
        .update({ last_message: trimmed, last_message_at: new Date().toISOString() })
        .eq('id', convId);

      return convId;
    } catch (error) {
      console.error('Error sending message (catch):', error);
      toast({ title: 'Errore', description: 'Invio fallito', variant: 'destructive' });
      return;
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
  };
};