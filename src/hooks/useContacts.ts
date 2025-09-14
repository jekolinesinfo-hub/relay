import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface DatabaseContact {
  id: string;
  name: string;
  lastMessage?: string;
  timestamp?: Date;
  unreadCount?: number;
  isOnline?: boolean;
  conversationId?: string;
  hasNewMessage?: boolean;
}

export const useContacts = (userId: string) => {
  const [contacts, setContacts] = useState<DatabaseContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const fetchContacts = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      // 1) Fetch saved contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('contact_id, contact_name')
        .eq('user_id', userId);

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        return;
      }

      // 2) Fetch all conversations that involve the user (even if not in contacts)
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        return;
      }

      // Build a quick lookup for conversations by the other participant
      const convByPartner = new Map<string, any>();
      (conversationsData || []).forEach((conv: any) => {
        const otherId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;
        // Keep the most recent conversation if duplicates
        const prev = convByPartner.get(otherId);
        if (!prev || new Date(conv.updated_at).getTime() > new Date(prev.updated_at).getTime()) {
          convByPartner.set(otherId, conv);
        }
      });

      // 3) Build profiles lookup for all involved partner IDs (contacts + conversations)
      const knownIds = new Set((contactsData || []).map((c) => c.contact_id));
      const convPartnerIds: string[] = [];
      convByPartner.forEach((_conv, partnerId) => convPartnerIds.push(partnerId));
      const contactIds: string[] = (contactsData || []).map((c) => c.contact_id);
      const allPartnerIds = Array.from(new Set([...contactIds, ...convPartnerIds]));

      let profilesLookup = new Map<string, { name?: string; display_name?: string }>();
      if (allPartnerIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, display_name')
          .in('id', allPartnerIds);
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          profilesLookup = new Map(
            (profilesData || []).map((p: any) => [p.id, { name: p.name, display_name: p.display_name }])
          );
        }
      }

      // 4) Prepare list of contacts coming from contacts table, prefer profile names
      const baseContacts: DatabaseContact[] = (contactsData || []).map((contact) => {
        const conversation = convByPartner.get(contact.contact_id);
        const profile = profilesLookup.get(contact.contact_id);
        const computedName = profile?.display_name || profile?.name || contact.contact_name || `User ${contact.contact_id.slice(-4)}`;
        return {
          id: contact.contact_id,
          name: computedName,
          lastMessage: conversation?.last_message || '',
          timestamp: conversation ? new Date(conversation.updated_at) : undefined,
          unreadCount: 0,
          isOnline: Math.random() > 0.5,
          conversationId: conversation?.id,
        } as DatabaseContact;
      });

      // 5) Add virtual contacts from conversations not already in contacts
      const missingIds: string[] = [];
      convByPartner.forEach((_conv, partnerId) => {
        if (!knownIds.has(partnerId)) missingIds.push(partnerId);
      });

      const virtualContacts: DatabaseContact[] = missingIds.map((partnerId) => {
        const conv = convByPartner.get(partnerId);
        const profile = profilesLookup.get(partnerId);
        const fallbackName = profile?.display_name || profile?.name || `User ${partnerId.slice(-4)}`;
        return {
          id: partnerId,
          name: fallbackName,
          lastMessage: conv?.last_message || '',
          timestamp: conv ? new Date(conv.updated_at) : undefined,
          unreadCount: 0,
          isOnline: Math.random() > 0.5,
          conversationId: conv?.id,
        } as DatabaseContact;
      });

      // 5) Merge and sort by timestamp desc (conversations first) and apply unread counts
      const mergedMap = new Map<string, DatabaseContact>();
      [...baseContacts, ...virtualContacts].forEach((c) => {
        const existing = mergedMap.get(c.id);
        if (!existing) {
          mergedMap.set(c.id, c);
        } else {
          // Prefer entries with conversation info and newer timestamps
          const existingTime = existing.timestamp ? existing.timestamp.getTime() : 0;
          const currentTime = c.timestamp ? c.timestamp.getTime() : 0;
          if (currentTime > existingTime) mergedMap.set(c.id, c);
          else if (!existing.conversationId && c.conversationId) mergedMap.set(c.id, c);
        }
      });

      const formattedContacts = Array.from(mergedMap.values()).map(contact => ({
        ...contact,
        unreadCount: unreadCounts[contact.id] || 0,
        hasNewMessage: (unreadCounts[contact.id] || 0) > 0
      })).sort((a, b) => {
        const at = a.timestamp ? a.timestamp.getTime() : 0;
        const bt = b.timestamp ? b.timestamp.getTime() : 0;
        return bt - at;
      });

      console.log('[Contacts] Formatted contacts with unread counts:', formattedContacts.map(c => ({ id: c.id, name: c.name, unread: c.unreadCount, hasNew: c.hasNewMessage })));
      setContacts(formattedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addContact = async (contactId: string, contactName: string) => {
    try {
      // Check if contact profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', contactId)
        .maybeSingle();

      if (!profileData && (!profileError || profileError.code === 'PGRST116')) {
        toast({
          title: 'Utente non trovato',
          description: `L'ID ${contactId} non corrisponde a nessun utente registrato`,
          variant: 'destructive',
        });
        return false;
      }

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking profile:', profileError);
        return false;
      }

      // Check if contact already exists
      const { data: existingContact } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .eq('contact_id', contactId)
        .maybeSingle();

      if (existingContact) {
        toast({
          title: 'Contatto già esistente',
          description: 'Questo contatto è già nella tua lista',
          variant: 'destructive',
        });
        return false;
      }

      // Add contact
      const { error: addError } = await supabase
        .from('contacts')
        .insert({
          user_id: userId,
          contact_id: contactId,
          contact_name: contactName || profileData?.name || `User ${contactId}`,
        });

      if (addError) {
        console.error('Error adding contact:', addError);
        toast({
          title: 'Errore',
          description: 'Impossibile aggiungere il contatto',
          variant: 'destructive',
        });
        return false;
      }

      // Create or find conversation
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .or(`
          and(participant_1.eq.${userId},participant_2.eq.${contactId}),
          and(participant_1.eq.${contactId},participant_2.eq.${userId})
        `)
        .maybeSingle();

      if (!existingConversation) {
        await supabase
          .from('conversations')
          .insert({
            participant_1: userId,
            participant_2: contactId,
          });
      }

      toast({
        title: 'Contatto aggiunto!',
        description: `${contactName} è stato aggiunto ai tuoi contatti`,
      });

      // Refresh contacts
      await fetchContacts();
      return true;

    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiungere il contatto',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('user_id', userId)
        .eq('contact_id', contactId);

      if (error) {
        console.error('Error deleting contact:', error);
        return false;
      }

      // Refresh contacts
      await fetchContacts();
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      return false;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchContacts();

      // Realtime updates: refresh list on new messages or conversation updates
      const channel = supabase
        .channel('contacts-conv-updates')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
          // Check if message is for current user and increment unread count
          const { data: conversation } = await supabase
            .from('conversations')
            .select('participant_1, participant_2')
            .eq('id', payload.new.conversation_id)
            .single();

          if (conversation && 
              (conversation.participant_1 === userId || conversation.participant_2 === userId) &&
              payload.new.sender_id !== userId) {
            // This is a message for current user from someone else
            const senderId = payload.new.sender_id;
            console.log('[Contacts] New message for current user from', senderId, 'payload:', payload.new);
            setUnreadCounts(prev => ({
              ...prev,
              [senderId]: (prev[senderId] || 0) + 1
            }));
          }
          // Rely on unreadCounts effect to refresh contacts
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, () => {
          fetchContacts();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  // Refetch contacts when unread counts change to immediately reflect badges/labels
  useEffect(() => {
    if (userId) {
      fetchContacts();
    }
  }, [unreadCounts, userId]);

  const searchUserByIdPartial = useCallback(async (partialId: string) => {
    if (!partialId || partialId.length < 2) return [];
    
    try {
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('id, name, display_name')
        .ilike('id', `${partialId}%`)
        .limit(5);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return profilesData || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }, []);

  const markAsRead = (contactId: string) => {
    setUnreadCounts(prev => {
      const updated = { ...prev };
      delete updated[contactId];
      return updated;
    });
    // Update the specific contact in the list
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, unreadCount: 0, hasNewMessage: false }
        : contact
    ));
  };

  return {
    contacts,
    isLoading,
    addContact,
    deleteContact,
    refreshContacts: fetchContacts,
    searchUserByIdPartial,
    markAsRead,
  };
};