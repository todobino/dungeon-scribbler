tsx
"use client";

import { useState, useEffect, useId, useRef } from "react";
import type { PlayerCharacter, Combatant } from "@/lib/types";
import { useCampaign } from "@/contexts/campaign-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ListOrdered, PlusCircle, Trash2, UserPlus, ShieldAlert, Users, ArrowRight, ArrowLeft, XCircle, Dice5 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { rollDie } from "@/lib/dice-utils";


interface InitiativeTrackerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InitiativeTrackerDrawer({ open, onOpenChange }: InitiativeTrackerDrawerProps) {
  const { activeCampaignParty } = useCampaign();
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number | null>(null);
  const uniqueId = useId();

  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState<PlayerCharacter | null>(null);
  const [playerInitiative, setPlayerInitiative] = useState<string>("");

  const [isAddEnemyDialogOpen, setIsAddEnemyDialogOpen] = useState(false);
  const [enemyName, setEnemyName] = useState("");
  const [enemyInitiativeInput, setEnemyInitiativeInput] = useState<string>(""); 
  const [enemyQuantityInput, setEnemyQuantityInput] = useState<string>("1");
  const [rollEnemyInitiativeFlag, setRollEnemyInitiativeFlag] = useState<boolean>(false);

  const combatantRefs = useRef<Map<string, HTMLLIElement | null>>(new Map());

