
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore } from "@/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const PRESET_COLORS = [
  "#1A237E", // PT Blue
  "#FF8F00", // PT Accent
  "#D32F2F", // Red
  "#388E3C", // Green
  "#7B1FA2", // Purple
  "#0097A7", // Teal
  "#E64A19", // Deep Orange
  "#455A64", // Blue Gray
];

interface ScoutCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: any[];
}

export function ScoutCategoryDialog({ open, onOpenChange, categories }: ScoutCategoryDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [loading, setLoading] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleAddCategory = async () => {
    if (!user || !firestore || !newCatName.trim()) return;
    
    setLoading(true);
    try {
      const id = `CAT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      await setDoc(doc(firestore, 'users', user.uid, 'scoutCategories', id), {
        id,
        name: newCatName.trim(),
        colorHex: selectedColor,
        userId: user.uid
      });
      setNewCatName("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!user || !firestore) return;
    await deleteDoc(doc(firestore, 'users', user.uid, 'scoutCategories', id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-primary text-white shrink-0">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">
            Gestisci Etichette
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Form nuova categoria */}
          <div className="space-y-4 p-4 rounded-2xl bg-muted/30 border">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nuova Etichetta</Label>
              <div className="flex gap-2">
                <Input 
                  value={newCatName} 
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="Es: Piede Sinistro"
                  className="h-10 rounded-xl font-bold uppercase text-xs"
                />
                <Button 
                  size="sm" 
                  className="bg-accent text-accent-foreground h-10 rounded-xl font-black uppercase px-4"
                  onClick={handleAddCategory}
                  disabled={loading || !newCatName.trim()}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Scegli Colore</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <div 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="h-6 w-6 rounded-full cursor-pointer transition-transform hover:scale-110 flex items-center justify-center border-2 border-white"
                    style={{ backgroundColor: color, boxShadow: selectedColor === color ? `0 0 0 2px ${color}` : 'none' }}
                  >
                    {selectedColor === color && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lista categorie esistenti */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Etichette Esistenti</Label>
            <ScrollArea className="h-[200px] w-full rounded-xl border p-2">
              <div className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-[10px] text-center py-10 text-muted-foreground font-bold uppercase italic">Nessuna etichetta salvata.</p>
                ) : (
                  categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.colorHex }} />
                        <span className="text-[10px] font-black uppercase tracking-tight">{cat.name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0">
          <Button className="w-full rounded-xl font-black uppercase text-xs h-12" variant="outline" onClick={() => onOpenChange(false)}>
            Chiudi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
