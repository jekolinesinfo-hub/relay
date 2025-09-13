import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NetworkIndicator } from "@/components/network/NetworkIndicator";

interface ChatHeaderProps {
  contactName: string;
  contactId: string;
  isOnline?: boolean;
  onBack: () => void;
}

export const ChatHeader = ({ contactName, contactId, isOnline, onBack }: ChatHeaderProps) => {
  return (
    <header className="bg-whatsapp-green px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-white hover:bg-white/20 p-1 h-auto"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-lg">
                {contactName.charAt(0).toUpperCase()}
              </span>
            </div>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <div className="text-white">
            <h2 className="font-medium text-lg leading-tight">{contactName}</h2>
            <div className="flex items-center gap-2">
              <p className="text-white/70 text-sm">ID: {contactId}</p>
              <NetworkIndicator className="text-white/70" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 p-2 h-auto"
        >
          <Video className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 p-2 h-auto"
        >
          <Phone className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 p-2 h-auto"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};