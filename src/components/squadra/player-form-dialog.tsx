
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Globe, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Player, Role, ROLES, PlayerRole, migrateRole } from "@/lib/types";
import { PitchRoleSelector } from "./PitchRoleSelector";
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
  roles: z.array(z.string().refine((val): val is PlayerRole =>
    ['POR','DC','TD','TS','ADA','ASA','CDC','TRQ','CD','CS','AD','AS','ATT'].includes(val),
    { message: "Ruolo non valido" }
  )).min(1, { message: "Seleziona almeno un ruolo." }).default([]),
});

type FormValues = z.infer<typeof formSchema>;

type PlayerSaveData = {
  name: string;
  firstName: string;
  lastName: string;
  roles: PlayerRole[];
};

interface PlayerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PlayerSaveData, playerId?: string) => Promise<void> | void;
  player?: Player | null;
  onAIImport?: () => void;
  onTuttocampoImport?: () => void;
}

export function PlayerFormDialog({ open, onOpenChange, onSave, player, onAIImport, onTuttocampoImport }: PlayerFormDialogProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      roles: [],
    },
  });

  React.useEffect(() => {
    if (open) {
      if (player) {
        const nameParts = player.name.split(' ');
        const firstName = nameParts.shift() || '';
        const lastName = nameParts.join(' ');

        // Migrate legacy role/secondaryRoles to roles array
        let roles: PlayerRole[];
        if (player.roles && player.roles.length > 0) {
          roles = player.roles;
        } else if (player.role) {
          roles = [migrateRole(player.role), ...(player.secondaryRoles?.map(migrateRole) || [])];
        } else {
          roles = [];
        }

        form.reset({
          firstName,
          lastName,
          roles,
        });
      } else {
        form.reset({
          firstName: "",
          lastName: "",
          roles: [],
        });
      }
    }
  }, [player, open, form]);

  async function onSubmit(data: FormValues) {
    setIsSaving(true);
    try {
      const saveData: PlayerSaveData = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        firstName: data.firstName,
        lastName: data.lastName,
        roles: data.roles,
      };
      await onSave(saveData, player?.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="sm:max-w-[425px] rounded-[28px] bg-card dark:bg-black border border-border dark:border-brand-green/30 shadow-xl dark:shadow-[0_0_25px_rgba(172,229,4,0.05)] p-6 overflow-hidden">
        <DialogHeader className="flex-row items-start justify-between space-y-0">
          <div className="space-y-1 text-left">
            <DialogTitle className="text-foreground dark:text-white font-black uppercase text-xl md:text-2xl tracking-tight">
              {player ? "Modifica Giocatore" : "Nuovo Giocatore"}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Dettagli anagrafici e ruolo tecnico in rosa.
            </DialogDescription>
          </div>
          {!player && (
            <div className="flex gap-2 ml-4">
              <Button 
                onClick={onAIImport}
                variant="ghost"
                size="icon"
                disabled={isSaving}
                className="h-10 w-10 rounded-full bg-primary/10 dark:bg-brand-green/10 text-primary dark:text-brand-green hover:bg-primary/20 dark:hover:bg-brand-green/20"
                title="Importazione AI"
              >
                <Sparkles className="h-5 w-5" />
              </Button>
              <RoleGuard allowedRoles={['developer']}>
                <Button 
                  onClick={onTuttocampoImport}
                  variant="ghost"
                  size="icon"
                  disabled={isSaving}
                  className="h-10 w-10 rounded-full bg-primary/10 dark:bg-brand-green/10 text-primary dark:text-brand-green hover:bg-primary/20 dark:hover:bg-brand-green/20"
                  title="Importa da Tuttocampo"
                >
                  <Globe className="h-5 w-5" />
                </Button>
              </RoleGuard>
            </div>
          )}
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
                        disabled={isSaving}
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
                        disabled={isSaving}
                        className="h-11 text-xs font-black uppercase rounded-xl bg-background dark:bg-black border border-border dark:border-brand-green/20 focus-visible:ring-1 focus-visible:ring-primary dark:focus-visible:ring-brand-green focus-visible:border-primary dark:focus-visible:border-brand-green transition-all" 
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] font-bold uppercase" />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Role Selector */}
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">Ruoli del giocatore</FormLabel>
                    <FormDescription className="text-[8px] font-bold uppercase text-muted-foreground/40 ml-1">
                      Seleziona tutti i ruoli che il giocatore può svolgere. Il primo selezionato sarà il ruolo principale.
                    </FormDescription>
                  </div>
                  <PitchRoleSelector
                    selectedRoles={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage className="text-[9px] font-bold uppercase" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-6 flex-row gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                disabled={isSaving}
                className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest h-12 text-muted-foreground hover:bg-muted dark:hover:bg-white/5 transition-all" 
                onClick={() => onOpenChange(false)}
              >
                Annulla
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
                className="flex-1 bg-primary dark:bg-black border-2 border-primary dark:border-brand-green text-white dark:text-brand-green font-black uppercase text-[10px] tracking-widest h-12 shadow-sm dark:shadow-[0_0_15px_rgba(172,229,4,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  "Salva"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
