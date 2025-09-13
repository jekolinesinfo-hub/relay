import { useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sampleStatuses = [
  {
    id: 1,
    name: 'Il mio stato',
    time: 'Tocca per aggiungere il tuo stato',
    avatar: '',
    isOwn: true,
  },
  {
    id: 2,
    name: 'Marco Rossi',
    time: '2 minuti fa',
    avatar: 'MR',
    isOwn: false,
    viewed: false,
  },
  {
    id: 3,
    name: 'Laura Bianchi',
    time: '15 minuti fa',
    avatar: 'LB',
    isOwn: false,
    viewed: true,
  },
  {
    id: 4,
    name: 'Giuseppe Verde',
    time: '1 ora fa',
    avatar: 'GV',
    isOwn: false,
    viewed: false,
  },
];

export const StatusPage = () => {
  const [statuses] = useState(sampleStatuses);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 p-4 space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Aggiornamenti di stato</h2>
          
          {statuses.map((status) => (
            <div key={status.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="relative">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
                  status.isOwn 
                    ? 'bg-gradient-to-br from-relay-primary to-relay-secondary' 
                    : status.viewed
                    ? 'bg-muted'
                    : 'bg-gradient-to-br from-relay-primary to-relay-secondary'
                }`}>
                  {status.isOwn ? (
                    <Plus className="w-6 h-6" />
                  ) : (
                    status.avatar
                  )}
                </div>
                {!status.viewed && !status.isOwn && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-relay-primary rounded-full border-2 border-background"></div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{status.name}</h3>
                <p className="text-sm text-muted-foreground">{status.time}</p>
              </div>
              
              {!status.isOwn && (
                <Eye className={`w-5 h-5 ${status.viewed ? 'text-muted-foreground' : 'text-relay-primary'}`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4 mt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Visualizzati di recente</h3>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Nessun aggiornamento recente da mostrare</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t">
        <Button className="w-full bg-gradient-to-r from-relay-primary to-relay-secondary hover:from-relay-dark hover:to-relay-primary text-white">
          Aggiungi Stato
        </Button>
      </div>
    </div>
  );
};