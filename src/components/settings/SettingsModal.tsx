import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Wifi, Edit3, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus, NetworkType } from "@/hooks/useNetworkStatus";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  userProfile: {
    name: string;
    id: string;
  };
  onUpdateName: (name: string) => boolean;
}

export const SettingsModal = ({ open, onClose, userProfile, onUpdateName }: SettingsModalProps) => {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);
  const { networks, getNetworkIcon, getNetworkLabel, toggleNetwork } = useNetworkStatus();
  const { toast } = useToast();

  const handleSaveName = () => {
    if (onUpdateName(tempName)) {
      setEditingName(false);
      toast({
        title: "Nome aggiornato!",
        description: "Il tuo nome è stato modificato con successo",
      });
    } else {
      toast({
        title: "Errore",
        description: "Il nome non può essere vuoto",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setTempName(userProfile.name);
    setEditingName(false);
  };

  const getStatusBadge = (available: boolean, strength?: number) => {
    if (!available) {
      return <Badge variant="secondary">Disabilitato</Badge>;
    }
    
    if (!strength || strength < 30) {
      return <Badge variant="destructive">Debole</Badge>;
    } else if (strength < 70) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Medio</Badge>;
    } else {
      return <Badge className="bg-green-500 hover:bg-green-600">Forte</Badge>;
    }
  };

  const getSignalBars = (strength?: number) => {
    if (!strength) return 0;
    if (strength < 25) return 1;
    if (strength < 50) return 2;
    if (strength < 75) return 3;
    return 4;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-whatsapp-green" />
            Impostazioni
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profilo Utente */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-whatsapp-green" />
              <h3 className="font-medium">Profilo</h3>
            </div>
            
            <div className="bg-whatsapp-green-light p-4 rounded-lg space-y-3">
              <div>
                <Label className="text-sm text-whatsapp-green-dark font-medium">
                  ID Utente
                </Label>
                <div className="mt-1">
                  <code className="bg-background px-3 py-2 rounded font-mono text-lg block">
                    {userProfile.id}
                  </code>
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-whatsapp-green-dark font-medium">
                  Nome Visibile
                </Label>
                <div className="mt-1 flex items-center gap-2">
                  {editingName ? (
                    <>
                      <Input
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="flex-1"
                        placeholder="Inserisci il tuo nome"
                        maxLength={25}
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveName}
                        className="bg-whatsapp-green hover:bg-whatsapp-green-dark p-2 h-auto"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="p-2 h-auto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 bg-background px-3 py-2 rounded">
                        {userProfile.name}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingName(true)}
                        className="border-whatsapp-green text-whatsapp-green hover:bg-whatsapp-green hover:text-white p-2 h-auto"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Stato Reti */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-whatsapp-green" />
              <h3 className="font-medium">Reti di Comunicazione</h3>
            </div>
            
            <div className="text-sm text-muted-foreground mb-3">
              Configura le reti disponibili per l'invio dei messaggi. L'app utilizzerà automaticamente la rete con priorità più alta disponibile.
            </div>

            <div className="space-y-3">
              {Object.entries(networks).map(([key, network]) => {
                const networkKey = key as NetworkType;
                if (networkKey === 'offline') return null;
                
                return (
                  <div
                    key={networkKey}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {getNetworkIcon(network.type)}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium">
                          {getNetworkLabel(network.type)}
                        </div>
                        {network.name && (
                          <div className="text-sm text-muted-foreground">
                            {network.name}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {network.available && network.strength && (
                        <div className="flex items-center gap-1">
                          {/* Signal bars */}
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 bg-current transition-opacity ${
                                i < getSignalBars(network.strength) 
                                  ? 'opacity-100' 
                                  : 'opacity-30'
                              }`}
                              style={{ height: `${(i + 1) * 3 + 4}px` }}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            {network.strength}%
                          </span>
                        </div>
                      )}
                      
                      {getStatusBadge(network.available, network.strength)}
                      
                      <Switch
                        checked={network.available}
                        onCheckedChange={() => toggleNetwork(networkKey)}
                        className="data-[state=checked]:bg-whatsapp-green"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-muted-foreground bg-accent/50 p-3 rounded-lg">
              <strong>Priorità automatica:</strong> Bluetooth → WiFi Direct → WiFi → Rete Mobile
              <br />
              L'app passerà automaticamente alla rete successiva se quella corrente non è disponibile.
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} className="bg-whatsapp-green hover:bg-whatsapp-green-dark">
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};