import { cn } from "@/lib/utils";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface NetworkIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export const NetworkIndicator = ({ className, showLabel = false }: NetworkIndicatorProps) => {
  const { networks, activeNetwork, getNetworkIcon, getNetworkLabel } = useNetworkStatus();
  
  const currentNetwork = networks[activeNetwork];
  
  if (!currentNetwork || !currentNetwork.available) {
    return (
      <div className={cn("flex items-center gap-1 text-red-400", className)}>
        <span>❌</span>
        {showLabel && <span className="text-xs">Offline</span>}
      </div>
    );
  }

  const getSignalColor = (strength?: number) => {
    if (!strength || strength < 30) return "text-red-400";
    if (strength < 70) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className={getSignalColor(currentNetwork.strength)}>
        {getNetworkIcon(activeNetwork)}
      </span>
      {showLabel && (
        <span className="text-xs text-white/80">
          {getNetworkLabel(activeNetwork)}
        </span>
      )}
      {currentNetwork.strength && (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 bg-current transition-opacity",
                i < Math.ceil(currentNetwork.strength! / 25) 
                  ? "opacity-100" 
                  : "opacity-30"
              )}
              style={{ height: `${(i + 1) * 2 + 2}px` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};