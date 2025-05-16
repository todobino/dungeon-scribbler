
"use client";

import { useState, useEffect, useId, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"; // Added SheetHeader, SheetTitle
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle, DialogDescription as UIDialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"; // Renamed Dialog sub-components to avoid conflict
import { Dice5, Zap, Trash2, ChevronRight, PlusCircle, UserPlus, ShieldAlert, Users, ArrowRight, ArrowLeft, XCircle, Heart, Shield, Skull, Loader2, Swords, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseDiceNotation, rollMultipleDice, rollDie } from "@/lib/dice-utils";
import type { PlayerCharacter, Combatant, RollLogEntry, SavedEncounter, EncounterMonster, FavoriteMonster } from "@/lib/types";
import { useCampaign } from "@/contexts/campaign-context";
import { DICE_ROLLER_TAB_ID, COMBAT_TRACKER_TAB_ID, SAVED_ENCOUNTERS_STORAGE_KEY_PREFIX, MONSTER_MASH_FAVORITES_STORAGE_KEY } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCRDisplay } from "@/components/features/monster-mash/MonsterMashDrawer"; 
import { useToast } from "@/hooks/use-toast";


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
  const { activeCampaign, activeCampaignParty } = useCampaign();
  const { toast } = useToast();

  // Dice Roller State
  const [inputValue, setInputValue] = useState("");
  const [rollMode, setRollMode] = useState<RollMode>("normal");
  const diceUniqueId = useId();

  // Combat Tracker State
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number | null>(null);
  const combatUniqueId = useId(); 
  
  const [damageInputs, setDamageInputs] = useState<Record<string, string>>({});
  const combatantRefs = useRef<Map<string, HTMLLIElement | null>>(new Map());

  const [activeTab, setActiveTab] = useState(defaultTab);
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, open]);

  // State for inline forms in Combat Tracker
  const [showAddFriendlySection, setShowAddFriendlySection] = useState(false);
  const [showAddEnemySection, setShowAddEnemySection] = useState(false);

  // State moved from AddFriendlyDrawer
  const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState<PlayerCharacter | null>(null);
  const [allyNameInput, setAllyNameInput] = useState<string>("");
  const [friendlyInitiativeInput, setFriendlyInitiativeInput] = useState<string>("");

  // State moved from AddEnemyDrawer
  const [activeAddEnemyTab, setActiveAddEnemyTab] = useState("single-enemy");
  const [enemyName, setEnemyName] = useState("");
  const [enemyInitiativeInput, setEnemyInitiativeInput] = useState<string>("");
  const [enemyQuantityInput, setEnemyQuantityInput] = useState<string>("1");
  const [rollEnemyInitiativeFlag, setRollEnemyInitiativeFlag] = useState<boolean>(false);
  const [rollGroupInitiativeFlag, setRollGroupInitiativeFlag] = useState<boolean>(false);
  const [enemyAC, setEnemyAC] = useState<string>("");
  const [enemyHP, setEnemyHP] = useState<string>("");
  const [isFavoriteMonsterDialogOpen, setIsFavoriteMonsterDialogOpen] = useState(false);
  const [favoritesList, setFavoritesList] = useState<FavoriteMonster[]>([]);
  const [savedEncountersForCombat, setSavedEncountersForCombat] = useState<SavedEncounter[]>([]);
  const [selectedSavedEncounterId, setSelectedSavedEncounterId] = useState<string | undefined>(undefined);
  const [isLoadingSavedEncounters, setIsLoadingSavedEncounters] = useState(false);


  // --- Dice Roller Logic ---
  const handleDiceRoll = () => {
    const notationToParse = inputValue.trim() === "" ? "1d20" : inputValue.trim();
    const parsed = parseDiceNotation(notationToParse);
    const entryId = getNewRollId();

    if (parsed.error) {
      const errorEntryData: Omit<RollLogEntry, 'id'> = {
        inputText: notationToParse, resultText: "Error", detailText: parsed.error, isRolling: false,
      };
      onInternalRoll(errorEntryData, entryId); 
      return;
    }
    if (parsed.sides <= 0 || parsed.count <= 0) {
      const errorEntryData: Omit<RollLogEntry, 'id'> = {
        inputText: notationToParse, resultText: "Error", detailText: "Dice sides and count must be positive.", isRolling: false,
      };
      onInternalRoll(errorEntryData, entryId); 
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
      setShowAddFriendlySection(false);
      setShowAddEnemySection(false);
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
      id: `${combatUniqueId}-player-${player.id}-${Date.now()}`, name: player.name, initiative: rollDie(20) + (player.initiativeModifier || 0), type: 'player', color: player.color, playerId: player.id, ac: player.armorClass
    }));
    setCombatants(prev => [...prev, ...newCombatantsFromParty]);
    if (currentTurnIndex === null && (combatants.length === 0 && newCombatantsFromParty.length > 0)) setCurrentTurnIndex(0);
  };

  // --- Add Friendly Logic ---
  const handleSaveFriendly = () => {
    const initiativeValue = parseInt(friendlyInitiativeInput);
    if (isNaN(initiativeValue) || friendlyInitiativeInput.trim() === "") return;

    let name: string, playerId: string | undefined, color: string | undefined;
    let ac: number | undefined;
    let initiativeModifier: number | undefined;

    const isAllyMode = availablePartyMembers.length === 0;

    if (isAllyMode) {
      if (!allyNameInput.trim()) return;
      name = allyNameInput.trim();
    } else {
      if (!selectedPlayerToAdd) return;
      name = selectedPlayerToAdd.name;
      playerId = selectedPlayerToAdd.id;
      color = selectedPlayerToAdd.color;
      ac = selectedPlayerToAdd.armorClass;
      initiativeModifier = selectedPlayerToAdd.initiativeModifier;
    }

    const newCombatant: Combatant = {
      id: `${combatUniqueId}-${isAllyMode ? 'ally' : 'player'}-${playerId || name.replace(/\s+/g, '')}-${Date.now()}`,
      name,
      initiative: initiativeValue,
      type: 'player',
      color,
      playerId,
      ac,
      initiativeModifier
    };
    setCombatants(prev => [...prev, newCombatant]);
    if (currentTurnIndex === null && (combatants.length === 0 || [newCombatant].length > 0)) setCurrentTurnIndex(0);
    
    setSelectedPlayerToAdd(null);
    setAllyNameInput("");
    setFriendlyInitiativeInput("");
    setShowAddFriendlySection(false); 
  };

  const handleRollFriendlyInitiative = () => {
    const isAllyMode = availablePartyMembers.length === 0;
    let mod = 0;
    if (!isAllyMode && selectedPlayerToAdd) {
      mod = selectedPlayerToAdd.initiativeModifier || 0;
    }
    setFriendlyInitiativeInput((rollDie(20) + mod).toString());
  };

  // --- Add Enemy Logic ---
  useEffect(() => { 
    if (showAddEnemySection && activeCampaign && activeAddEnemyTab === "load-encounter" && savedEncountersForCombat.length === 0) {
      setIsLoadingSavedEncounters(true);
      try {
        const storageKey = `${SAVED_ENCOUNTERS_STORAGE_KEY_PREFIX}${activeCampaign.id}`;
        const storedEncounters = localStorage.getItem(storageKey);
        setSavedEncountersForCombat(storedEncounters ? JSON.parse(storedEncounters) : []);
      } catch (error) {
        console.error("Error loading saved encounters for combat tracker:", error);
        setSavedEncountersForCombat([]);
      }
      setIsLoadingSavedEncounters(false);
    }
  }, [showAddEnemySection, activeCampaign, activeAddEnemyTab, savedEncountersForCombat.length]);

  useEffect(() => { 
    if (isFavoriteMonsterDialogOpen) {
      try {
        const storedFavorites = localStorage.getItem(MONSTER_MASH_FAVORITES_STORAGE_KEY);
        setFavoritesList(storedFavorites ? JSON.parse(storedFavorites) : []);
      } catch (error) {
        console.error("Error loading favorites for Add Enemy section:", error);
        setFavoritesList([]);
      }
    }
  }, [isFavoriteMonsterDialogOpen]);

  const handleSelectFavoriteMonster = (fav: FavoriteMonster) => {
    setEnemyName(fav.name);
    setEnemyAC(fav.acValue !== undefined ? fav.acValue.toString() : "");
    setEnemyHP(fav.hpValue !== undefined ? fav.hpValue.toString() : "");
    setIsFavoriteMonsterDialogOpen(false);
    toast({title: "Favorite Selected", description: `${fav.name} details pre-filled where possible.`});
  };
  
  const parseModifierString = (modStr: string): number => {
    modStr = modStr.trim();
    if (modStr === "") return 0;
    const num = parseInt(modStr);
    return isNaN(num) ? 0 : num;
  };

  const handleAddSingleEnemyGroup = () => {
    if (!enemyName.trim()) return;
    const quantity = parseInt(enemyQuantityInput) || 1;
    if (quantity <= 0) return;

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
        id: `${combatUniqueId}-enemy-${Date.now()}-${i}`,
        name: currentEnemyName,
        initiative: initiativeValue,
        type: 'enemy',
        ac: acValue,
        hp: hpValue,
        currentHp: hpValue,
      });
    }
    setCombatants(prev => [...prev, ...newEnemies]);
    if (currentTurnIndex === null && (combatants.length === 0 || newEnemies.length > 0)) setCurrentTurnIndex(0);
    
    setEnemyName(""); setEnemyInitiativeInput(""); setEnemyQuantityInput("1");
    setRollEnemyInitiativeFlag(false); setRollGroupInitiativeFlag(false);
    setEnemyAC(""); setEnemyHP("");
    setShowAddEnemySection(false); 
  };

  const handleLoadSavedEncounterToCombat = () => {
    if (!selectedSavedEncounterId) return;
    const encounter = savedEncountersForCombat.find(e => e.id === selectedSavedEncounterId);
    if (!encounter) return;

    const newEnemiesFromEncounter: Combatant[] = [];
    encounter.monsters.forEach((monster: EncounterMonster, monsterIndex: number) => {
      for (let i = 0; i < monster.quantity; i++) {
        const combatantName = monster.quantity > 1 ? `${monster.name} ${i + 1}` : monster.name;
        const initiativeValue = rollDie(20);
        const acValue = monster.ac ? parseInt(monster.ac) : undefined;
        const hpValue = monster.hp ? parseInt(monster.hp) : undefined;

        newEnemiesFromEncounter.push({
          id: `${combatUniqueId}-enemy-${monster.name.replace(/\s+/g, '')}-${Date.now()}-${monsterIndex}-${i}`,
          name: combatantName,
          initiative: initiativeValue,
          type: 'enemy',
          ac: isNaN(acValue!) ? undefined : acValue,
          hp: isNaN(hpValue!) ? undefined : hpValue,
          currentHp: isNaN(hpValue!) ? undefined : hpValue,
        });
      }
    });
    setCombatants(prev => [...prev, ...newEnemiesFromEncounter]);
    if (currentTurnIndex === null && (combatants.length === 0 || newEnemiesFromEncounter.length > 0)) setCurrentTurnIndex(0);
    
    setSelectedSavedEncounterId(undefined);
    setShowAddEnemySection(false); 
  };

  const selectedEncounterDetails = selectedSavedEncounterId ? savedEncountersForCombat.find(e => e.id === selectedSavedEncounterId) : null;


  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:w-[500px] flex flex-col p-0" hideCloseButton={true}>
        <SheetHeader className="sr-only">
          <SheetTitle>DM Tools</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full pr-8"> 
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
                          <Button onClick={() => { setShowAddFriendlySection(p => !p); setShowAddEnemySection(false); }} variant="outline" className="flex-1">
                              {availablePartyMembers.length === 0 ? <UserPlus className="mr-2 h-4 w-4" /> : <Users className="mr-2 h-4 w-4" />}
                              {addPlayerButtonLabel}
                          </Button>
                          <Button onClick={() => { setShowAddEnemySection(p => !p); setShowAddFriendlySection(false); }} variant="outline" className="flex-1">
                              <ShieldAlert className="mr-2 h-4 w-4" /> Add Enemy
                          </Button>
                      </div>
                      {availablePartyMembers.length > 0 && (
                          <Button onClick={handleRollAllPlayerInitiatives} variant="outline" className="w-full">
                              <Dice5 className="mr-2 h-4 w-4"/> Roll All Player Initiatives
                          </Button>
                      )}
                  </div>

                  {/* Inline Add Friendly Section */}
                  {showAddFriendlySection && (
                    <div className="p-4 space-y-3 border-b bg-card">
                      <h3 className="text-lg font-semibold">Add Friendly Combatant</h3>
                      {availablePartyMembers.length > 0 ? (
                        <div>
                          <Label htmlFor="player-select-inline">Player Character</Label>
                          <Select value={selectedPlayerToAdd?.id || ""} onValueChange={(value) => setSelectedPlayerToAdd(activeCampaignParty.find((p) => p.id === value) || null)}>
                            <SelectTrigger id="player-select-inline" className="mt-1"><SelectValue placeholder="Select a player" /></SelectTrigger>
                            <SelectContent>
                              {availablePartyMembers.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name} - {p.race} {p.class}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div>
                          <Label htmlFor="ally-name-inline">Ally Name</Label>
                          <Input id="ally-name-inline" value={allyNameInput} onChange={(e) => setAllyNameInput(e.target.value)} placeholder="e.g., Sir Reginald" />
                        </div>
                      )}
                       <div>
                        <Label htmlFor="friendly-initiative-inline">Initiative</Label>
                        <div className="flex gap-2 items-center">
                          <Input id="friendly-initiative-inline" type="number" value={friendlyInitiativeInput} onChange={(e) => setFriendlyInitiativeInput(e.target.value)} placeholder="e.g., 15" className="flex-grow" />
                          {(availablePartyMembers.length === 0 || selectedPlayerToAdd) && (
                            <Button onClick={handleRollFriendlyInitiative} variant="outline" size="sm" className="shrink-0">
                              <Dice5 className="mr-1 h-4 w-4"/> Roll (d20{(! (availablePartyMembers.length === 0) && selectedPlayerToAdd && selectedPlayerToAdd.initiativeModifier) ? `${selectedPlayerToAdd.initiativeModifier >= 0 ? '+' : ''}${selectedPlayerToAdd.initiativeModifier}` : ''})
                            </Button>
                          )}
                        </div>
                      </div>
                      <Button onClick={handleSaveFriendly} disabled={(!(availablePartyMembers.length === 0) && !selectedPlayerToAdd) || ((availablePartyMembers.length === 0) && !allyNameInput.trim()) || !friendlyInitiativeInput.trim()} className="w-full">Add to Combat</Button>
                    </div>
                  )}

                  {/* Inline Add Enemy Section */}
                  {showAddEnemySection && (
                    <div className="p-4 border-b bg-card">
                      <UIDialogHeader className="bg-primary text-primary-foreground p-4 rounded-t-md -mx-4 -mt-4 mb-4">
                        <UIDialogTitle className="text-primary-foreground flex items-center"><ShieldAlert className="mr-2 h-5 w-5"/>Add Enemies</UIDialogTitle>
                        <UIDialogDescription className="text-primary-foreground/80">Add individual enemies or load a pre-saved encounter.</UIDialogDescription>
                      </UIDialogHeader>
                      <Tabs value={activeAddEnemyTab} onValueChange={setActiveAddEnemyTab} className="pt-2 flex flex-col flex-grow min-h-0">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="single-enemy">Single Enemy/Group</TabsTrigger>
                          <TabsTrigger value="load-encounter" disabled={!activeCampaign}>Load Encounter</TabsTrigger>
                        </TabsList>
                        <TabsContent value="single-enemy" className="space-y-3 pt-3 flex-grow flex flex-col">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="enemy-name-inline">Enemy Name</Label>
                            <Button variant="ghost" size="icon" onClick={() => setIsFavoriteMonsterDialogOpen(true)} className="h-7 w-7">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            </Button>
                          </div>
                          <Input id="enemy-name-inline" value={enemyName} onChange={(e) => setEnemyName(e.target.value)} placeholder="e.g., Goblin" />
                          <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="enemy-ac-inline">AC (Optional)</Label><Input id="enemy-ac-inline" type="number" value={enemyAC} onChange={(e) => setEnemyAC(e.target.value)} placeholder="e.g., 13" /></div><div><Label htmlFor="enemy-hp-inline">HP (Optional)</Label><Input id="enemy-hp-inline" type="number" value={enemyHP} onChange={(e) => setEnemyHP(e.target.value)} placeholder="e.g., 7" /></div></div>
                          <div><Label htmlFor="enemy-quantity-inline">Quantity</Label><Input id="enemy-quantity-inline" type="number" value={enemyQuantityInput} onChange={(e) => setEnemyQuantityInput(e.target.value)} placeholder="1" min="1" /></div>
                          <div className="flex items-center space-x-2 pt-2"><Switch id="roll-group-initiative-inline" checked={rollGroupInitiativeFlag} onCheckedChange={setRollGroupInitiativeFlag} /><Label htmlFor="roll-group-initiative-inline" className="cursor-pointer">Roll initiative as a group?</Label></div>
                          <div className="flex items-center space-x-2 pt-1"><Switch id="roll-enemy-initiative-inline" checked={rollEnemyInitiativeFlag} onCheckedChange={setRollEnemyInitiativeFlag} /><Label htmlFor="roll-enemy-initiative-inline" className="cursor-pointer">{rollGroupInitiativeFlag ? "Roll for Group?" : "Roll for each Enemy?"}</Label></div>
                          <div><Label htmlFor="enemy-initiative-input-inline">{rollEnemyInitiativeFlag ? "Initiative Modifier (e.g., +2 or -1)" : "Fixed Initiative Value"}{rollGroupInitiativeFlag ? " (for group)" : ""}</Label><Input id="enemy-initiative-input-inline" value={enemyInitiativeInput} onChange={(e) => setEnemyInitiativeInput(e.target.value)} placeholder={rollEnemyInitiativeFlag ? "e.g., 2 or -1" : "e.g., 12"} type={rollEnemyInitiativeFlag ? "text" : "number"} /></div>
                          <div className="mt-auto pt-4">
                            <Button onClick={handleAddSingleEnemyGroup} disabled={!enemyName.trim() || (rollEnemyInitiativeFlag ? false : !enemyInitiativeInput.trim())} className="w-full">Add to Combat</Button>
                          </div>
                        </TabsContent>
                        <TabsContent value="load-encounter" className="space-y-3 pt-3 flex-grow flex flex-col">
                          {isLoadingSavedEncounters ? (
                            <div className="flex items-center justify-center h-32 flex-grow"><Loader2 className="h-6 w-6 animate-spin" /></div>
                          ) : savedEncountersForCombat.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4 flex-grow">No saved encounters found for this campaign.</p>
                          ) : (
                            <>
                              <div>
                                <Label htmlFor="saved-encounter-select-inline">Select Saved Encounter</Label>
                                <Select value={selectedSavedEncounterId} onValueChange={setSelectedSavedEncounterId}>
                                  <SelectTrigger id="saved-encounter-select-inline" className="mt-1"><SelectValue placeholder="Choose an encounter..." /></SelectTrigger>
                                  <SelectContent>
                                    {savedEncountersForCombat.map(enc => (<SelectItem key={enc.id} value={enc.id}>{enc.title}</SelectItem>))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {selectedEncounterDetails && (
                                <div className="mt-2 flex-grow flex flex-col">
                                  <Label className="font-medium">Monsters in "{selectedEncounterDetails.title}":</Label>
                                  <ScrollArea className="h-32 mt-1 border rounded-md p-2 bg-muted/30 flex-grow">
                                    <ul className="text-sm space-y-1">
                                      {selectedEncounterDetails.monsters.map(monster => (
                                        <li key={monster.id}>
                                          {monster.name} (x{monster.quantity})
                                          <span className="text-xs text-muted-foreground ml-1">
                                            {monster.cr && `CR:${monster.cr} `}{monster.ac && `AC:${monster.ac} `}{monster.hp && `HP:${monster.hp}`}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </ScrollArea>
                                </div>
                              )}
                              <div className="mt-auto pt-4">
                                <Button onClick={handleLoadSavedEncounterToCombat} disabled={!selectedSavedEncounterId} className="w-full">Add Encounter to Combat</Button>
                              </div>
                            </>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}


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

    {/* Favorite Monster Dialog (used by inline Add Enemy section) */}
    <Dialog open={isFavoriteMonsterDialogOpen} onOpenChange={setIsFavoriteMonsterDialogOpen}>
      <DialogContent className="max-w-md">
        <UIDialogHeader>
          <UIDialogTitle>Select Favorite Monster</UIDialogTitle>
          <UIDialogDescription>Choose from your Monster Mash favorites.</UIDialogDescription>
        </UIDialogHeader>
        <ScrollArea className="h-[calc(100%-80px)] mt-4 max-h-[60vh]">
            {favoritesList.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No favorites found.</p>
            ) : (
                <ul className="space-y-2">
                    {favoritesList.map(fav => (
                    <li key={fav.index}>
                        <Button variant="outline" className="w-full justify-start" onClick={() => handleSelectFavoriteMonster(fav)}>
                        {fav.name} (CR: {formatCRDisplay(fav.cr)})
                        </Button>
                    </li>
                    ))}
                </ul>
            )}
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
