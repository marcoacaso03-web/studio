
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Player, Role, ROLES } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formSchema = z.object({
  firstName: z.string().min(2, { message: "Il nome è richiesto." }),
  lastName: z.string().min(2, { message: "Il cognome è richiesto." }),
  role: z.enum(ROLES, { required_error: "Il ruolo è richiesto."}),
});

type FormValues = z.infer<typeof formSchema>;

type PlayerSaveData = {
  name: string;
  role: Role;
};

interface PlayerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PlayerSaveData, playerId?: string) => void;
  player?: Player | null;
}

export function PlayerFormDialog({ open, onOpenChange, onSave, player }: PlayerFormDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "Centrocampista",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (player) {
          const nameParts = player.name.split(' ');
          const firstName = nameParts.shift() || '';
          const lastName = nameParts.join(' ');
          form.reset({
              firstName,
              lastName,
              role: player.role,
          });
      } else {
          form.reset({
              firstName: "",
              lastName: "",
              role: "Centrocampista"
          });
      }
    }
  }, [player, open, form]);

  function onSubmit(data: FormValues) {
    const saveData: PlayerSaveData = {
      name: `${data.firstName} ${data.lastName}`.trim(),
      role: data.role
    };
    onSave(saveData, player?.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[28px] bg-card dark:bg-black border border-border dark:border-brand-green/30 shadow-xl dark:shadow-[0_0_25px_rgba(172,229,4,0.05)] p-6 overflow-hidden">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-foreground dark:text-white font-black uppercase text-xl md:text-2xl tracking-tight">
            {player ? "Modifica Giocatore" : "Nuovo Giocatore"}
          </DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Dettagli anagrafici e ruolo tecnico in rosa.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">Nome</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Mario" 
                        {...field} 
                        className="h-11 text-xs font-black uppercase rounded-xl bg-background dark:bg-black border border-border dark:border-brand-green/20 focus-visible:ring-1 focus-visible:ring-primary dark:focus-visible:ring-brand-green focus-visible:border-primary dark:focus-visible:border-brand-green transition-all" 
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] font-bold uppercase" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">Cognome</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Rossi" 
                        {...field} 
                        className="h-11 text-xs font-black uppercase rounded-xl bg-background dark:bg-black border border-border dark:border-brand-green/20 focus-visible:ring-1 focus-visible:ring-primary dark:focus-visible:ring-brand-green focus-visible:border-primary dark:focus-visible:border-brand-green transition-all" 
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] font-bold uppercase" />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">Ruolo Tecnico</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                            <SelectTrigger className="h-11 text-xs font-black uppercase rounded-xl bg-background dark:bg-black border border-border dark:border-brand-green/20 focus:ring-1 focus:ring-primary dark:focus:ring-brand-green focus:border-primary dark:focus:border-brand-green transition-all">
                                <SelectValue placeholder="Seleziona ruolo" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-border dark:border-brand-green/30 bg-card dark:bg-background">
                            {ROLES.map(role => (
                                <SelectItem key={role} value={role} className="text-xs font-black uppercase focus:bg-primary/10 dark:focus:bg-brand-green/10 focus:text-primary dark:focus:text-brand-green transition-colors">
                                  {role}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage className="text-[9px] font-bold uppercase" />
                  </FormItem>
              )}
            />

            <DialogFooter className="pt-6 flex-row gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest h-12 text-muted-foreground hover:bg-muted dark:hover:bg-white/5 transition-all" 
                onClick={() => onOpenChange(false)}
              >
                Annulla
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-primary dark:bg-black border-2 border-primary dark:border-brand-green text-white dark:text-brand-green font-black uppercase text-[10px] tracking-widest h-12 shadow-sm dark:shadow-[0_0_15px_rgba(172,229,4,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                Salva
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
