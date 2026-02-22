
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
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary font-black uppercase">{player ? "Modifica Giocatore" : "Nuovo Giocatore"}</DialogTitle>
          <DialogDescription className="text-xs">
            Gestisci i dettagli anagrafici e il ruolo tecnico.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Mario" {...field} className="h-10 text-xs font-bold uppercase" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cognome</FormLabel>
                    <FormControl>
                      <Input placeholder="Rossi" {...field} className="h-10 text-xs font-bold uppercase" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ruolo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                            <SelectTrigger className="h-10 text-xs font-bold uppercase">
                                <SelectValue placeholder="Seleziona ruolo" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {ROLES.map(role => (
                                <SelectItem key={role} value={role} className="text-xs font-bold uppercase">{role}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
              )}
            />

            <DialogFooter className="pt-4 flex-row gap-2">
              <Button type="button" variant="ghost" className="flex-1 rounded-xl font-bold uppercase text-xs h-11" onClick={() => onOpenChange(false)}>Annulla</Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 rounded-xl font-bold uppercase text-xs h-11">Salva</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
