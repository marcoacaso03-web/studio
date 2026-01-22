"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, addYears, subYears, parse as dateParse } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Match } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formSchema = z.object({
  opponent: z.string().min(2, { message: "Il nome dell'avversario è richiesto." }),
  location: z.string().min(2, { message: "Il luogo è richiesto." }),
  date: z.date({ required_error: "La data e l'ora sono richieste." }),
  isHome: z.boolean(),
});

type MatchFormValues = z.infer<typeof formSchema>;

interface MatchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: MatchFormValues, matchId?: string) => void;
  match?: Match | null;
}

export function MatchFormDialog({ open, onOpenChange, onSave, match }: MatchFormDialogProps) {
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      opponent: "",
      location: "",
      date: new Date(),
      isHome: true,
    },
  });

  const [dateInputValue, setDateInputValue] = React.useState('');

  React.useEffect(() => {
    if (open) {
      const initialValues = match ? {
        opponent: match.opponent,
        location: match.location,
        date: new Date(match.date),
        isHome: match.isHome,
      } : {
        opponent: "",
        location: "",
        date: new Date(),
        isHome: true,
      };
      form.reset(initialValues);
      setDateInputValue(format(initialValues.date, "dd/MM/yyyy HH:mm"));
    }
  }, [open, match, form]);


  function onSubmit(data: MatchFormValues) {
    onSave(data, match?.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{match ? "Modifica Partita" : "Aggiungi Partita"}</DialogTitle>
          <DialogDescription>
            {match
              ? "Modifica i dettagli della partita e salva."
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

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data e Ora</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                       <FormControl>
                         <div className="relative">
                            <Input
                                placeholder="gg/mm/aaaa hh:mm"
                                value={dateInputValue}
                                onChange={(e) => {
                                    setDateInputValue(e.target.value);
                                    const parsedDate = dateParse(e.target.value, "dd/MM/yyyy HH:mm", new Date());
                                    if (!isNaN(parsedDate.getTime())) {
                                        field.onChange(parsedDate);
                                    }
                                }}
                            />
                            <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                        </div>
                       </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(day) => {
                          if (!day) return;
                          const newDate = new Date(field.value); // keep time
                          newDate.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
                          field.onChange(newDate);
                          setDateInputValue(format(newDate, "dd/MM/yyyy HH:mm"));
                        }}
                        disabled={{
                          before: subYears(new Date(), 1),
                          after: addYears(new Date(), 1),
                        }}
                        initialFocus
                      />
                      <div className="p-3 border-t border-border">
                        <Input 
                            type="time" 
                            value={field.value ? format(field.value, 'HH:mm') : ''}
                            onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':').map(Number);
                                if (isNaN(hours) || isNaN(minutes)) return;
                                const newDate = new Date(field.value); // keep date
                                newDate.setHours(hours, minutes);
                                field.onChange(newDate);
                                setDateInputValue(format(newDate, "dd/MM/yyyy HH:mm"));
                            }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormField
              control={form.control}
              name="isHome"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Partita in Casa</FormLabel>
                    <FormDescription>
                      Indica se si gioca in casa.
                    </FormDescription>
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

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Annulla</Button>
              <Button type="submit">Salva</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
