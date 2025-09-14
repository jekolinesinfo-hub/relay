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
import { useGlobalNotifications } from "@/hooks/useGlobalNotifications";
import { MessageCircle, Phone, Settings, Users } from "lucide-react";

const pages = [
  { name: 'Status', icon: Users },
  { name: 'Chat', icon: MessageCircle },
  { name: 'Chiamate', icon: Phone },
  { name: 'Impostazioni', icon: Settings },
];

const Index = () => {
  const { isAuthenticated, isLoading, userId } = useAuth();
  const { contacts, addContact, deleteContact } = useContacts(userId || '');
  const { profile, updateName } = useUserProfile(userId || '');
  
  // Enable global notifications
  useGlobalNotifications(userId);
  
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
    <div className="h-full max-h-full bg-background overflow-hidden flex flex-col">
      {/* Top navigation - fixed, global */}
      <div className="fixed top-0 left-0 right-0 z-40 h-14 pt-[env(safe-area-inset-top)] flex justify-center items-center gap-2 bg-gradient-to-r from-relay-primary to-relay-secondary">
        {pages.map((page, index) => {
          const IconComponent = page.icon;
          return (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentPage === index 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-xs font-medium">{page.name}</span>
            </button>
          );
        })}
      </div>
      {/* Spacer to offset fixed top bar */}
      <div className="h-14 pt-[env(safe-area-inset-top)]" aria-hidden="true" />
      <div 
        className="flex-1 min-h-0"
        data-chat-view={selectedContact ? "true" : "false"}
      >
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
      </div>

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
