
"use client";

import { useState, useEffect, useId, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Dice5, Zap, Trash2, ChevronRight, ListOrdered, PlusCircle, UserPlus, ShieldAlert, Users, ArrowRight, ArrowLeft, XCircle, Heart, Shield, Skull, Loader2, Swords, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseDiceNotation, rollMultipleDice, rollDie } from "@/lib/dice-utils";
import type { PlayerCharacter, Combatant, RollLogEntry, SavedEncounter, EncounterMonster } from "@/lib/types";
import { useCampaign } from "@/contexts/campaign-context";
import { DICE_ROLLER_TAB_ID, COMBAT_TRACKER_TAB_ID, SAVED_ENCOUNTERS_STORAGE_KEY_PREFIX } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddFriendlyDrawer } from "@/components/features/combat-tracker/AddFriendlyDrawer";
import { AddEnemyDrawer } from "@/components/features/combat-tracker/AddEnemyDrawer";


interface CombinedToolDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab: string;
  rollLog: RollLogEntry[];
  onInternalRoll: (rollData: Omit<RollLogEntry, 'id' | 'isRolling'> & {isRolling?: boolean}, idToUpdate?: string) => void;
  getNewRollId: () => string;
  onClearRollLog: () => void;
}

type RollMode = "normal" | "advantage" | "disadvantage";


