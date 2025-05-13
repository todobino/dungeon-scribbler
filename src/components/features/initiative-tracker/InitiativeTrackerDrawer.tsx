
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
import { ListOrdered, PlusCircle, Trash2, UserPlus, ShieldAlert, Users, ArrowRight, ArrowLeft, XCircle, Dice5, Heart, Shield, ChevronsRightIcon, Skull } from "lucide-react";
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

  const [isAddFriendlyDialogOpen, setIsAddFriendlyDialogOpen] = useState(false);
  const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState<PlayerCharacter | null>(null);
  const [allyNameInput, setAllyNameInput] = useState<string>("");
  const [friendlyInitiativeInput, setFriendlyInitiativeInput] = useState<string>("");

  const [isAddEnemyDialogOpen, setIsAddEnemyDialogOpen] = useState(false);
  const [enemyName, setEnemyName] = useState("");
  const [enemyInitiativeInput, setEnemyInitiativeInput] = useState<string>(""); 
  const [enemyQuantityInput, setEnemyQuantityInput] = useState<string>("1");
  const [rollEnemyInitiativeFlag, setRollEnemyInitiativeFlag] = useState<boolean>(false);
  const [enemyAC, setEnemyAC] = useState<string>("");
  const [enemyHP, setEnemyHP] = useState<string>("");
  
  const [damageInputs, setDamageInputs] = useState<Record<string, string>>({});


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

  const availablePartyMembers = activeCampaignParty.filter(p => !combatants.some(c => c.playerId === p.id));
  const isAllyMode = availablePartyMembers.length === 0;


  const handleAddFriendly = () => {
    const initiativeValue = parseInt(friendlyInitiativeInput);
    if (isNaN(initiativeValue) || friendlyInitiativeInput.trim() === "") {
      console.error("Invalid Initiative: Initiative must be a number.");
      return;
    }

    let name: string;
    let playerId: string | undefined = undefined;
    let color: string | undefined = undefined;
    let finalInitiative = initiativeValue;


    if (isAllyMode) {
      if (!allyNameInput.trim()) {
        console.error("Missing Information: Ally name cannot be empty.");
        return;
      }
      name = allyNameInput.trim();
    } else { // Player mode
      if (!selectedPlayerToAdd) {
        console.error("Missing Information: Please select a player.");
        return;
      }
      if (combatants.find(c => c.playerId === selectedPlayerToAdd.id)) {
        console.warn("Player Already Added:", selectedPlayerToAdd.name, "is already in the initiative order.");
        // Optionally clear selection and close dialog
        setIsAddFriendlyDialogOpen(false);
        setSelectedPlayerToAdd(null);
        setFriendlyInitiativeInput("");
        return;
      }
      name = selectedPlayerToAdd.name;
      playerId = selectedPlayerToAdd.id;
      color = selectedPlayerToAdd.color;
    }

    const newCombatant: Combatant = {
      id: `${uniqueId}-${isAllyMode ? 'ally' : 'player'}-${playerId || name.replace(/\s+/g, '')}-${Date.now()}`,
      name,
      initiative: finalInitiative,
      type: 'player', // Allies are still 'player' type for initiative purposes
      color,
      playerId,
    };
    
    setCombatants(prev => [...prev, newCombatant]);
    if (currentTurnIndex === null && (combatants.length > 0 || combatants.length === 0 && [newCombatant].length > 0)) {
       setCurrentTurnIndex(0);
    }
    
    // Reset states
    setIsAddFriendlyDialogOpen(false);
    setSelectedPlayerToAdd(null);
    setAllyNameInput("");
    setFriendlyInitiativeInput("");
  };

  const handleRollFriendlyInitiative = () => {
    let mod = 0;
    if (!isAllyMode && selectedPlayerToAdd) {
      mod = selectedPlayerToAdd.initiativeModifier || 0;
    }
    // For allies (isAllyMode === true), mod remains 0 (flat d20 roll)
    const roll = rollDie(20) + mod;
    setFriendlyInitiativeInput(roll.toString());
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

    const acValue = enemyAC.trim() === "" ? undefined : parseInt(enemyAC);
    const hpValue = enemyHP.trim() === "" ? undefined : parseInt(enemyHP);

    if (enemyAC.trim() !== "" && (isNaN(acValue!) || acValue! < 0) ) {
        console.error("Invalid AC: Must be a non-negative number.");
        return;
    }
    if (enemyHP.trim() !== "" && (isNaN(hpValue!) || hpValue! <= 0)) {
        console.error("Invalid HP: Must be a positive number.");
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
        ac: acValue,
        hp: hpValue,
        currentHp: hpValue,
      });
    }
    
    setCombatants(prev => [...prev, ...newEnemies]);
     if (currentTurnIndex === null && (combatants.length > 0 || (combatants.length === 0 && newEnemies.length > 0 ))) {
       setCurrentTurnIndex(0);
    }
    
    setIsAddEnemyDialogOpen(false);
    setEnemyName("");
    setEnemyInitiativeInput("");
    setEnemyQuantityInput("1");
    setRollEnemyInitiativeFlag(false);
    setEnemyAC("");
    setEnemyHP("");
  };

  const handleDamageInputChange = (combatantId: string, value: string) => {
    setDamageInputs(prev => ({ ...prev, [combatantId]: value }));
  };

  const handleApplyDamage = (combatantId: string, type: 'damage' | 'heal') => {
    const amountStr = damageInputs[combatantId];
    if (!amountStr) return;
    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount <= 0) {
      console.error("Invalid amount: Must be a positive number.");
      return;
    }

    setCombatants(prevCombatants =>
      prevCombatants.map(combatant => {
        if (combatant.id === combatantId && combatant.type === 'enemy' && combatant.hp !== undefined) {
          let newHp = combatant.currentHp ?? combatant.hp!; 
          if (type === 'damage') {
            newHp = Math.max(0, newHp - amount);
          } else { 
            newHp = Math.min(combatant.hp!, newHp + amount);
          }
          return { ...combatant, currentHp: newHp };
        }
        return combatant;
      })
    );
    setDamageInputs(prev => ({ ...prev, [combatantId]: "" })); 
  };

  const removeCombatant = (id: string) => {
    const combatantToRemoveIndex = combatants.findIndex(c => c.id === id);
    setCombatants(prev => {
        const newCombatants = prev.filter(c => c.id !== id);
        combatantRefs.current.delete(id); 

        if (newCombatants.length === 0) {
            setCurrentTurnIndex(null);
        } else if (currentTurnIndex !== null) {
            if (combatantToRemoveIndex === currentTurnIndex) {
                if (currentTurnIndex >= newCombatants.length) {
                    setCurrentTurnIndex(newCombatants.length > 0 ? newCombatants.length - 1 : null);
                }
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
    setDamageInputs({});
  };
  
  const handleRollAllPlayerInitiatives = () => {
    if (availablePartyMembers.length === 0) return;

    const newCombatantsFromParty: Combatant[] = availablePartyMembers.map(player => {
      const initiativeRoll = rollDie(20) + (player.initiativeModifier || 0);
      return {
        id: `${uniqueId}-player-${player.id}-${Date.now()}`,
        name: player.name,
        initiative: initiativeRoll,
        type: 'player',
        color: player.color,
        playerId: player.id,
      };
    });

    setCombatants(prev => [...prev, ...newCombatantsFromParty]);
    if (currentTurnIndex === null && (combatants.length === 0 && newCombatantsFromParty.length > 0)) {
      setCurrentTurnIndex(0);
    }
  };


  const addPlayerButtonLabel = availablePartyMembers.length > 0 ? "Add Player" : "Add Ally";

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[380px] sm:w-[500px] flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center"><ListOrdered className="mr-2 h-6 w-6 text-primary"/>Initiative Tracker</SheetTitle>
          </SheetHeader>
          
          <div className="py-2 flex flex-col gap-2">
            <div className="flex gap-2">
                <Button onClick={() => setIsAddFriendlyDialogOpen(true)} variant="outline" className="flex-1">
                {isAllyMode ? <UserPlus className="mr-2 h-4 w-4" /> : <Users className="mr-2 h-4 w-4" />}
                {addPlayerButtonLabel}
                </Button>
                <Button onClick={() => setIsAddEnemyDialogOpen(true)} variant="outline" className="flex-1">
                <ShieldAlert className="mr-2 h-4 w-4" /> Add Enemy
                </Button>
            </div>
            {availablePartyMembers.length > 0 && (
                <Button onClick={handleRollAllPlayerInitiatives} variant="outline" className="w-full">
                    <Dice5 className="mr-2 h-4 w-4"/> Roll All Player Initiatives
                </Button>
            )}
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
                    className={`p-2.5 rounded-md flex flex-col gap-1.5 transition-all shadow-sm ${currentTurnIndex === index ? 'ring-2 ring-primary bg-primary/10' : 'bg-background'}`}
                    style={c.type === 'player' && c.color ? { borderLeft: `4px solid ${c.color}` } : {}}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <span className={`font-bold text-lg mr-3 ${currentTurnIndex === index ? 'text-primary' : ''}`}>{c.initiative}</span>
                        <div>
                          <p className={`font-medium ${c.type === 'enemy' ? 'text-destructive' : ''}`}>{c.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.type === 'player' ? (isAllyMode && !c.playerId ? 'Ally' : 'Player') : 'Enemy'}
                            {c.type === 'player' && c.playerId && (() => {
                              const player = activeCampaignParty.find(p => p.id === c.playerId);
                              return player ? <span className="ml-1">(AC: {player.armorClass})</span> : null;
                            })()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeCombatant(c.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {c.type === 'enemy' && (c.ac !== undefined || c.hp !== undefined) && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-1.5 mt-1">
                        {c.ac !== undefined && <div className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> AC: {c.ac}</div>}
                        {c.hp !== undefined && <div className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> HP: {c.currentHp ?? c.hp}/{c.hp}</div>}
                      </div>
                    )}

                    {c.type === 'enemy' && c.hp !== undefined && (
                        <>
                          {c.currentHp !== undefined && c.currentHp === 0 ? (
                            <Button
                              variant="destructive"
                              className="w-full mt-1.5 py-1 h-auto text-sm"
                              onClick={(e) => { e.stopPropagation(); removeCombatant(c.id); }}
                            >
                              <Skull className="mr-2 h-4 w-4" /> Dead (Remove)
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1.5 pt-1">
                              <Input
                                type="number"
                                placeholder="Amt"
                                className="h-8 text-sm w-20 px-2 py-1"
                                value={damageInputs[c.id] || ""}
                                onChange={(e) => handleDamageInputChange(c.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                min="1"
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                className="px-2 py-1 h-8 text-xs"
                                onClick={(e) => { e.stopPropagation(); handleApplyDamage(c.id, 'damage'); }}
                              >
                                Hit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="px-2 py-1 h-8 text-xs border-green-600 text-green-600 hover:bg-green-500/10 hover:text-green-700"
                                onClick={(e) => { e.stopPropagation(); handleApplyDamage(c.id, 'heal'); }}
                              >
                                Heal
                              </Button>
                            </div>
                          )}
                        </>
                      )}
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
            {/* Close Tracker button removed here */}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Add Friendly (Player/Ally) Dialog */}
      <Dialog open={isAddFriendlyDialogOpen} onOpenChange={setIsAddFriendlyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAllyMode ? "Add Ally to Initiative" : "Add Player to Initiative"}</DialogTitle>
            <DialogDescription>
              {isAllyMode ? "Enter the ally's name and initiative." : "Select a player character and enter or roll their initiative."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {isAllyMode ? (
              <div>
                <Label htmlFor="ally-name">Ally Name</Label>
                <Input id="ally-name" value={allyNameInput} onChange={(e) => setAllyNameInput(e.target.value)} placeholder="e.g., Sir Reginald" />
              </div>
            ) : (
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
                      <option key={p.id} value={p.id}>{p.name} (Lvl {p.level} {p.race} {p.class} - AC: {p.armorClass} / Init Mod: {p.initiativeModifier ?? 0})</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">All party members already added.</p>
                )}
              </div>
            )}
            <div>
              <Label htmlFor="friendly-initiative">Initiative</Label>
              <div className="flex gap-2 items-center">
                <Input id="friendly-initiative" type="number" value={friendlyInitiativeInput} onChange={(e) => setFriendlyInitiativeInput(e.target.value)} placeholder="e.g., 15" className="flex-grow" />
                {!isAllyMode && selectedPlayerToAdd && (
                  <Button onClick={handleRollFriendlyInitiative} variant="outline" size="sm" className="shrink-0">
                    <Dice5 className="mr-1 h-4 w-4"/> Roll (d20 +{selectedPlayerToAdd.initiativeModifier || 0})
                  </Button>
                )}
                 {isAllyMode && (
                    <Button onClick={handleRollFriendlyInitiative} variant="outline" size="sm" className="shrink-0">
                        <Dice5 className="mr-1 h-4 w-4"/> Roll (d20)
                    </Button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
                setIsAddFriendlyDialogOpen(false);
                setSelectedPlayerToAdd(null);
                setAllyNameInput("");
                setFriendlyInitiativeInput("");
            }}>Cancel</Button>
            <Button onClick={handleAddFriendly} disabled={(!isAllyMode && !selectedPlayerToAdd) || (isAllyMode && !allyNameInput.trim())}>
              {isAllyMode ? "Add Ally" : "Add Player"}
            </Button>
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
             <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="enemy-ac">AC (Optional)</Label>
                <Input id="enemy-ac" type="number" value={enemyAC} onChange={(e) => setEnemyAC(e.target.value)} placeholder="e.g., 13" />
              </div>
              <div>
                <Label htmlFor="enemy-hp">HP (Optional)</Label>
                <Input id="enemy-hp" type="number" value={enemyHP} onChange={(e) => setEnemyHP(e.target.value)} placeholder="e.g., 7" />
              </div>
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
              setEnemyAC("");
              setEnemyHP("");
            }}>Cancel</Button>
            <Button onClick={handleAddEnemy}>Add Enemy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

