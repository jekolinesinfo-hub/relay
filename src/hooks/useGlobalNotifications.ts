import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { playWhatsAppStyleSound } from '@/utils/notificationSound';

export const useGlobalNotifications = (userId: string | null) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    console.log('[GlobalNotifications] Init for user', userId);

    // Global subscription for all messages directed to this user
    const channel = supabase
      .channel('global-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          console.log('[GlobalNotifications] INSERT on messages', payload);
          // Check if this message is for the current user
          const { data: conversation, error: convErr } = await supabase
            .from('conversations')
            .select('participant_1, participant_2')
            .eq('id', payload.new.conversation_id)
            .single();

          if (convErr) {
            console.log('[GlobalNotifications] Conversation fetch error', convErr);
          }

          console.log('[GlobalNotifications] Conversation for message', conversation);

          if (conversation && 
              (conversation.participant_1 === userId || conversation.participant_2 === userId) &&
              payload.new.sender_id !== userId) {
            console.log('[GlobalNotifications] Message is for current user, show notifications');
            
            // Get sender name
            const { data: senderProfile, error: senderErr } = await supabase
              .from('profiles')
              .select('name, display_name')
              .eq('id', payload.new.sender_id)
              .single();

            if (senderErr) {
              console.log('[GlobalNotifications] Sender profile fetch error', senderErr);
            }

            const senderName = senderProfile?.display_name || senderProfile?.name || `User ${payload.new.sender_id.slice(-4)}`;

            // Show global notification only if not in the specific chat
            const currentPath = window.location.pathname;
            const isInChat = currentPath.includes('/chat') || document.querySelector('[data-chat-view="true"]');
            console.log('[GlobalNotifications] isInChat?', !!isInChat);
            
            if (!isInChat) {
              toast({
                title: `Messaggio da ${senderName}`,
                description: payload.new.content || "Nuovo messaggio ricevuto",
                duration: 5000,
              });

              // Play modern WhatsApp-style notification sound
              playWhatsAppStyleSound();

              // Browser notification
              if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                  new Notification(`Messaggio da ${senderName}`, {
                    body: payload.new.content || 'Nuovo messaggio ricevuto',
                    icon: '/favicon.ico',
                    tag: 'global-message',
                    requireInteraction: false,
                  });
                } else if (Notification.permission !== 'denied') {
                  Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                      new Notification(`Messaggio da ${senderName}`, {
                        body: payload.new.content || 'Nuovo messaggio ricevuto',
                        icon: '/favicon.ico',
                        tag: 'global-message',
                        requireInteraction: false,
                      });
                    }
                  });
                }
              }
            }
          } else {
            console.log('[GlobalNotifications] Message not for current user or from self, skipping');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, toast]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
};