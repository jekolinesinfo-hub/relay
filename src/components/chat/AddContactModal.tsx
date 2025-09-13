import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
  onAddContact: (contactId: string, contactName: string) => void;
  userId: string;
}

export const AddContactModal = ({ open, onClose, onAddContact, userId }: AddContactModalProps) => {
  const [contactId, setContactId] = useState("");
  const [contactName, setContactName] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactId.trim() || !contactName.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci sia l'ID che il nome del contatto",
        variant: "destructive",
      });
      return;
    }

    if (contactId.trim().toUpperCase() === userId) {
      toast({
        title: "Errore", 
        description: "Non puoi aggiungere il tuo stesso ID",
        variant: "destructive",
      });
      return;
    }

    onAddContact(contactId.trim().toUpperCase(), contactName.trim());
    setContactId("");
    setContactName("");
    onClose();
  };

  const copyUserId = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      toast({
        title: "Copiato!",
        description: "Il tuo ID è stato copiato negli appunti",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-whatsapp-green" />
            Aggiungi Contatto
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current User ID */}
          <div className="bg-whatsapp-green-light p-4 rounded-lg">
            <Label className="text-sm text-whatsapp-green-dark font-medium">
              Il tuo ID da condividere:
            </Label>
            <div className="flex items-center gap-2 mt-2">
              <code className="bg-background px-3 py-2 rounded font-mono text-lg flex-1">
                {userId}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyUserId}
                className="border-whatsapp-green text-whatsapp-green hover:bg-whatsapp-green hover:text-white"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="contactId">ID Contatto</Label>
              <Input
                id="contactId"
                value={contactId}
                onChange={(e) => setContactId(e.target.value.toUpperCase())}
                placeholder="es. ABC12345"
                className="font-mono text-lg"
                maxLength={8}
              />
            </div>
            
            <div>
              <Label htmlFor="contactName">Nome Contatto</Label>
              <Input
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="es. Mario Rossi"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-whatsapp-green hover:bg-whatsapp-green-dark"
              >
                Aggiungi
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};