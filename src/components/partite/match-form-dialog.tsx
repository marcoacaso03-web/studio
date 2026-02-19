"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Match } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Helper to convert a date object or ISO string to a 'YYYY-MM-DDTHH:mm' string for the input
const toDatetimeLocal = (dateSource?: Date | string): string => {
  if (!dateSource) return '';
  const date = new Date(dateSource);
  // Adjust for timezone offset to display correctly in the user's local time
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const formSchema = z.object({
  opponent: z.string().min(2, { message: "Il nome dell'avversario è richiesto." }),
  location: z.string().min(2, { message: "Il luogo è richiesto." }),
  date: z.string().min(1, { message: "La data e l'ora sono richieste." }),
  isHome: z.boolean(),
  duration: z.coerce.number().int().min(1, "Durata richiesta"),
  status: z.enum(['scheduled', 'completed', 'canceled']),
});

type MatchFormValues = z.infer<typeof formSchema>;

// This is the data structure the parent component expects
type MatchSaveData = {
    opponent: string;
    location: string;
    date: Date;
    isHome: boolean;
    duration: number;
    status: 'scheduled' | 'completed' | 'canceled';
};

interface MatchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: MatchSaveData, matchId?: string) => void;
  match?: Match | null;
}

export function MatchFormDialog({ open, onOpenChange, onSave, match }: MatchFormDialogProps) {
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      opponent: "",
      location: "",
      date: "",
      isHome: true,
      duration: 90,
      status: 'scheduled',
    },
  });

  React.useEffect(() => {
    if (open) {
      const initialDate = match ? toDatetimeLocal(match.date) : toDatetimeLocal(new Date());
      form.reset({
        opponent: match?.opponent || "",
        location: match?.location || "",
        date: initialDate,
        isHome: match?.isHome ?? true,
        duration: match?.duration || 90,
        status: match?.status || 'scheduled',
      });
    }
  }, [open, match, form]);


  function onSubmit(data: MatchFormValues) {
    const saveData: MatchSaveData = {
        opponent: data.opponent,
        location: data.location,
        isHome: data.isHome,
        status: data.status,
        duration: data.duration,
        date: new Date(data.date),
    };
    onSave(saveData, match?.id);
    onOpenChange(false);
  }

  const { min, max } = React.useMemo(() => {
    const now = new Date();
    
    const twoYearsAgo = new Date(now);
    twoYearsAgo.setFullYear(now.getFullYear() - 2);

    const twoYearsLater = new Date(now);
    twoYearsLater.setFullYear(now.getFullYear() + 2);

    return {
      min: toDatetimeLocal(twoYearsAgo),
      max: toDatetimeLocal(twoYearsLater),
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{match ? "Modifica Dettagli Partita" : "Aggiungi Partita"}</DialogTitle>
          <DialogDescription>
            {match
              ? "Modifica i dettagli della partita e lo stato. Il risultato viene aggiornato automaticamente dalla cronaca."
              : "Inserisci i dettagli per creare una nuova partita."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="opponent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avversario</FormLabel>
                  <FormControl>
                    <Input placeholder="Es: Real Isola" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Data e Ora</FormLabel>
                    <FormControl>
                        <Input
                        type="datetime-local"
                        min={min}
                        max={max}
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Durata Partita</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value.toString()} value={field.value.toString()}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Durata" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="70">70 minuti</SelectItem>
                            <SelectItem value="80">80 minuti</SelectItem>
                            <SelectItem value="90">90 minuti</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Luogo</FormLabel>
                  <FormControl>
                    <Input placeholder="Es: Campo Comunale" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="isHome"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <FormLabel className="text-xs">In Casa</FormLabel>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                            <SelectTrigger className="h-full py-3">
                                <SelectValue placeholder="Stato" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="scheduled">In Programma</SelectItem>
                                <SelectItem value="completed">Completata</SelectItem>
                                <SelectItem value="canceled">Annullata</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Annulla</Button>
              <Button type="submit">Salva Modifiche</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
