import { useState } from "react";
import { ChatList } from "@/components/chat/ChatList";
import { ChatView } from "@/components/chat/ChatView";
import { AddContactModal } from "@/components/chat/AddContactModal";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { SwipeablePages } from "@/components/navigation/SwipeablePages";
import { StatusPage } from "./StatusPage";
import { CallsPage } from "./CallsPage";
import { SettingsPage } from "./SettingsPage";
import { useUserId } from "@/hooks/useUserId";
import { useUserProfile } from "@/hooks/useUserProfile";
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
  const { profile, updateName } = useUserProfile(userId);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1); // Start with Chat page
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
  const [showSettings, setShowSettings] = useState(false);

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
      <SwipeablePages 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
      >
        <StatusPage />
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
            onOpenSettings={() => setShowSettings(true)}
            userProfile={profile}
          />
        )}
        <CallsPage />
        <SettingsPage />
      </SwipeablePages>

      <AddContactModal
        open={showAddContact}
        onClose={() => setShowAddContact(false)}
        onAddContact={handleAddContact}
        userId={userId}
      />

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        userProfile={profile}
        onUpdateName={updateName}
      />
    </div>
  );
};

export default Index;
