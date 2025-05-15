
"use client";

import { useState, useEffect, useId, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog as UIDialog, DialogContent as UIDialogContent, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle, DialogDescription as UIDialogDescription, DialogFooter as UIDialogFooter } from "@/components/ui/dialog"; // Renamed to avoid conflict
import { Switch } from "@/components/ui/switch";
import { Dice5, Zap, Trash2, ChevronRight, ListOrdered, PlusCircle, UserPlus, ShieldAlert, Users, ArrowRight, ArrowLeft, XCircle, Heart, Shield, ChevronsRightIcon, Skull } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseDiceNotation, rollMultipleDice, rollDie } from "@/lib/dice-utils";
import type { PlayerCharacter, Combatant } from "@/lib/types";
import { useCampaign } from "@/contexts/campaign-context";
import { DICE_ROLLER_TAB_ID, COMBAT_TRACKER_TAB_ID } from "@/lib/constants";


interface CombinedToolDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab: string;
}

// Dice Roller specific types
type RollMode = "normal" | "advantage" | "disadvantage";
interface RollLogEntry {
  id: string;
  inputText: string;
  resultText: string; 
  detailText: string;  
  isAdvantage?: boolean;
  isDisadvantage?: boolean;
  rolls?: number[];
  chosenRoll?: number;
  discardedRoll?: number;
  modifier?: number;
  sides?: number;
  isRolling?: boolean;
}