  useEffect(() => {
    const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative || a.name.localeCompare(b.name));
    if (JSON.stringify(sorted) !== JSON.stringify(combatants)) {
        setCombatants(sorted);
    }
  }, [combatants]);

  useEffect(() => {
    if (currentTurnIndex !== null && combatants.length > 0) {
      const activeCombatantId = combatants[currentTurnIndex]?.id;
      if (activeCombatantId) {
        const activeElement = combatantRefs.current.get(activeCombatantId);
        activeElement?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [currentTurnIndex, combatants]);

  const parseModifierString = (modStr: string): number => {
    modStr = modStr.trim();
    if (modStr === "") return 0;
    const num = parseInt(modStr);
    return isNaN(num) ? 0 : num;
  };

  const handleAddPlayer = () => {
    if (!selectedPlayerToAdd || playerInitiative === "") {
      console.error("Missing Information: Please select a player and enter their initiative.");
      return;
    }
    const initiativeValue = parseInt(playerInitiative);
    if (isNaN(initiativeValue)) {
      console.error("Invalid Initiative: Initiative must be a number.");
      return;
    }
    if (combatants.find(c => c.playerId === selectedPlayerToAdd.id)) {
      console.warn("Player Already Added:", selectedPlayerToAdd.name, "is already in the initiative order.");
      return;
    }

    const newCombatant: Combatant = {
      id: `${uniqueId}-player-${selectedPlayerToAdd.id}-${Date.now()}`, // Added Date.now() for more uniqueness
      name: selectedPlayerToAdd.name,
      initiative: initiativeValue,
      type: 'player',
      color: selectedPlayerToAdd.color,
      playerId: selectedPlayerToAdd.id,
    };
    setCombatants(prev => [...prev, newCombatant]);
    if (currentTurnIndex === null && combatants.length === 0) setCurrentTurnIndex(0); // Set turn if it's the first combatant
    setIsAddPlayerDialogOpen(false);
    setSelectedPlayerToAdd(null);
    setPlayerInitiative("");
  };
  
  const handleAddEnemy = () => {
    if (!enemyName.trim()) {
      console.error("Missing Information: Please enter enemy name.");
      return;
    }

    const quantity = parseInt(enemyQuantityInput) || 1;
    if (quantity <= 0) {
      console.error("Invalid Quantity: Must be a positive number.");
      return;
    }

    const newEnemies: Combatant[] = [];

    for (let i = 0; i < quantity; i++) {
      let initiativeValue: number;
      const currentEnemyName = quantity > 1 ? `${enemyName.trim()} ${i + 1}` : enemyName.trim();

      if (rollEnemyInitiativeFlag) {
        const modifier = parseModifierString(enemyInitiativeInput);
        initiativeValue = rollDie(20) + modifier;
      } else {
        if (enemyInitiativeInput === "") {
          console.error("Missing Information: Please enter initiative value or roll for enemy.");
          return; 
        }
        initiativeValue = parseInt(enemyInitiativeInput);
        if (isNaN(initiativeValue)) {
          console.error("Invalid Initiative: Initiative must be a number.");
          return; 
        }
      }
      
      newEnemies.push({
        id: `${uniqueId}-enemy-${Date.now()}-${i}`,
        name: currentEnemyName,
        initiative: initiativeValue,
        type: 'enemy',
      });
    }
    
    setCombatants(prev => [...prev, ...newEnemies]);
    if (currentTurnIndex === null && combatants.length === 0 && newEnemies.length > 0) setCurrentTurnIndex(0); // Set turn if these are the first combatants
    
    setIsAddEnemyDialogOpen(false);
    setEnemyName("");
    setEnemyInitiativeInput("");
    setEnemyQuantityInput("1");
    setRollEnemyInitiativeFlag(false);
  };

  const removeCombatant = (id: string) => {
    const combatantToRemoveIndex = combatants.findIndex(c => c.id === id);
    setCombatants(prev => {
        const newCombatants = prev.filter(c => c.id !== id);
        combatantRefs.current.delete(id); // Clean up ref

        if (newCombatants.length === 0) {
            setCurrentTurnIndex(null);
        } else if (currentTurnIndex !== null) {
            if (combatantToRemoveIndex === currentTurnIndex) {
                if (currentTurnIndex >= newCombatants.length) {
                    setCurrentTurnIndex(newCombatants.length > 0 ? newCombatants.length - 1 : null);
                }
                // else, currentTurnIndex remains valid for the new item at that position or will be handled by next/prev
            } else if (combatantToRemoveIndex < currentTurnIndex) {
                setCurrentTurnIndex(currentTurnIndex - 1);
            }
        }
        return newCombatants;
    });
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
    combatantRefs.current.clear();
  };

  const availablePartyMembers = activeCampaignParty.filter(p => !combatants.some(c => c.playerId === p.id));

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[380px] sm:w-[500px] flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center"><ListOrdered className="mr-2 h-6 w-6 text-primary"/>Initiative Tracker</SheetTitle>
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
                    ref={(el) => combatantRefs.current.set(c.id, el)}
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
            <DialogDescription>Enter enemy details. You can add multiple and roll their initiative.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div>
              <Label htmlFor="enemy-name">Enemy Name</Label>
              <Input id="enemy-name" value={enemyName} onChange={(e) => setEnemyName(e.target.value)} placeholder="e.g., Goblin" />
            </div>
            <div>
              <Label htmlFor="enemy-quantity">Quantity</Label>
              <Input id="enemy-quantity" type="number" value={enemyQuantityInput} onChange={(e) => setEnemyQuantityInput(e.target.value)} placeholder="1" min="1" />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="roll-enemy-initiative" checked={rollEnemyInitiativeFlag} onCheckedChange={setRollEnemyInitiativeFlag} />
              <Label htmlFor="roll-enemy-initiative" className="cursor-pointer">Roll Initiative for Enemy?</Label>
            </div>
            <div>
              <Label htmlFor="enemy-initiative-input">
                {rollEnemyInitiativeFlag ? "Initiative Modifier (e.g., +2 or -1)" : "Fixed Initiative Value"}
              </Label>
              <Input 
                id="enemy-initiative-input" 
                value={enemyInitiativeInput} 
                onChange={(e) => setEnemyInitiativeInput(e.target.value)} 
                placeholder={rollEnemyInitiativeFlag ? "e.g., 2 or -1" : "e.g., 12"} 
                type={rollEnemyInitiativeFlag ? "text" : "number"} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddEnemyDialogOpen(false);
              setEnemyName("");
              setEnemyInitiativeInput("");
              setEnemyQuantityInput("1");
              setRollEnemyInitiativeFlag(false);
            }}>Cancel</Button>
            <Button onClick={handleAddEnemy}>Add Enemy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
