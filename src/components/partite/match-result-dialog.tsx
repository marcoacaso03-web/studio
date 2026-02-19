"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Match } from "@/lib/types";

const formSchema = z.object({
  home: z.coerce.number().int().min(0, "Il punteggio non può essere negativo."),
  away: z.coerce.number().int().min(0, "Il punteggio non può essere negativo."),
});

type FormValues = z.infer<typeof formSchema>;

interface MatchResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: FormValues) => void;
  match?: Match | null;
}

export function MatchResultDialog({ open, onOpenChange, onSave, match }: MatchResultDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      home: 0,
      away: 0,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        home: match?.result?.home ?? 0,
        away: match?.result?.away ?? 0,
      });
    }
  }, [open, match, form]);


  function onSubmit(data: FormValues) {
    onSave(data);
    onOpenChange(false);
  }

  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inserisci Risultato Finale</DialogTitle>
          <DialogDescription>
            Il risultato per la partita contro {match.opponent}. Una volta salvato, la partita verrà contrassegnata come "Completata".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4 items-center justify-center">
              <FormField
                control={form.control}
                name="home"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block">{match.isHome ? "PitchMan" : match.opponent}</FormLabel>
                    <FormControl>
                      <Input type="number" className="text-center text-2xl font-bold h-16" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="away"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block">{!match.isHome ? "PitchMan" : match.opponent}</FormLabel>
                    <FormControl>
                      <Input type="number" className="text-center text-2xl font-bold h-16" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Annulla</Button>
              <Button type="submit">Salva Risultato</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
