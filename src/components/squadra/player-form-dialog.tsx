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
  number: z.coerce.number().int().min(1, { message: "Il numero di maglia deve essere positivo." }).max(99, { message: "Numero di maglia non valido." }),
  role: z.enum(ROLES, { required_error: "Il ruolo è richiesto."}),
});

type FormValues = z.infer<typeof formSchema>;

// The parent component expects this shape
type PlayerSaveData = {
  name: string;
  number: number;
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
              number: player.number,
              role: player.role,
          });
      } else {
          form.reset({
              firstName: "",
              lastName: "",
              number: undefined,
              role: undefined
          });
      }
    }
  }, [player, open, form]);


  function onSubmit(data: FormValues) {
    const saveData: PlayerSaveData = {
      name: `${data.firstName} ${data.lastName}`.trim(),
      number: data.number,
      role: data.role
    };
    onSave(saveData, player?.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{player ? "Modifica Giocatore" : "Aggiungi Giocatore"}</DialogTitle>
          <DialogDescription>
            {player
              ? "Modifica i dettagli del giocatore e salva."
              : "Inserisci i dettagli per creare un nuovo giocatore."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Es: Mario" {...field} />
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
                    <FormLabel>Cognome</FormLabel>
                    <FormControl>
                      <Input placeholder="Es: Rossi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Numero Maglia</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Es: 10" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Ruolo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleziona un ruolo" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {ROLES.map(role => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

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
