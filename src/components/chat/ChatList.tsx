import { useState } from "react";
import { Search, MessageCircle, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NetworkIndicator } from "@/components/network/NetworkIndicator";

interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
  timestamp?: Date;
  unreadCount?: number;
  isOnline?: boolean;
}

interface ChatListProps {
  contacts: Contact[];
  onContactSelect: (contact: Contact) => void;
  onAddContact: () => void;
  onOpenSettings: () => void;
  userProfile: {
    name: string;
    id: string;
  };
}

export const ChatList = ({ 
  contacts, 
  onContactSelect, 
  onAddContact, 
  onOpenSettings,
  userProfile 
}: ChatListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimestamp = (date?: Date) => {
    if (!date) return "";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-relay-primary to-relay-secondary px-4 py-3 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Relay</h1>
          <div className="flex items-center gap-2">
            <NetworkIndicator showLabel className="mr-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddContact}
              className="text-white hover:bg-white/20 p-2 h-auto"
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm" 
              onClick={onOpenSettings}
              className="text-white hover:bg-white/20 p-2 h-auto"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* User Profile Display */}
        <div className="mt-2 text-white/80 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{userProfile.name}</span> • ID: <span className="font-mono">{userProfile.id}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca contatti o messaggi"
            className="pl-10 bg-chat-input border-none rounded-full focus-visible:ring-whatsapp-green"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nessuna chat</h3>
            <p className="text-muted-foreground mb-4">
              Aggiungi contatti tramite il loro ID univoco per iniziare a chattare
            </p>
            <Button
              onClick={onAddContact}
              className="bg-whatsapp-green hover:bg-whatsapp-green-dark"
            >
              <Users className="h-4 w-4 mr-2" />
              Aggiungi Contatto
            </Button>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onContactSelect(contact)}
              className="flex items-center gap-3 p-4 border-b hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-whatsapp-green-light rounded-full flex items-center justify-center">
                  <span className="text-whatsapp-green font-medium text-lg">
                    {contact.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {contact.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground truncate">{contact.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(contact.timestamp)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-muted-foreground truncate">
                    {contact.lastMessage || `ID: ${contact.id}`}
                  </p>
                  {contact.unreadCount && contact.unreadCount > 0 && (
                    <span className="bg-whatsapp-green text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};