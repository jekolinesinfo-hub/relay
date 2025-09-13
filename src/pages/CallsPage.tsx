import { useState } from 'react';
import { Phone, PhoneCall, PhoneIncoming, PhoneMissed, Video, VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sampleCalls = [
  {
    id: 1,
    name: 'Marco Rossi',
    time: '2 minuti fa',
    type: 'outgoing',
    isVideo: false,
    duration: '2:34',
  },
  {
    id: 2,
    name: 'Laura Bianchi',
    time: '1 ora fa',
    type: 'incoming',
    isVideo: true,
    duration: '5:12',
  },
  {
    id: 3,
    name: 'Giuseppe Verde',
    time: 'Ieri',
    type: 'missed',
    isVideo: false,
    duration: null,
  },
  {
    id: 4,
    name: 'Anna Neri',
    time: 'Ieri',
    type: 'outgoing',
    isVideo: true,
    duration: '12:45',
  },
];

const getCallIcon = (type: string, isVideo: boolean) => {
  if (isVideo) {
    return <VideoIcon className="w-5 h-5" />;
  }
  
  switch (type) {
    case 'incoming':
      return <PhoneIncoming className="w-5 h-5 text-green-500" />;
    case 'outgoing':
      return <PhoneCall className="w-5 h-5 text-relay-primary" />;
    case 'missed':
      return <PhoneMissed className="w-5 h-5 text-red-500" />;
    default:
      return <Phone className="w-5 h-5" />;
  }
};

export const CallsPage = () => {
  const [calls] = useState(sampleCalls);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 p-4">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Chiamate recenti</h2>
        
        <div className="space-y-2">
          {calls.map((call) => (
            <div key={call.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-relay-primary to-relay-secondary rounded-full flex items-center justify-center text-white font-semibold">
                {call.name.charAt(0)}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{call.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getCallIcon(call.type, call.isVideo)}
                  <span>{call.time}</span>
                  {call.duration && (
                    <>
                      <span>•</span>
                      <span>{call.duration}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-10 w-10 p-0 text-relay-primary hover:bg-relay-primary/10"
                >
                  <Phone className="w-5 h-5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-10 w-10 p-0 text-relay-primary hover:bg-relay-primary/10"
                >
                  <Video className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {calls.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Phone className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Nessuna chiamata recente</p>
            <p className="text-sm mt-2">Le tue chiamate appariranno qui</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <Button className="w-full bg-gradient-to-r from-relay-primary to-relay-secondary hover:from-relay-dark hover:to-relay-primary text-white">
          <Phone className="w-5 h-5 mr-2" />
          Nuova Chiamata
        </Button>
      </div>
    </div>
  );
};