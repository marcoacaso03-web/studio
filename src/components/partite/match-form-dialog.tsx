
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Match, MATCH_TYPES } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettingsStore } from "@/store/useSettingsStore";

const safeParseDate = (dateSource?: any): Date => {
  if (!dateSource) return new Date();
  if (typeof dateSource === 'string') return new Date(dateSource);
  if (dateSource instanceof Date) return dateSource;
  if (dateSource && typeof dateSource.toDate === 'function') return dateSource.toDate();
  const d = new Date(dateSource);
  return isNaN(d.getTime()) ? new Date() : d;
};

const toDatetimeLocal = (dateSource?: any): string => {
  const date = safeParseDate(dateSource);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const formSchema = z.object({
  opponent: z.string().min(2, { message: "Il nome dell'avversario è richiesto." }),
  date: z.string().min(1, { message: "La data e l'ora sono richieste." }),
  isHome: z.boolean(),
  type: z.enum(MATCH_TYPES),
  duration: z.coerce.number().int().min(1, "Durata richiesta"),
  status: z.enum(['scheduled', 'completed', 'canceled']),
});

type MatchFormValues = z.infer<typeof formSchema>;

interface MatchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any, matchId?: string) => void;
  match?: Match | null;
}

export function MatchFormDialog({ open, onOpenChange, onSave, match }: MatchFormDialogProps) {
  const { defaultDuration } = useSettingsStore();
  
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      opponent: "",
      date: "",
      isHome: true,
      type: 'Campionato',
      duration: defaultDuration,
      status: 'completed',
    },
  });

  React.useEffect(() => {
    if (open) {
      const initialDate = match ? toDatetimeLocal(match.date) : toDatetimeLocal(new Date());
      form.reset({
        opponent: match?.opponent || "",
        date: initialDate,
        isHome: match?.isHome ?? true,
        type: match?.type || 'Campionato',
        duration: match?.duration || defaultDuration,
        status: match?.status || 'completed',
      });
    }
  }, [open, match, form, defaultDuration]);


  function onSubmit(data: MatchFormValues) {
    onSave({
        ...data,
        date: new Date(data.date).toISOString(), // Salviamo sempre come stringa ISO
    }, match?.id);
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
              ? "Modifica i dettagli della partita e lo stato."
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
                name="type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tipo Gara</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {MATCH_TYPES.map(t => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} value={field.value.toString()}>
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
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger className="h-full py-3">
                                <SelectValue placeholder="Stato" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="scheduled">In Programma</SelectItem>
                                <SelectItem value="completed">Finita</SelectItem>
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
              <Button type="submit">Salva Gara</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
