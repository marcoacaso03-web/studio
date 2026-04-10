"use client";

import { Exercise } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Globe, Lock, Image as ImageIcon, Video, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

interface ExerciseCardProps {
  exercise: Exercise;
  isOwner: boolean;
  onEdit: (ex: Exercise) => void;
  onDelete: (id: string) => void;
  onView: (ex: Exercise) => void;
}

export function ExerciseCard({ exercise, isOwner, onEdit, onDelete, onView }: ExerciseCardProps) {
  return (
    <Card 
      className="group overflow-hidden bg-card dark:bg-black/40 border-border dark:border-brand-green/10 transition-all hover:bg-muted/30 dark:hover:bg-brand-green/5 hover:border-primary/30 dark:hover:border-brand-green/20 rounded-[24px] shadow-sm dark:shadow-[0_0_20px_rgba(172,229,4,0.02)] flex flex-col h-full relative cursor-pointer active:scale-[0.98]"
      onClick={() => onView(exercise)}
    >
      {/* Top Actions Overlay */}
      {isOwner && (
        <div className="absolute top-2 right-2 z-20 flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-primary dark:hover:bg-brand-green hover:text-black transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(exercise);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-rose-500 transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent 
              className="rounded-[32px] border border-border dark:border-brand-green/20 bg-card dark:bg-zinc-950 p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertDialogHeader className="mb-4">
                <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter text-foreground dark:text-white">Elimina Esercizio?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs font-bold text-muted-foreground/60 leading-relaxed uppercase tracking-wider">
                  Questa azione non può essere annullata. L'esercizio verrà rimosso permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2 sm:gap-0 mt-4 flex-row sm:flex-row-reverse sm:justify-start">
                <div className="flex gap-2 w-full">
                  <AlertDialogCancel className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] bg-muted/10 border-border dark:border-white/5 hover:bg-muted/20">Annulla</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(exercise.id)}
                    className="flex-1 h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase text-[10px] shadow-lg shadow-rose-500/20"
                  >
                    Conferma
                  </AlertDialogAction>
                </div>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {exercise.media.find(m => m.type === 'image') && (
        <div className="w-full h-24 overflow-hidden border-b border-border dark:border-brand-green/10 relative">
          <img 
            src={exercise.media.find(m => m.type === 'image')?.url} 
            alt={exercise.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      
      <CardHeader className="p-3 pb-1">
        <div className="flex justify-between items-start gap-2 pr-16 group-hover:pr-0 transition-all">
          <CardTitle className="text-xs font-black uppercase tracking-tight text-foreground line-clamp-1">{exercise.name}</CardTitle>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {exercise.focus.map((f) => (
            <span key={f} className="text-[7px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 dark:bg-brand-green/10 text-primary dark:text-brand-green border border-primary/20 dark:border-brand-green/20 uppercase tracking-widest">{f}</span>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-1 flex-1">
        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight mb-3 italic">{exercise.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex -space-x-1">
            {exercise.media.map((m, i) => (
              <div key={i} className={cn(
                "h-5 w-5 rounded-md flex items-center justify-center border border-background shadow-sm overflow-hidden bg-background dark:bg-zinc-800",
                m.type !== 'image' && (m.type === 'video' ? "text-rose-500" : "text-amber-500")
              )}>
                {m.type === 'image' ? (
                  <img src={m.url} alt="res" className="h-full w-full object-cover" onError={(e) => {
                    (e.target as any).src = 'https://placehold.co/50x50?text=x';
                  }} />
                ) : m.type === 'video' ? (
                  <Video className="h-2.5 w-2.5" />
                ) : (
                  <LinkIcon className="h-2.5 w-2.5" />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex gap-1">
            {exercise.playerCount.slice(0, 3).map(c => (
              <span key={c} className="text-[7px] font-black bg-muted/30 dark:bg-black/40 px-1 py-0.5 rounded-md border border-border dark:border-brand-green/10 text-muted-foreground/60">{c}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
