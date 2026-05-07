"use client";

import * as React from "react";
import { motion, useDragControls } from "framer-motion";
import { cn, displayPlayerName } from "@/lib/utils";
import { Player } from "@/lib/types";
import { User, Activity, Plus } from "lucide-react";

interface DraggablePlayerProps {
  player?: Player;
  acronym: string;
  isPOR?: boolean;
  isInjured?: boolean;
  index: number;
  type: 'starter' | 'sub';
  isEditing: boolean;
  onSwap: (source: { type: 'starter' | 'sub'; index: number }, target: { type: 'starter' | 'sub'; index: number }) => void;
  onClick: () => void;
}

export function DraggablePlayer({
  player,
  acronym,
  isPOR,
  isInjured,
  index,
  type,
  isEditing,
  onSwap,
  onClick
}: DraggablePlayerProps) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = React.useState(false);
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const startPos = React.useRef<{ x: number, y: number } | null>(null);

  const handlePointerDown = (event: React.PointerEvent) => {
    if (!isEditing || !player) return;

    startPos.current = { x: event.clientX, y: event.clientY };

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      setIsDragging(true);
      controls.start(event);
    }, 400); // 400ms for long press
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!longPressTimer.current || !startPos.current) return;

    const dx = event.clientX - startPos.current.x;
    const dy = event.clientY - startPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If moved more than 10px before the long press triggers, cancel it (user is probably scrolling)
    if (distance > 10) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    startPos.current = null;
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    
    // Temporaneamente disabilita pointer-events sull'elemento trascinato per vedere cosa c'è sotto
    const currentTarget = event.target as HTMLElement;
    const originalPointerEvents = currentTarget.style.pointerEvents;
    currentTarget.style.pointerEvents = 'none';

    // Trova il drop target alle coordinate del rilascio
    const element = document.elementFromPoint(info.point.x, info.point.y);
    const dropTarget = element?.closest('[data-drop-target="true"]');
    
    // Ripristina pointer-events
    currentTarget.style.pointerEvents = originalPointerEvents;
    
    if (dropTarget) {
      const targetType = dropTarget.getAttribute('data-slot-type') as 'starter' | 'sub';
      const targetIndex = parseInt(dropTarget.getAttribute('data-slot-index') || '0', 10);
      
      if (targetType && !isNaN(targetIndex) && (targetType !== type || targetIndex !== index)) {
        onSwap({ type, index }, { type: targetType, index: targetIndex });
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-1 w-16 sm:w-20 group">
      <motion.div
        drag={isEditing && player ? true : false}
        dragControls={controls}
        dragListener={false}
        dragSnapToOrigin={true}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        whileDrag={{ 
          scale: 1.1, 
          zIndex: 50,
          opacity: 0.8,
        }}
        onClick={(e) => {
          if (!isDragging) onClick();
        }}
        data-drop-target="true"
        data-slot-type={type}
        data-slot-index={index}
        className={cn(
          "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 shadow-lg transition-all cursor-pointer active:scale-95",
          player
            ? isPOR
              ? "bg-amber-600 border-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
              : "bg-primary/90 dark:bg-brand-green/90 border-primary dark:border-brand-green text-white dark:text-black shadow-[0_0_15px_rgba(172,229,4,0.3)]"
            : "bg-neutral-800/50 border-neutral-700 text-neutral-500 border-dashed hover:bg-neutral-800 hover:border-neutral-600"
        )}
      >
        {player ? (
          <span className="text-[10px] font-black uppercase pointer-events-none">{acronym}</span>
        ) : (
          <Plus className="w-5 h-5 pointer-events-none" />
        )}
      </motion.div>
      
      {/* Nome Giocatore */}
      <div className="w-full bg-black/60 backdrop-blur-sm px-1 py-0.5 rounded border border-white/10 text-center overflow-hidden min-h-[1.2rem] flex items-center justify-center gap-1 pointer-events-none">
        {player && isInjured && (
          <Activity className="w-2 h-2 text-red-500 shrink-0" />
        )}
        <p className="text-[8px] sm:text-[9px] font-black text-white uppercase truncate">
          {player ? displayPlayerName(player) : acronym}
        </p>
      </div>
    </div>
  );
}
