"use client";

import { useState, useEffect, useId } from "react";
import type { PlayerCharacter, Combatant } from "@/lib/types";
import { useCampaign } from "@/contexts/campaign-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ListOrdered, PlusCircle, Trash2, UserPlus, ShieldAlert, Users, ArrowRight, ArrowLeft, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InitiativeTrackerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InitiativeTrackerDrawer({ open, onOpenChange }: InitiativeTrackerDrawerProps) {
  const { activeCampaignParty } = useCampaign();
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const uniqueId = useId();

  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState<PlayerCharacter | null>(null);
  const [playerInitiative, setPlayerInitiative] = useState<string>("");

  const [isAddEnemyDialogOpen, setIsAddEnemyDialogOpen] = useState(false);
  const [enemyName, setEnemyName] = useState("");
  const [enemyInitiative, setEnemyInitiative] = useState("");

  useEffect(() => {
    // Sort combatants whenever the list changes
    const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative || a.name.localeCompare(b.name));
    setCombatants(sorted);
  }, [combatants.length]); // Re-sort only when length changes to avoid issues with direct state update and sort

  const handleAddPlayer = () => {
    if (!selectedPlayerToAdd || playerInitiative === "") {
      toast({ title: "Missing Information", description: "Please select a player and enter their initiative.", variant: "destructive" });
      return;
    }
    const initiativeValue = parseInt(playerInitiative);
    if (isNaN(initiativeValue)) {
      toast({ title: "Invalid Initiative", description: "Initiative must be a number.", variant: "destructive" });
      return;
    }
    if (combatants.find(c => c.playerId === selectedPlayerToAdd.id)) {
      toast({ title: "Player Already Added", description: `${selectedPlayerToAdd.name} is already in the initiative order.`, variant: "destructive" });
      return;
    }

    const newCombatant: Combatant = {
      id: `${uniqueId}-player-${selectedPlayerToAdd.id}`,
      name: selectedPlayerToAdd.name,
      initiative: initiativeValue,
      type: 'player',
      color: selectedPlayerToAdd.color,
      playerId: selectedPlayerToAdd.id,
    };
    setCombatants(prev => [...prev, newCombatant].sort((a, b) => b.initiative - a.initiative || a.name.localeCompare(b.name)));
    if (currentTurnIndex === null && combatants.length === 0) setCurrentTurnIndex(0); // Start combat if first one added
    setIsAddPlayerDialogOpen(false);
    setSelectedPlayerToAdd(null);
    setPlayerInitiative("");
    toast({ title: "Player Added", description: `${selectedPlayerToAdd.name} added to initiative.` });
  };
  
  const handleAddEnemy = () => {
    if (!enemyName.trim() || enemyInitiative === "") {
      toast({ title: "Missing Information", description: "Please enter enemy name and initiative.", variant: "destructive" });
      return;
    }
    const initiativeValue = parseInt(enemyInitiative);
    if (isNaN(initiativeValue)) {
      toast({ title: "Invalid Initiative", description: "Initiative must be a number.", variant: "destructive" });
      return;
    }
    const newCombatant: Combatant = {
      id: `${uniqueId}-enemy-${Date.now()}`,
      name: enemyName.trim(),
      initiative: initiativeValue,
      type: 'enemy',
    };
    setCombatants(prev => [...prev, newCombatant].sort((a, b) => b.initiative - a.initiative || a.name.localeCompare(b.name)));
    if (currentTurnIndex === null && combatants.length === 0) setCurrentTurnIndex(0); // Start combat if first one added
    setIsAddEnemyDialogOpen(false);
    setEnemyName("");
    setEnemyInitiative("");
    toast({ title: "Enemy Added", description: `${newCombatant.name} added to initiative.` });
  };

  const removeCombatant = (id: string) => {
    setCombatants(prev => {
      const newCombatants = prev.filter(c => c.id !== id);
      if (newCombatants.length === 0) {
        setCurrentTurnIndex(null);
      } else if (currentTurnIndex !== null) {
        // Adjust currentTurnIndex if the removed combatant affects it
        const removedCombatant = prev.find(c => c.id === id);
        const originalIndex = prev.findIndex(c => c.id === id);
        if (removedCombatant && currentTurnIndex === originalIndex) {
           // If current turn was removed, try to stay on same effective turn or move to next
           setCurrentTurnIndex(currentTurnIndex % newCombatants.length);
        } else if (currentTurnIndex > originalIndex) {
           setCurrentTurnIndex(currentTurnIndex - 1);
        }
      }
      return newCombatants;
    });
    toast({ title: "Combatant Removed" });
  };

  const nextTurn = () => {
    if (combatants.length === 0 || currentTurnIndex === null) return;
    setCurrentTurnIndex((currentTurnIndex + 1) % combatants.length);
  };

  const prevTurn = () => {
    if (combatants.length === 0 || currentTurnIndex === null) return;
    setCurrentTurnIndex((currentTurnIndex - 1 + combatants.length) % combatants.length);
  };

  const endCombat = () => {
    setCombatants([]);
    setCurrentTurnIndex(null);
    toast({ title: "Combat Ended", description: "Initiative order has been cleared." });
  };

  const availablePartyMembers = activeCampaignParty.filter(p => !combatants.some(c => c.playerId === p.id));

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[380px] sm:w-[500px] flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center"><ListOrdered className="mr-2 h-6 w-6 text-primary"/>Initiative Tracker</SheetTitle>
            <SheetDescription>Manage combat turn order. Add party members and enemies.</SheetDescription>
          </SheetHeader>
          
          <div className="py-2 flex gap-2">
            <Button onClick={() => setIsAddPlayerDialogOpen(true)} variant="outline" className="flex-1">
              <Users className="mr-2 h-4 w-4" /> Add Player
            </Button>
            <Button onClick={() => setIsAddEnemyDialogOpen(true)} variant="outline" className="flex-1">
              <ShieldAlert className="mr-2 h-4 w-4" /> Add Enemy
            </Button>
          </div>

          <div className="flex-grow flex flex-col min-h-0 mt-2">
            <Label className="mb-1">Combat Order (Highest to Lowest)</Label>
            <ScrollArea className="border rounded-md p-1 flex-grow bg-muted/30 h-full">
              {combatants.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No combatants yet. Add players or enemies to start.</p>}
              <ul className="space-y-1.5">
                {combatants.map((c, index) => (
                  <li 
                    key={c.id} 
                    className={`p-2.5 rounded-md flex items-center justify-between transition-all shadow-sm ${currentTurnIndex === index ? 'ring-2 ring-primary bg-primary/10' : 'bg-background'}`}
                    style={c.type === 'player' && c.color ? { borderLeft: `4px solid ${c.color}` } : {}}
                  >
                    <div className="flex items-center">
                      <span className={`font-bold text-lg mr-3 ${currentTurnIndex === index ? 'text-primary' : ''}`}>{c.initiative}</span>
                      <div>
                        <p className={`font-medium ${c.type === 'enemy' ? 'text-destructive' : ''}`}>{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.type === 'player' ? 'Player' : 'Enemy'}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeCombatant(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
          
          {combatants.length > 0 && (
            <div className="pt-4 space-y-2">
                <div className="flex gap-2">
                    <Button onClick={prevTurn} variant="outline" className="flex-1"><ArrowLeft className="mr-2 h-4 w-4"/>Prev</Button>
                    <Button onClick={nextTurn} className="flex-1 bg-primary hover:bg-primary/90"><ArrowRight className="mr-2 h-4 w-4"/>Next Turn</Button>
                </div>
                 <Button onClick={endCombat} variant="destructive" className="w-full"><XCircle className="mr-2 h-4 w-4"/>End Combat</Button>
            </div>
          )}

          <SheetFooter className="mt-auto pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">Close Tracker</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Add Player Dialog */}
      <Dialog open={isAddPlayerDialogOpen} onOpenChange={setIsAddPlayerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Player to Initiative</DialogTitle>
            <DialogDescription>Select a player character and enter their initiative roll.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div>
              <Label htmlFor="player-select">Player Character</Label>
              {availablePartyMembers.length > 0 ? (
                <select
                  id="player-select"
                  value={selectedPlayerToAdd?.id || ""}
                  onChange={(e) => setSelectedPlayerToAdd(activeCampaignParty.find(p => p.id === e.target.value) || null)}
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                >
                  <option value="" disabled>Select a player</option>
                  {availablePartyMembers.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Lvl {p.level} {p.race} {p.class})</option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">All party members already added or no party members available.</p>
              )}
            </div>
            <div>
              <Label htmlFor="player-initiative">Initiative Roll</Label>
              <Input id="player-initiative" type="number" value={playerInitiative} onChange={(e) => setPlayerInitiative(e.target.value)} placeholder="e.g., 15" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPlayerDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPlayer} disabled={!selectedPlayerToAdd || availablePartyMembers.length === 0}>Add Player</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Enemy Dialog */}
      <Dialog open={isAddEnemyDialogOpen} onOpenChange={setIsAddEnemyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Enemy to Initiative</DialogTitle>
            <DialogDescription>Enter the enemy's name and initiative roll.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div>
              <Label htmlFor="enemy-name">Enemy Name</Label>
              <Input id="enemy-name" value={enemyName} onChange={(e) => setEnemyName(e.target.value)} placeholder="e.g., Goblin Boss" />
            </div>
            <div>
              <Label htmlFor="enemy-initiative">Initiative Roll</Label>
              <Input id="enemy-initiative" type="number" value={enemyInitiative} onChange={(e) => setEnemyInitiative(e.target.value)} placeholder="e.g., 12" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEnemyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEnemy}>Add Enemy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}