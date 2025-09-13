import { useState, useEffect } from 'react';
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
}

export const useContacts = (userId: string) => {
  const [contacts, setContacts] = useState<DatabaseContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchContacts = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Get all contacts for this user
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('contact_id, contact_name')
        .eq('user_id', userId);

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        return;
      }

      // Get conversations with these contacts
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        return;
      }

      const formattedContacts: DatabaseContact[] = contactsData
        .map((contact) => {
          // Find conversation with this contact
          const conversation = conversationsData.find(
            (conv) =>
              (conv.participant_1 === userId && conv.participant_2 === contact.contact_id) ||
              (conv.participant_2 === userId && conv.participant_1 === contact.contact_id)
          );

          return {
            id: contact.contact_id,
            name: contact.contact_name || 'Unknown User',
            lastMessage: conversation?.last_message || '',
            timestamp: conversation ? new Date(conversation.updated_at) : undefined,
            unreadCount: 0,
            isOnline: Math.random() > 0.5,
            conversationId: conversation?.id,
          };
        })
        .sort((a, b) => {
          if (!a.timestamp) return 1;
          if (!b.timestamp) return -1;
          return b.timestamp.getTime() - a.timestamp.getTime();
        });

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
    }
  }, [userId]);

  return {
    contacts,
    isLoading,
    addContact,
    deleteContact,
    refreshContacts: fetchContacts,
  };
};