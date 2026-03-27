"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function MatchNotesTab() {
  const { match, updateMatch } = useMatchDetailStore();
  const [localNotes, setLocalNotes] = useState(match?.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (match) {
      setLocalNotes(match.notes || "");
    }
  }, [match]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMatch({ notes: localNotes });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Non è stato possibile salvare le note.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-foreground" />
            <CardTitle>Note Tattiche</CardTitle>
          </div>
          <CardDescription>Analisi post-partita, note sull'avversario e progressi tecnici.</CardDescription>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold uppercase text-xs"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Salvataggio..." : "Salva Note"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Inserisci qui le tue annotazioni (es. Punti deboli avversario, prestazioni individuali, suggerimenti per il prossimo allenamento...)"
          className="min-h-[300px] text-sm leading-relaxed"
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}