export function CombinedToolDrawer({ open, onOpenChange, defaultTab }: CombinedToolDrawerProps) {
  // Dice Roller State
  const [inputValue, setInputValue] = useState("");
  const [rollMode, setRollMode] = useState<RollMode>("normal");
  const [rollLog, setRollLog] = useState<RollLogEntry[]>([]);
  const diceUniqueId = useId();

  // Combat Tracker State
  const { activeCampaignParty } = useCampaign();
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number | null>(null);
  const combatUniqueId = useId();
  const [isAddFriendlyDialogOpen, setIsAddFriendlyDialogOpen] = useState(false);
  const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState<PlayerCharacter | null>(null);
  const [allyNameInput, setAllyNameInput] = useState<string>("");
  const [friendlyInitiativeInput, setFriendlyInitiativeInput] = useState<string>("");
  const [isAddEnemyDialogOpen, setIsAddEnemyDialogOpen] = useState(false);
  const [enemyName, setEnemyName] = useState("");
  const [enemyInitiativeInput, setEnemyInitiativeInput] = useState<string>(""); 
  const [enemyQuantityInput, setEnemyQuantityInput] = useState<string>("1");
  const [rollEnemyInitiativeFlag, setRollEnemyInitiativeFlag] = useState<boolean>(false);
  const [rollGroupInitiativeFlag, setRollGroupInitiativeFlag] = useState<boolean>(false);
  const [enemyAC, setEnemyAC] = useState<string>("");
  const [enemyHP, setEnemyHP] = useState<string>("");
  const [damageInputs, setDamageInputs] = useState<Record<string, string>>({});
  const combatantRefs = useRef<Map<string, HTMLLIElement | null>>(new Map());

  // Effect to sync active tab with defaultTab prop
  const [activeTab, setActiveTab] = useState(defaultTab);
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, open]); // Also reset if drawer re-opens with different default


  // --- Dice Roller Logic ---
  const handleDiceRoll = () => {
    const notationToParse = inputValue.trim() === "" ? "1d20" : inputValue.trim();
    const parsed = parseDiceNotation(notationToParse);
    const entryId = `${diceUniqueId}-${Date.now()}`;

    if (parsed.error) {
      const errorEntry: RollLogEntry = {
        id: entryId, inputText: notationToParse, resultText: "Error", detailText: parsed.error, isRolling: false,
      };
      setRollLog(prevLog => [errorEntry, ...prevLog.slice(0, 49)]);
      return;
    }
    if (parsed.sides <= 0 || parsed.count <= 0) {
      const errorEntry: RollLogEntry = {
        id: entryId, inputText: notationToParse, resultText: "Error", detailText: "Dice sides and count must be positive.", isRolling: false,
      };
      setRollLog(prevLog => [errorEntry, ...prevLog.slice(0, 49)]);
      return;
    }
    
    const placeholderEntry: RollLogEntry = {
      id: entryId, inputText: notationToParse, resultText: "...", detailText: "Rolling...",
      isAdvantage: rollMode === "advantage", isDisadvantage: rollMode === "disadvantage", isRolling: true,
    };
    setRollLog(prevLog => [placeholderEntry, ...prevLog.slice(0,49)]);

    setTimeout(() => {
      let finalResult: number;
      let resultRolls: number[] = [];
      let detailText = "";
      let chosen: number | undefined = undefined;
      let discarded: number | undefined = undefined;

      if (rollMode === "normal") {
        const { rolls, sum } = rollMultipleDice(parsed.count, parsed.sides);
        resultRolls = rolls;
        finalResult = sum + parsed.modifier;
        detailText = `Rolled ${parsed.count}d${parsed.sides}${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+" : "") + parsed.modifier : ""}: [${rolls.join(", ")}] ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+ " : "") + Math.abs(parsed.modifier) : ""} = ${finalResult}`;
      } else { 
        if (parsed.count !== 1 || parsed.sides !== 20) {
            const { rolls, sum } = rollMultipleDice(parsed.count, parsed.sides);
            resultRolls = rolls;
            finalResult = sum + parsed.modifier;
            detailText = `Rolled ${parsed.count}d${parsed.sides}${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+" : "") + parsed.modifier : ""}: [${rolls.join(", ")}] ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+ " : "") + Math.abs(parsed.modifier) : ""} = ${finalResult} (Mode ignored for non-1d20)`;
        } else {
          const roll1Result = rollMultipleDice(1, 20);
          const roll2Result = rollMultipleDice(1, 20);
          const roll1 = roll1Result.sum;
          const roll2 = roll2Result.sum;

          if (rollMode === "advantage") {
            chosen = Math.max(roll1, roll2);
            discarded = Math.min(roll1, roll2);
          } else { 
            chosen = Math.min(roll1, roll2);
            discarded = Math.max(roll1, roll2);
          }
          finalResult = chosen + parsed.modifier;
          resultRolls = [roll1, roll2]; 
          
          detailText = `Rolled 1d20 (${rollMode}) ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+" : "") + parsed.modifier : ""}: `;
          detailText += `[${roll1 === chosen ? `**${roll1}**` : roll1}, ${roll2 === chosen ? `**${roll2}**` : roll2}]`;
          detailText += ` ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+ " : "") + Math.abs(parsed.modifier) : ""} = ${finalResult}`;
        }
      }
      const finalLogEntry: RollLogEntry = {
        id: entryId, inputText: notationToParse, resultText: finalResult.toString(), detailText,
        isAdvantage: rollMode === "advantage", isDisadvantage: rollMode === "disadvantage",
        rolls: resultRolls, chosenRoll: chosen, discardedRoll: discarded, modifier: parsed.modifier, sides: parsed.sides, isRolling: false,
      };
      setRollLog(prevLog => prevLog.map(entry => entry.id === entryId ? finalLogEntry : entry));
    }, 500);
  };

  useEffect(() => {
    if (!open) {
      setRollMode("normal"); 
    }
  }, [open]);

  // --- Combat Tracker Logic ---
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
        activeElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
    if (isNaN(initiativeValue) || friendlyInitiativeInput.trim() === "") return;
    let name: string, playerId: string | undefined, color: string | undefined;
    if (isAllyMode) {
      if (!allyNameInput.trim()) return;
      name = allyNameInput.trim();
    } else {
      if (!selectedPlayerToAdd) return;
      if (combatants.find(c => c.playerId === selectedPlayerToAdd.id)) return;
      name = selectedPlayerToAdd.name; playerId = selectedPlayerToAdd.id; color = selectedPlayerToAdd.color;
    }
    const newCombatant: Combatant = {
      id: `${combatUniqueId}-${isAllyMode ? 'ally' : 'player'}-${playerId || name.replace(/\s+/g, '')}-${Date.now()}`,
      name, initiative: initiativeValue, type: 'player', color, playerId,
    };
    setCombatants(prev => [...prev, newCombatant]);
    if (currentTurnIndex === null && (combatants.length === 0 || [newCombatant].length > 0)) setCurrentTurnIndex(0);
    setIsAddFriendlyDialogOpen(false); setSelectedPlayerToAdd(null); setAllyNameInput(""); setFriendlyInitiativeInput("");
  };

  const handleRollFriendlyInitiative = () => {
    let mod = 0;
    if (!isAllyMode && selectedPlayerToAdd) mod = selectedPlayerToAdd.initiativeModifier || 0;
    setFriendlyInitiativeInput((rollDie(20) + mod).toString());
  };
  
  const handleAddEnemy = () => {
    if (!enemyName.trim()) return;
    const quantity = parseInt(enemyQuantityInput) || 1; if (quantity <= 0) return;
    const acValue = enemyAC.trim() === "" ? undefined : parseInt(enemyAC);
    const hpValue = enemyHP.trim() === "" ? undefined : parseInt(enemyHP);
    if (enemyAC.trim() !== "" && (isNaN(acValue!) || acValue! < 0)) return;
    if (enemyHP.trim() !== "" && (isNaN(hpValue!) || hpValue! <= 0)) return;

    const newEnemies: Combatant[] = [];
    let groupInitiativeValue: number | undefined;
    if (rollGroupInitiativeFlag) {
      groupInitiativeValue = rollEnemyInitiativeFlag ? rollDie(20) + parseModifierString(enemyInitiativeInput) : parseInt(enemyInitiativeInput);
      if (isNaN(groupInitiativeValue)) return;
    }
    for (let i = 0; i < quantity; i++) {
      let initiativeValue: number;
      const currentEnemyName = quantity > 1 ? `${enemyName.trim()} ${i + 1}` : enemyName.trim();
      if (rollGroupInitiativeFlag && groupInitiativeValue !== undefined) {
        initiativeValue = groupInitiativeValue;
      } else {
        initiativeValue = rollEnemyInitiativeFlag ? rollDie(20) + parseModifierString(enemyInitiativeInput) : parseInt(enemyInitiativeInput);
        if (isNaN(initiativeValue)) return;
      }
      newEnemies.push({
        id: `${combatUniqueId}-enemy-${Date.now()}-${i}`, name: currentEnemyName, initiative: initiativeValue, type: 'enemy', ac: acValue, hp: hpValue, currentHp: hpValue,
      });
    }
    setCombatants(prev => [...prev, ...newEnemies]);
    if (currentTurnIndex === null && (combatants.length === 0 || newEnemies.length > 0)) setCurrentTurnIndex(0);
    setIsAddEnemyDialogOpen(false); setEnemyName(""); setEnemyInitiativeInput(""); setEnemyQuantityInput("1"); setRollEnemyInitiativeFlag(false); setRollGroupInitiativeFlag(false); setEnemyAC(""); setEnemyHP("");
  };

  const handleDamageInputChange = (combatantId: string, value: string) => setDamageInputs(prev => ({ ...prev, [combatantId]: value }));
  const handleApplyDamage = (combatantId: string, type: 'damage' | 'heal') => {
    const amountStr = damageInputs[combatantId]; if (!amountStr) return;
    const amount = parseInt(amountStr); if (isNaN(amount) || amount <= 0) return;
    setCombatants(prevCombatants => prevCombatants.map(combatant => {
      if (combatant.id === combatantId && combatant.type === 'enemy' && combatant.hp !== undefined) {
        let newHp = combatant.currentHp ?? combatant.hp!;
        newHp = type === 'damage' ? Math.max(0, newHp - amount) : Math.min(combatant.hp!, newHp + amount);
        return { ...combatant, currentHp: newHp };
      } return combatant;
    }));
    setDamageInputs(prev => ({ ...prev, [combatantId]: "" })); 
  };
  const removeCombatant = (id: string) => {
    const combatantToRemoveIndex = combatants.findIndex(c => c.id === id);
    setCombatants(prev => {
      const newCombatants = prev.filter(c => c.id !== id); combatantRefs.current.delete(id); 
      if (newCombatants.length === 0) setCurrentTurnIndex(null);
      else if (currentTurnIndex !== null) {
        if (combatantToRemoveIndex === currentTurnIndex) setCurrentTurnIndex(currentTurnIndex >= newCombatants.length ? (newCombatants.length > 0 ? newCombatants.length - 1 : null) : currentTurnIndex);
        else if (combatantToRemoveIndex < currentTurnIndex) setCurrentTurnIndex(currentTurnIndex - 1);
      } return newCombatants;
    });
  };
  const nextTurn = () => { if (combatants.length === 0 || currentTurnIndex === null) return; setCurrentTurnIndex((currentTurnIndex + 1) % combatants.length); };
  const prevTurn = () => { if (combatants.length === 0 || currentTurnIndex === null) return; setCurrentTurnIndex((currentTurnIndex - 1 + combatants.length) % combatants.length); };
  const endCombat = () => { setCombatants([]); setCurrentTurnIndex(null); combatantRefs.current.clear(); setDamageInputs({}); };
  const handleRollAllPlayerInitiatives = () => {
    if (availablePartyMembers.length === 0) return;
    const newCombatantsFromParty: Combatant[] = availablePartyMembers.map(player => ({
      id: `${combatUniqueId}-player-${player.id}-${Date.now()}`, name: player.name, initiative: rollDie(20) + (player.initiativeModifier || 0), type: 'player', color: player.color, playerId: player.id,
    }));
    setCombatants(prev => [...prev, ...newCombatantsFromParty]);
    if (currentTurnIndex === null && (combatants.length === 0 && newCombatantsFromParty.length > 0)) setCurrentTurnIndex(0);
  };
  const addPlayerButtonLabel = availablePartyMembers.length > 0 ? "Add Player" : "Add Ally";


  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:w-[500px] flex flex-col p-0" hideCloseButton={true}>
        <div className="flex flex-col h-full pr-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <SheetHeader className="p-4 border-b">
               <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value={DICE_ROLLER_TAB_ID} className="flex items-center gap-2"><Dice5 className="h-4 w-4"/>Dice Roller</TabsTrigger>
                <TabsTrigger value={COMBAT_TRACKER_TAB_ID} className="flex items-center gap-2"><ListOrdered className="h-4 w-4"/>Combat Tracker</TabsTrigger>
              </TabsList>
            </SheetHeader>

            <TabsContent value={DICE_ROLLER_TAB_ID} className="flex-grow flex flex-col min-h-0 data-[state=inactive]:hidden">
              <div className="p-4 space-y-4 flex-grow flex flex-col">
                <div>
                  <Label htmlFor="dice-notation">Dice Notation (e.g., 2d6+3, d20)</Label>
                  <Input id="dice-notation" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="e.g., 2d6+3, d20" />
                </div>
                <div>
                  <Label>Roll Mode</Label>
                  <RadioGroup defaultValue="normal" value={rollMode} onValueChange={(value: string) => setRollMode(value as RollMode)} className="flex space-x-2 pt-1">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="normal" id="mode-normal" /><Label htmlFor="mode-normal" className="font-normal cursor-pointer">Normal</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="advantage" id="mode-advantage" /><Label htmlFor="mode-advantage" className="font-normal cursor-pointer">Advantage</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="disadvantage" id="mode-disadvantage" /><Label htmlFor="mode-disadvantage" className="font-normal cursor-pointer">Disadvantage</Label></div>
                  </RadioGroup>
                </div>
                <Button onClick={handleDiceRoll} className={cn("w-full", rollMode === "advantage" && "border-2 border-green-500 hover:border-green-600", rollMode === "disadvantage" && "border-2 border-red-500 hover:border-red-600")}>
                  <Zap className="mr-2 h-5 w-5" /> {inputValue.trim() === "" ? "Roll d20" : "Roll"}
                </Button>
                <div className="flex-grow flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-1"><Label>Roll Log</Label><Button variant="ghost" size="sm" onClick={() => setRollLog([])} className="text-xs text-muted-foreground hover:text-foreground"><Trash2 className="mr-1 h-3 w-3" /> Clear Log</Button></div>
                  <ScrollArea className="border rounded-md p-2 flex-grow bg-muted/30 h-full">
                    {rollLog.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No rolls yet.</p>}
                    <div className="space-y-3">
                      {rollLog.map(entry => (
                        <div key={entry.id} className={cn("text-sm p-2 rounded-md bg-background shadow-sm transition-all", entry.isRolling ? "opacity-50" : "animate-in slide-in-from-top-2 fade-in duration-300")}>
                          <p className="text-2xl font-bold text-primary">{entry.resultText}</p>
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: entry.detailText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            <TabsContent value={COMBAT_TRACKER_TAB_ID} className="flex-grow flex flex-col min-h-0 data-[state=inactive]:hidden">
                <div className="p-4 flex flex-col gap-2 border-b">
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
                <div className="flex-grow flex flex-col min-h-0 p-4">
                    <Label className="mb-1">Combat Order (Highest to Lowest)</Label>
                    <ScrollArea className="border rounded-md p-1 flex-grow bg-muted/30 h-full">
                        {combatants.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No combatants yet.</p>}
                        <ul className="space-y-1.5">
                        {combatants.map((c, index) => (
                            <li key={c.id} ref={(el) => combatantRefs.current.set(c.id, el)} className={`p-2.5 rounded-md flex flex-col gap-1.5 transition-all shadow-sm ${currentTurnIndex === index ? 'ring-2 ring-primary bg-primary/10' : 'bg-background'}`} style={c.type === 'player' && c.color ? { borderLeft: `4px solid ${c.color}` } : {}}>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center">
                                <span className={`font-bold text-lg mr-3 ${currentTurnIndex === index ? 'text-primary' : ''}`}>{c.initiative}</span>
                                <div>
                                    <p className={`font-medium ${c.type === 'enemy' ? 'text-destructive' : ''}`}>{c.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                    {c.type === 'player' ? (isAllyMode && !c.playerId ? 'Ally' : 'Player') : 'Enemy'}
                                    {c.type === 'player' && c.playerId && (() => { const player = activeCampaignParty.find(p => p.id === c.playerId); return player ? <span className="ml-1">(AC: {player.armorClass})</span> : null; })()}
                                    </p>
                                </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeCombatant(c.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            {c.type === 'enemy' && (c.ac !== undefined || c.hp !== undefined) && (
                                <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-1.5 mt-1">
                                {c.ac !== undefined && <div className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> AC: {c.ac}</div>}
                                {c.hp !== undefined && <div className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> HP: {c.currentHp ?? c.hp}/{c.hp}</div>}
                                </div>
                            )}
                            {c.type === 'enemy' && c.hp !== undefined && ( <> {c.currentHp !== undefined && c.currentHp === 0 ? ( <Button variant="destructive" className="w-full mt-1.5 py-1 h-auto text-sm" onClick={(e) => { e.stopPropagation(); removeCombatant(c.id); }}><Skull className="mr-2 h-4 w-4" /> Dead (Remove)</Button> ) : ( <div className="flex items-center gap-1.5 pt-1"> <Input type="number" placeholder="Amt" className="h-8 text-sm w-20 px-2 py-1" value={damageInputs[c.id] || ""} onChange={(e) => handleDamageInputChange(c.id, e.target.value)} onClick={(e) => e.stopPropagation()} min="1" /> <Button size="sm" variant="destructive" className="px-2 py-1 h-8 text-xs" onClick={(e) => { e.stopPropagation(); handleApplyDamage(c.id, 'damage'); }}>Hit</Button> <Button size="sm" variant="outline" className="px-2 py-1 h-8 text-xs border-green-600 text-green-600 hover:bg-green-500/10 hover:text-green-700" onClick={(e) => { e.stopPropagation(); handleApplyDamage(c.id, 'heal'); }}>Heal</Button> </div> )} </> )}
                            </li>
                        ))}
                        </ul>
                    </ScrollArea>
                </div>
                 {combatants.length > 0 && (
                    <div className="p-4 space-y-2 border-t">
                        <div className="flex gap-2">
                            <Button onClick={prevTurn} variant="outline" className="flex-1"><ArrowLeft className="mr-2 h-4 w-4"/>Prev</Button>
                            <Button onClick={nextTurn} className="flex-1 bg-primary hover:bg-primary/90"><ArrowRight className="mr-2 h-4 w-4"/>Next Turn</Button>
                        </div>
                        <Button onClick={endCombat} variant="destructive" className="w-full"><XCircle className="mr-2 h-4 w-4"/>End Combat</Button>
                    </div>
                )}
            </TabsContent>
            <SheetFooter className="mt-auto p-4 border-t">
                {/* Shared footer for combined drawer if needed */}
            </SheetFooter>
          </Tabs>
        </div>
        <button onClick={() => onOpenChange(false)} className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]" aria-label="Close Tools Drawer">
          <ChevronRight className="h-6 w-6" />
        </button>
      </SheetContent>
    </Sheet>

    {/* Dialogs for Combat Tracker */}
    <UIDialog open={isAddFriendlyDialogOpen} onOpenChange={setIsAddFriendlyDialogOpen}>
      <UIDialogContent>
        <UIDialogHeader><UIDialogTitle>{isAllyMode ? "Add Ally" : "Add Player"}</UIDialogTitle><UIDialogDescription>{isAllyMode ? "Enter name & initiative." : "Select player & enter/roll initiative."}</UIDialogDescription></UIDialogHeader>
        <div className="py-4 space-y-3">
          {isAllyMode ? ( <div><Label htmlFor="ally-name">Ally Name</Label><Input id="ally-name" value={allyNameInput} onChange={(e) => setAllyNameInput(e.target.value)} placeholder="e.g., Sir Reginald" /></div> ) : ( <div><Label htmlFor="player-select">Player Character</Label>{availablePartyMembers.length > 0 ? ( <select id="player-select" value={selectedPlayerToAdd?.id || ""} onChange={(e) => setSelectedPlayerToAdd(activeCampaignParty.find(p => p.id === e.target.value) || null)} className="w-full mt-1 p-2 border rounded-md bg-background"><option value="" disabled>Select a player</option>{availablePartyMembers.map(p => (<option key={p.id} value={p.id}>{p.name} - {p.race} {p.class}</option>))}</select> ) : (<p className="text-sm text-muted-foreground mt-1">All party members added.</p>)}</div> )}
          <div><Label htmlFor="friendly-initiative">Initiative</Label><div className="flex gap-2 items-center"><Input id="friendly-initiative" type="number" value={friendlyInitiativeInput} onChange={(e) => setFriendlyInitiativeInput(e.target.value)} placeholder="e.g., 15" className="flex-grow" />{(!isAllyMode && selectedPlayerToAdd) && (<Button onClick={handleRollFriendlyInitiative} variant="outline" size="sm" className="shrink-0"><Dice5 className="mr-1 h-4 w-4"/> Roll (d20 +{selectedPlayerToAdd.initiativeModifier || 0})</Button>)}{isAllyMode && (<Button onClick={handleRollFriendlyInitiative} variant="outline" size="sm" className="shrink-0"><Dice5 className="mr-1 h-4 w-4"/> Roll (d20)</Button>)}</div></div>
        </div>
        <UIDialogFooter><Button variant="outline" onClick={() => {setIsAddFriendlyDialogOpen(false); setSelectedPlayerToAdd(null); setAllyNameInput(""); setFriendlyInitiativeInput("");}}>Cancel</Button><Button onClick={handleAddFriendly} disabled={(!isAllyMode && !selectedPlayerToAdd) || (isAllyMode && !allyNameInput.trim())}>{isAllyMode ? "Add Ally" : "Add Player"}</Button></UIDialogFooter>
      </UIDialogContent>
    </UIDialog>
    <UIDialog open={isAddEnemyDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) {setRollEnemyInitiativeFlag(false); setRollGroupInitiativeFlag(false);} setIsAddEnemyDialogOpen(isOpen);}}>
      <UIDialogContent>
        <UIDialogHeader><UIDialogTitle>Add Enemy</UIDialogTitle><UIDialogDescription>Enter details. Add multiple & roll initiative.</UIDialogDescription></UIDialogHeader>
        <div className="py-4 space-y-3">
          <div><Label htmlFor="enemy-name">Enemy Name</Label><Input id="enemy-name" value={enemyName} onChange={(e) => setEnemyName(e.target.value)} placeholder="e.g., Goblin" /></div>
          <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="enemy-ac">AC (Optional)</Label><Input id="enemy-ac" type="number" value={enemyAC} onChange={(e) => setEnemyAC(e.target.value)} placeholder="e.g., 13" /></div><div><Label htmlFor="enemy-hp">HP (Optional)</Label><Input id="enemy-hp" type="number" value={enemyHP} onChange={(e) => setEnemyHP(e.target.value)} placeholder="e.g., 7" /></div></div>
          <div><Label htmlFor="enemy-quantity">Quantity</Label><Input id="enemy-quantity" type="number" value={enemyQuantityInput} onChange={(e) => setEnemyQuantityInput(e.target.value)} placeholder="1" min="1" /></div>
          <div className="flex items-center space-x-2 pt-2"><Switch id="roll-group-initiative" checked={rollGroupInitiativeFlag} onCheckedChange={setRollGroupInitiativeFlag} /><Label htmlFor="roll-group-initiative" className="cursor-pointer">Roll initiative as a group?</Label></div>
          <div className="flex items-center space-x-2 pt-1"><Switch id="roll-enemy-initiative" checked={rollEnemyInitiativeFlag} onCheckedChange={setRollEnemyInitiativeFlag} /><Label htmlFor="roll-enemy-initiative" className="cursor-pointer">{rollGroupInitiativeFlag ? "Roll for Group?" : "Roll for each Enemy?"}</Label></div>
          <div><Label htmlFor="enemy-initiative-input">{rollEnemyInitiativeFlag ? "Initiative Modifier (e.g., +2 or -1)" : "Fixed Initiative Value"}{rollGroupInitiativeFlag ? " (for group)" : ""}</Label><Input id="enemy-initiative-input" value={enemyInitiativeInput} onChange={(e) => setEnemyInitiativeInput(e.target.value)} placeholder={rollEnemyInitiativeFlag ? "e.g., 2 or -1" : "e.g., 12"} type={rollEnemyInitiativeFlag ? "text" : "number"} /></div>
        </div>
        <UIDialogFooter><Button variant="outline" onClick={() => {setIsAddEnemyDialogOpen(false); setEnemyName(""); setEnemyInitiativeInput(""); setEnemyQuantityInput("1"); setRollEnemyInitiativeFlag(false); setRollGroupInitiativeFlag(false); setEnemyAC(""); setEnemyHP("");}}>Cancel</Button><Button onClick={handleAddEnemy} disabled={!enemyName.trim()}>Add Enemy</Button></UIDialogFooter>
      </UIDialogContent>
    </UIDialog>
    </>
  );
}

