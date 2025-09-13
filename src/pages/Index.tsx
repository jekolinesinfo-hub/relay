import { useState } from "react";
import { ChatList } from "@/components/chat/ChatList";
import { ChatView } from "@/components/chat/ChatView";
import { AddContactModal } from "@/components/chat/AddContactModal";
import { useUserId } from "@/hooks/useUserId";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
  timestamp?: Date;
  unreadCount?: number;
  isOnline?: boolean;
}

const Index = () => {
  const { userId } = useUserId();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 'DEMO1234',
      name: 'Demo Contact',
      lastMessage: 'Messaggio di prova per testare l\'interfaccia',
      timestamp: new Date(Date.now() - 300000),
      unreadCount: 2,
      isOnline: true
    }
  ]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);

  const handleAddContact = (contactId: string, contactName: string) => {
    // Controlla se il contatto esiste già
    const existingContact = contacts.find(c => c.id === contactId);
    if (existingContact) {
      toast({
        title: "Contatto già esistente",
        description: `${contactName} è già nei tuoi contatti`,
        variant: "destructive",
      });
      return;
    }

    const newContact: Contact = {
      id: contactId,
      name: contactName,
      isOnline: Math.random() > 0.5, // Simula stato online casuale
    };

    setContacts(prev => [...prev, newContact]);
    toast({
      title: "Contatto aggiunto!",
      description: `${contactName} è stato aggiunto ai tuoi contatti`,
    });
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    // Reset unread count quando si apre la chat
    setContacts(prev =>
      prev.map(c => c.id === contact.id ? { ...c, unreadCount: 0 } : c)
    );
  };

  const handleBackToList = () => {
    setSelectedContact(null);
  };

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-whatsapp-green rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generazione ID utente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      {selectedContact ? (
        <ChatView
          contact={selectedContact}
          onBack={handleBackToList}
        />
      ) : (
        <ChatList
          contacts={contacts}
          onContactSelect={handleContactSelect}
          onAddContact={() => setShowAddContact(true)}
          userId={userId}
        />
      )}

      <AddContactModal
        open={showAddContact}
        onClose={() => setShowAddContact(false)}
        onAddContact={handleAddContact}
        userId={userId}
      />
    </div>
  );
};

export default Index;