export function CombinedToolDrawer({
  open,
  onOpenChange,
  defaultTab,
  rollLog,
  onInternalRoll,
  getNewRollId,
  onClearRollLog
}: CombinedToolDrawerProps) {
  // Dice Roller State
  const [inputValue, setInputValue] = useState("");
  const [rollMode, setRollMode] = useState<RollMode>("normal");
  const diceUniqueId = useId();

  // Combat Tracker State
  const { activeCampaign, activeCampaignParty } = useCampaign();
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number | null>(null);
  const combatUniqueId = useId(); // Keep this for generating combatant IDs

  const [isAddFriendlyDrawerOpen, setIsAddFriendlyDrawerOpen] = useState(false);
  const [isAddEnemyDrawerOpen, setIsAddEnemyDrawerOpen] = useState(false);
  
  const [damageInputs, setDamageInputs] = useState<Record<string, string>>({});
  const combatantRefs = useRef<Map<string, HTMLLIElement | null>>(new Map());

  const [activeTab, setActiveTab] = useState(defaultTab);
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, open]);


  // --- Dice Roller Logic ---
  const handleDiceRoll = () => {
    const notationToParse = inputValue.trim() === "" ? "1d20" : inputValue.trim();
    const parsed = parseDiceNotation(notationToParse);
    const entryId = getNewRollId();

    if (parsed.error) {
      const errorEntryData: Omit<RollLogEntry, 'id'> = {
        inputText: notationToParse, resultText: "Error", detailText: parsed.error, isRolling: false,
      };
      onInternalRoll(errorEntryData);
      return;
    }
    if (parsed.sides <= 0 || parsed.count <= 0) {
      const errorEntryData: Omit<RollLogEntry, 'id'> = {
        inputText: notationToParse, resultText: "Error", detailText: "Dice sides and count must be positive.", isRolling: false,
      };
      onInternalRoll(errorEntryData);
      return;
    }

    const placeholderEntryData: Omit<RollLogEntry, 'id'> = {
      inputText: notationToParse, resultText: "...", detailText: "Rolling...",
      isAdvantage: rollMode === "advantage", isDisadvantage: rollMode === "disadvantage", isRolling: true,
    };
    onInternalRoll(placeholderEntryData, entryId);

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
      const finalLogEntryData: Omit<RollLogEntry, 'id' | 'isRolling'> = {
        inputText: notationToParse, resultText: finalResult.toString(), detailText,
        isAdvantage: rollMode === "advantage", isDisadvantage: rollMode === "disadvantage",
        rolls: resultRolls, chosenRoll: chosen, discardedRoll: discarded, modifier: parsed.modifier, sides: parsed.sides,
      };
      onInternalRoll(finalLogEntryData, entryId);
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

  const handleAddFriendlyFromDrawer = (newCombatant: Combatant) => {
    setCombatants(prev => [...prev, newCombatant]);
    if (currentTurnIndex === null && (combatants.length === 0 || [newCombatant].length > 0)) setCurrentTurnIndex(0);
    setIsAddFriendlyDrawerOpen(false);
  };

  const handleAddEnemiesFromDrawer = (newEnemies: Combatant[]) => {
    setCombatants(prev => [...prev, ...newEnemies]);
    if (currentTurnIndex === null && (combatants.length === 0 || newEnemies.length > 0)) setCurrentTurnIndex(0);
    setIsAddEnemyDrawerOpen(false);
  };
  
  const availablePartyMembers = activeCampaignParty.filter(p => !combatants.some(c => c.playerId === p.id));
  const addPlayerButtonLabel = availablePartyMembers.length > 0 ? "Add Player" : "Add Ally";

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


  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:w-[500px] flex flex-col p-0" hideCloseButton={true}>
        <div className="flex flex-col h-full pr-8"> 
          <SheetHeader className="sr-only bg-primary text-primary-foreground p-4 rounded-t-md">
            <SheetTitle className="text-primary-foreground sr-only">DM Tools</SheetTitle>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow min-h-0">
            <div className="p-4 border-b shrink-0 bg-primary text-primary-foreground">
              <TabsList className="grid w-full grid-cols-2 bg-primary text-primary-foreground">
                <TabsTrigger
                    value={DICE_ROLLER_TAB_ID}
                    className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=inactive]:text-primary-foreground/80 data-[state=inactive]:hover:text-primary-foreground"
                >
                    <Dice5 className="h-4 w-4"/>Dice Roller
                </TabsTrigger>
                <TabsTrigger
                    value={COMBAT_TRACKER_TAB_ID}
                    className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=inactive]:text-primary-foreground/80 data-[state=inactive]:hover:text-primary-foreground"
                >
                    <Swords className="h-4 w-4"/>Combat Tracker
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-grow overflow-auto">
              <TabsContent value={DICE_ROLLER_TAB_ID} className="data-[state=active]:flex flex-col h-full">
                <div className="p-4 space-y-4 flex-grow flex flex-col">
                  <div>
                    <Label htmlFor="dice-notation">Dice Notation</Label>
                    <Input id="dice-notation" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="e.g., 2d6+3, d20" />
                  </div>
                  <div>
                    <Label>Roll Mode</Label>
                    <RadioGroup defaultValue="normal" value={rollMode} onValueChange={(value: string) => setRollMode(value as RollMode)} className="flex space-x-2 pt-1">
                      <div className="flex items-center space-x-1"><RadioGroupItem value="normal" id={`${diceUniqueId}-mode-normal`} /><Label htmlFor={`${diceUniqueId}-mode-normal`} className="font-normal cursor-pointer">Normal</Label></div>
                      <div className="flex items-center space-x-1"><RadioGroupItem value="advantage" id={`${diceUniqueId}-mode-advantage`} /><Label htmlFor={`${diceUniqueId}-mode-advantage`} className="font-normal cursor-pointer">Advantage</Label></div>
                      <div className="flex items-center space-x-1"><RadioGroupItem value="disadvantage" id={`${diceUniqueId}-mode-disadvantage`} /><Label htmlFor={`${diceUniqueId}-mode-disadvantage`} className="font-normal cursor-pointer">Disadvantage</Label></div>
                    </RadioGroup>
                  </div>
                  <Button onClick={handleDiceRoll} className={cn("w-full", rollMode === "advantage" && "border-2 border-green-500 hover:border-green-600", rollMode === "disadvantage" && "border-2 border-red-500 hover:border-red-600")}>
                     {inputValue.trim() === "" ? <Dice5 className="mr-2 h-5 w-5" /> : <Zap className="mr-2 h-5 w-5" />}
                    {inputValue.trim() === "" ? "Roll d20" : "Roll"}
                  </Button>
                  <div className="flex-grow flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-1"><Label>Roll Log</Label><Button variant="ghost" size="sm" onClick={onClearRollLog} className="text-xs text-muted-foreground hover:text-foreground"><Trash2 className="mr-1 h-3 w-3" /> Clear Log</Button></div>
                    <ScrollArea className="border rounded-md p-2 flex-grow bg-muted/30 h-full">
                      {rollLog.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No rolls yet.</p>}
                      <div className="space-y-3">
                        {rollLog.map(entry => (
                          <div key={entry.id} className={cn("text-sm p-2 rounded-md bg-background shadow-sm transition-all", entry.isRolling ? "opacity-70" : "animate-in slide-in-from-top-2 fade-in duration-300")}>
                            {entry.isRolling ? (
                               <div className="flex items-center h-10">
                                 <Dice5 className="h-6 w-6 animate-spin text-primary" />
                                 <span className="ml-2 text-lg font-semibold text-primary">Rolling...</span>
                               </div>
                            ) : (
                              <>
                                <p className="text-2xl font-bold text-primary">{entry.resultText}</p>
                                <p className="text-xs text-muted-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: entry.detailText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value={COMBAT_TRACKER_TAB_ID} className="data-[state=active]:flex flex-col h-full">
                  <div className="p-4 flex flex-col gap-2 border-b shrink-0">
                      <div className="flex gap-2">
                          <Button onClick={() => setIsAddFriendlyDrawerOpen(true)} variant="outline" className="flex-1">
                              {availablePartyMembers.length === 0 ? <UserPlus className="mr-2 h-4 w-4" /> : <Users className="mr-2 h-4 w-4" />}
                              {addPlayerButtonLabel}
                          </Button>
                          <Button onClick={() => setIsAddEnemyDrawerOpen(true)} variant="outline" className="flex-1">
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
                                      {c.type === 'player' ? (availablePartyMembers.length === 0 && !c.playerId ? 'Ally' : 'Player') : 'Enemy'}
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
                      <div className="p-4 space-y-2 border-t shrink-0">
                          <div className="flex gap-2">
                              <Button onClick={prevTurn} variant="outline" className="flex-1"><ArrowLeft className="mr-2 h-4 w-4"/>Prev</Button>
                              <Button onClick={nextTurn} className="flex-1 bg-primary hover:bg-primary/90"><ArrowRight className="mr-2 h-4 w-4"/>Next Turn</Button>
                          </div>
                          <Button onClick={endCombat} variant="destructive" className="w-full"><XCircle className="mr-2 h-4 w-4"/>End Combat</Button>
                      </div>
                  )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]"
          aria-label="Close Tools Drawer"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </SheetContent>
    </Sheet>

    <AddFriendlyDrawer
        open={isAddFriendlyDrawerOpen}
        onOpenChange={setIsAddFriendlyDrawerOpen}
        onAddFriendly={handleAddFriendlyFromDrawer}
        activeCampaignParty={activeCampaignParty}
        combatants={combatants}
        combatUniqueId={combatUniqueId}
    />

    <AddEnemyDrawer
        open={isAddEnemyDrawerOpen}
        onOpenChange={setIsAddEnemyDrawerOpen}
        onAddEnemies={handleAddEnemiesFromDrawer}
        activeCampaign={activeCampaign}
        combatUniqueId={combatUniqueId}
    />
    </>
  );
}

    