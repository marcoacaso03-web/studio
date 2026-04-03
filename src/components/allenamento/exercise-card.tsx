"use client";

import { Exercise } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Globe, Lock, Image as ImageIcon, Video, Link as LinkIcon } from "lucide-react";
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
}

export function ExerciseCard({ exercise, isOwner, onEdit, onDelete }: ExerciseCardProps) {
  return (
    <Card className="group overflow-hidden bg-card dark:bg-black/40 border-border dark:border-brand-green/10 transition-all hover:bg-muted/30 dark:hover:bg-brand-green/5 hover:border-primary/30 dark:hover:border-brand-green/20 rounded-[32px] shadow-sm dark:shadow-[0_0_20px_rgba(172,229,4,0.02)]">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-sm font-black uppercase tracking-tight text-foreground line-clamp-1">{exercise.name}</CardTitle>
          <div className="flex flex-wrap justify-end gap-1 max-w-[100px]">
            {exercise.playerCount.slice(0, 3).map(c => (
              <span key={c} className="text-[8px] font-black bg-muted/50 dark:bg-black/40 px-1.5 py-0.5 rounded-md border border-border dark:border-brand-green/20 text-muted-foreground">{c}</span>
            ))}
            {exercise.playerCount.length > 3 && <span className="text-[8px] font-black text-muted-foreground/40">...</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {exercise.focus.map((f) => (
            <span key={f} className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-primary/10 dark:bg-brand-green/10 text-primary dark:text-brand-green border border-primary/20 dark:border-brand-green/20 uppercase tracking-widest">{f}</span>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">{exercise.description}</p>
        
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1">
            {exercise.media.map((m, i) => (
              <div key={i} className={cn(
                "h-6 w-6 rounded-lg flex items-center justify-center border border-background shadow-sm",
                m.type === 'image' ? "bg-blue-500/20 text-blue-500" : m.type === 'video' ? "bg-rose-500/20 text-rose-500" : "bg-amber-500/20 text-amber-500"
              )}>
                {m.type === 'image' ? <ImageIcon className="h-3 w-3" /> : m.type === 'video' ? <Video className="h-3 w-3" /> : <LinkIcon className="h-3 w-3" />}
              </div>
            ))}
          </div>
          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tight">{exercise.media.length} risorse</span>
        </div>
      </CardContent>

      <CardFooter className="p-2 pt-0 flex gap-1 group-hover:translate-y-0 transition-transform sm:translate-y-2">
        {isOwner ? (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 h-9 rounded-2xl text-[9px] font-black uppercase bg-muted/20 hover:bg-primary/10 dark:hover:bg-brand-green/10 hover:text-primary dark:hover:text-brand-green transition-all"
              onClick={() => onEdit(exercise)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Modifica
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 rounded-2xl bg-rose-500/5 text-rose-500 hover:bg-rose-500/20 transition-all shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[32px] border border-border dark:border-brand-green/20 bg-card dark:bg-zinc-950 p-6 md:p-8">
                <AlertDialogHeader className="mb-4">
                  <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter text-foreground dark:text-white">Elimina Esercizio?</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs font-bold text-muted-foreground/60 leading-relaxed uppercase tracking-wider">
                    Sei sicuro? Questa azione non può essere annullata. L'esercizio verrà rimosso permanentemente dall'archivio tecnico.
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
          </>
        ) : (
          <div className="px-3 py-1 text-[8px] font-black uppercase text-muted-foreground/40 italic">
            Riserva in sola lettura
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
