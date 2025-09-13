import { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  HelpCircle, 
  Info, 
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useUserId } from '@/hooks/useUserId';

const settingsGroups = [
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'Profilo', icon: User, hasArrow: true },
      { id: 'privacy', label: 'Privacy e sicurezza', icon: Shield, hasArrow: true },
    ]
  },
  {
    title: 'Preferenze',
    items: [
      { id: 'notifications', label: 'Notifiche', icon: Bell, hasArrow: true },
      { id: 'theme', label: 'Tema', icon: Palette, hasArrow: true },
    ]
  },
  {
    title: 'Supporto',
    items: [
      { id: 'help', label: 'Aiuto', icon: HelpCircle, hasArrow: true },
      { id: 'about', label: 'Info su Relay', icon: Info, hasArrow: true },
    ]
  }
];

export const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const { userId, regenerateId } = useUserId();

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 p-4 space-y-6">
        {/* User Profile Section */}
        <div className="bg-gradient-to-r from-relay-primary to-relay-secondary rounded-lg p-4 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              R
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Relay User</h2>
              <p className="text-white/80 text-sm">ID: {userId}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={regenerateId}
              className="text-white hover:bg-white/20"
            >
              Rigenera ID
            </Button>
          </div>
        </div>

        {/* Quick Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className="font-medium">Tema scuro</span>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <span className="font-medium">Notifiche</span>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
          {settingsGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {group.title}
              </h3>
              <div className="bg-card rounded-lg border divide-y">
                {group.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <IconComponent className="w-5 h-5 text-muted-foreground" />
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      {item.hasArrow && (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* App Info */}
        <div className="text-center text-muted-foreground text-sm space-y-1">
          <p>Relay Chat</p>
          <p>Versione 1.0.0</p>
        </div>
      </div>
    </div>
  );
};