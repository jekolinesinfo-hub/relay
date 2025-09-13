import { useState } from "react";
import { ChatList } from "@/components/chat/ChatList";
import { ChatView } from "@/components/chat/ChatView";
import { AddContactModal } from "@/components/chat/AddContactModal";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { SwipeablePages } from "@/components/navigation/SwipeablePages";
import { StatusPage } from "./StatusPage";
import { CallsPage } from "./CallsPage";
import { SettingsPage } from "./SettingsPage";
import { useAuth } from "@/hooks/useAuth";
import { useContacts, DatabaseContact } from "@/hooks/useContacts";
import { useUserProfile } from "@/hooks/useUserProfile";

const Index = () => {
  const { isAuthenticated, isLoading, userId } = useAuth();
  const { contacts, addContact, deleteContact } = useContacts(userId || '');
  const { profile, updateName } = useUserProfile(userId || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState<DatabaseContact | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleAddContact = async (contactId: string, contactName: string) => {
    const success = await addContact(contactId, contactName);
    if (success) {
      setShowAddContact(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    await deleteContact(contactId);
    if (selectedContact && selectedContact.id === contactId) {
      setSelectedContact(null);
    }
  };

  const handleContactSelect = (contact: DatabaseContact) => {
    setSelectedContact(contact);
  };

  const handleBackToList = () => {
    setSelectedContact(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-relay-primary rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-relay-primary rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connessione in corso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
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
            onDeleteContact={handleDeleteContact}
            userProfile={profile || { name: 'Loading...', id: userId }}
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
