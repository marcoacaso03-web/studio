
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

const toDateInputValue = (dateSource?: any): string => {
  const date = safeParseDate(dateSource);
  return date.toISOString().split('T')[0];
};

const formSchema = z.object({
  opponent: z.string().min(2, { message: "Il nome dell'avversario è richiesto." }),
  date: z.string().min(1, { message: "La data è richiesta." }),
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
      const initialDate = match ? toDateInputValue(match.date) : toDateInputValue(new Date());
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
        date: new Date(data.date).toISOString(), // Salviamo come stringa ISO a mezzanotte
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
      min: toDateInputValue(twoYearsAgo),
      max: toDateInputValue(twoYearsLater),
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-black uppercase text-foreground">
            {match ? "Modifica Gara" : "Nuova Gara"}
          </DialogTitle>
          <DialogDescription className="text-xs uppercase font-bold text-muted-foreground/60">
            {match
              ? "Aggiorna le informazioni della partita."
              : "Inserisci i dettagli per pianificare la gara."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="opponent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest">Avversario</FormLabel>
                  <FormControl>
                    <Input placeholder="Es: Real Isola" {...field} className="h-11 rounded-xl font-bold uppercase text-xs" />
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
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest">Tipo Gara</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger className="h-11 rounded-xl text-xs font-bold uppercase">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {MATCH_TYPES.map(t => (
                              <SelectItem key={t} value={t} className="text-xs font-bold uppercase">{t}</SelectItem>
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
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest">Durata (Min)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value.toString()}>
                        <FormControl>
                            <SelectTrigger className="h-11 rounded-xl text-xs font-bold uppercase">
                                <SelectValue placeholder="Durata" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="70" className="text-xs font-bold uppercase">70 min</SelectItem>
                            <SelectItem value="80" className="text-xs font-bold uppercase">80 min</SelectItem>
                            <SelectItem value="90" className="text-xs font-bold uppercase">90 min</SelectItem>
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
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest">Data della Gara</FormLabel>
                  <FormControl>
                      <Input
                      type="date"
                      min={min}
                      max={max}
                      {...field}
                      className="h-11 rounded-xl font-bold uppercase text-xs"
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
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border p-3 bg-muted/20">
                        <div className="space-y-0.5">
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest">In Casa</FormLabel>
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
                            <SelectTrigger className="h-[54px] rounded-xl text-xs font-bold uppercase">
                                <SelectValue placeholder="Stato" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="scheduled" className="text-xs font-bold uppercase">Programmata</SelectItem>
                                <SelectItem value="completed" className="text-xs font-bold uppercase">Finita</SelectItem>
                                <SelectItem value="canceled" className="text-xs font-bold uppercase">Annullata</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <DialogFooter className="pt-4 flex-row gap-2">
              <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl font-black uppercase text-xs" onClick={() => onOpenChange(false)}>Annulla</Button>
              <Button type="submit" className="flex-1 h-12 rounded-xl bg-primary text-white font-black uppercase text-xs shadow-lg">Salva Gara</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
