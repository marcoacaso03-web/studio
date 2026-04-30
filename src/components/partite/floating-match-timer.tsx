"use client";

import * as React from "react";
import { useLiveTimerStore } from "@/store/useLiveTimerStore";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";
import { Button } from "@/components/ui/button";
import { Play, Pause, Maximize2, Zap } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function FloatingMatchTimer() {
  const { isRunning, startTimer, pauseTimer, getElapsedTime, matchId, period, isTrackerOpen } = useLiveTimerStore();
  const { match, load } = useMatchDetailStore();
  const [displaySeconds, setDisplaySeconds] = React.useState(0);
  const router = useRouter();
  const pathname = usePathname();

  // If match detail is not loaded but we have a matchId in timer store, load it
  React.useEffect(() => {
    if (matchId && (!match || match.id !== matchId)) {
      load(matchId);
    }
  }, [matchId, match, load]);

  // Update display timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const update = () => {
      setDisplaySeconds(Math.floor(getElapsedTime() / 1000));
    };

    update();
    if (isRunning) {
      interval = setInterval(update, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, getElapsedTime]);

  // Don't show if no match or if the tracker dialog is open
  if (!matchId || !match || isTrackerOpen) return null;

  const handleReturnToMatch = () => {
    router.push(`/calendario/${matchId}?s=${match.seasonId}`);
  };

  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;

  return (
    <div className="fixed bottom-24 right-4 z-[100] animate-in slide-in-from-right-4 duration-500">
      <div className="bg-black/80 dark:bg-black backdrop-blur-xl border border-brand-green/30 rounded-2xl p-3 shadow-2xl flex items-center gap-4 group">
        <div className="flex flex-col items-center">
           <div className="flex items-center gap-1.5 mb-1">
             <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
             <span className="text-[8px] font-black uppercase tracking-widest text-brand-green">{period}</span>
           </div>
           <div className="text-xl font-black tabular-nums text-white leading-none">
             {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
           </div>
        </div>

        <div className="h-8 w-px bg-white/10" />

        <div className="flex items-center gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-full hover:bg-brand-green/20 text-brand-green"
            onClick={() => isRunning ? pauseTimer() : startTimer(matchId)}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
          </Button>

          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-full hover:bg-white/10 text-white"
            onClick={handleReturnToMatch}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
