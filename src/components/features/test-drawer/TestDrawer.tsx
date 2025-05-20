
"use client";

import React, { useState } from 'react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronRight, PanelLeftOpen, PanelLeftClose, UserPlus, Dice5, XCircle, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent as UIAlertDialogContent, AlertDialogDescription as UIAlertDialogDescription, AlertDialogHeader as UIAlertDialogHeader, AlertDialogTitle as UIAlertDialogTitle, AlertDialogFooter as UIAlertDialogFooter } from "@/components/ui/alert-dialog"; // Renamed to avoid conflict
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


import type { PlayerCharacter, Combatant, RollLogEntry, SavedEncounter, EncounterMonster, FavoriteMonster } from "@/lib/types";
import { useCampaign } from "@/contexts/campaign-context";
import { useToast } from "@/hooks/use-toast";
import { SAVED_ENCOUNTERS_STORAGE_KEY_PREFIX, MONSTER_MASH_FAVORITES_STORAGE_KEY, DND5E_API_BASE_URL } from "@/lib/constants";
import { formatCRDisplay } from "@/components/features/monster-mash/MonsterMashDrawer";
import { parseDiceNotation, rollMultipleDice, rollDie } from "@/lib/dice-utils";


// Width definitions for the panels
const PRIMARY_PANEL_CONTENT_WIDTH_VAL = 380; // e.g., For Combat List
const SECONDARY_PANEL_CONTENT_WIDTH_VAL = 380; // e.g., For Dice Roller or Add Combatant UI
const CLOSE_BAR_WIDTH_VAL = 32; // 8 (w-8 for the bar) * 4 (px per tailwind unit) -> 32px

// Tailwind classes for the content width of each panel
const PRIMARY_PANEL_CLASS = `w-[${PRIMARY_PANEL_CONTENT_WIDTH_VAL}px]`;
const SECONDARY_PANEL_CLASS = `w-[${SECONDARY_PANEL_CONTENT_WIDTH_VAL}px]`;

// Tailwind classes for the SheetContent's overall content width (excluding close bar space)
const PRIMARY_SHEET_WIDTH_CLASS = `w-[${PRIMARY_PANEL_CONTENT_WIDTH_VAL + CLOSE_BAR_WIDTH_VAL}px]`;
const COMBINED_SHEET_WIDTH_CLASS = `w-[${PRIMARY_PANEL_CONTENT_WIDTH_VAL + SECONDARY_PANEL_CONTENT_WIDTH_VAL + CLOSE_BAR_WIDTH_VAL}px]`;

type SecondaryPanelMode = 'addCombatant' | 'diceRoller' | null;
type AddCombatantSubTab = 'partyMembers' | 'genericFriendly' | 'enemies';
type AddEnemySubTab = 'singleEnemy' | 'loadEncounter';
type RollMode = "normal" | "advantage" | "disadvantage";

interface CombatTrackerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  combatants: Combatant[];
  onAddCombatant: (combatant: Combatant) => void;
  onAddCombatants: (newCombatants: Combatant[]) => void;
  onRemoveCombatant: (combatantId: string) => void;
  onUpdateCombatant: (combatantId: string, updates: Partial<Combatant>) => void;
  onEndCombat: () => void;
  rollLog: RollLogEntry[];
  onInternalRoll: (rollData: Omit<RollLogEntry, 'id'>, idToUpdate?: string) => void;
  onClearRollLog: () => void;
}

export function CombatTrackerDrawer({ 
  open, 
  onOpenChange,
  combatants,
  onAddCombatant,
  onAddCombatants,
  onRemoveCombatant,
  onUpdateCombatant,
  onEndCombat,
  rollLog,
  onInternalRoll,
  onClearRollLog
}: CombatTrackerDrawerProps) {
  const [isSecondaryPanelVisible, setIsSecondaryPanelVisible] = useState(false);
  const [secondaryPanelMode, setSecondaryPanelMode] = useState<SecondaryPanelMode>(null);

  const { activeCampaign, savedEncountersUpdateKey } = useCampaign();
  const { toast } = useToast();
  const combatUniqueId = useId();

  // State for Dice Roller within secondary panel
  const [diceInputValue, setDiceInputValue] = useState("");
  const [diceRollMode, setDiceRollMode] = useState<RollMode>("normal");
  const diceUniqueId = useId();

  // State for Add Combatant within secondary panel
  const [addCombatantActiveTab, setAddCombatantActiveTab] = useState<AddCombatantSubTab>('partyMembers');
  const [manualPlayerInitiatives, setManualPlayerInitiatives] = useState<Record<string, string>>({});
  const [friendlyNameInput, setFriendlyNameInput] = useState<string>("");
  const [friendlyACInput, setFriendlyACInput] = useState<string>("");
  const [friendlyHPInput, setFriendlyHPInput] = useState<string>("");
  const [friendlyInitiativeInput, setFriendlyInitiativeInput] = useState<string>("");
  
  const [enemyName, setEnemyName] = useState("");
  const [enemyInitiativeInput, setEnemyInitiativeInput] = useState<string>("");
  const [enemyInitiativeModifierInput, setEnemyInitiativeModifierInput] = useState<string>("0");
  const [enemyQuantityInput, setEnemyQuantityInput] = useState<string>("1");
  const [rollGroupInitiativeFlag, setRollGroupInitiativeFlag] = useState<boolean>(false);
  const [enemyAC, setEnemyAC] = useState<string>("");
  const [enemyHP, setEnemyHP] = useState<string>("");
  const [enemyCR, setEnemyCR] = useState<string>(""); // For manual enemy CR input
  const [selectedFavoriteMonsterIndexForCombatAdd, setSelectedFavoriteMonsterIndexForCombatAdd] = useState<string | undefined>(undefined);
  
  const [isFavoriteMonsterDialogOpen, setIsFavoriteMonsterDialogOpen] = useState(false);
  const [favoritesList, setFavoritesList] = useState<FavoriteMonster[]>([]);
  const [savedEncountersForCombat, setSavedEncountersForCombat] = useState<SavedEncounter[]>([]);
  const [selectedSavedEncounterId, setSelectedSavedEncounterId] = useState<string | undefined>(undefined);
  const [isLoadingSavedEncounters, setIsLoadingSavedEncounters] = useState(false);
  const [addEnemyActiveSubTab, setAddEnemyActiveSubTab] = useState<AddEnemySubTab>("singleEnemy");

  // State for primary panel (Combat Tracker specific)
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number | null>(null);
  const [damageInputs, setDamageInputs] = useState<Record<string, string>>({});
  const [selectedCombatantId, setSelectedCombatantId] = useState<string | null>(null);
  const [combatantToDelete, setCombatantToDelete] = useState<Combatant | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const combatantRefs = useRef<Map<string, HTMLLIElement | null>>(new Map());

  // For Monster Detail Dialog in Primary Panel
  const [isMonsterDetailDialogOpen, setIsMonsterDetailDialogOpen] = useState(false);
  const [selectedMonsterForDetailDialog, setSelectedMonsterForDetailDialog] = useState<Combatant | null>(null);
  const [fullEnemyDetailsCache, setFullEnemyDetailsCache] = useState<Record<string, MonsterDetail>>({});
  const [isLoadingFullEnemyDetailsFor, setIsLoadingFullEnemyDetailsFor] = useState<string | null>(null);


  useEffect(() => {
    if (!open) {
      setIsSecondaryPanelVisible(false);
      setSecondaryPanelMode(null);
      // Reset Dice Roller states
      setDiceInputValue("");
      setDiceRollMode("normal");
      // Reset Add Combatant states
      setAddCombatantActiveTab("partyMembers");
      setManualPlayerInitiatives({});
      setFriendlyNameInput(""); setFriendlyACInput(""); setFriendlyHPInput(""); setFriendlyInitiativeInput("");
      setEnemyName(""); setEnemyAC(""); setEnemyHP(""); setEnemyCR(""); setEnemyInitiativeInput(""); setEnemyInitiativeModifierInput("0"); setEnemyQuantityInput("1"); setRollGroupInitiativeFlag(false);
      setSelectedFavoriteMonsterIndexForCombatAdd(undefined);
      setAddEnemyActiveSubTab("singleEnemy");
      setSelectedSavedEncounterId(undefined);
      // Reset primary panel states if needed, e.g., selected combatant for actions
      setSelectedCombatantId(null);
    }
  }, [open]);

  useEffect(() => {
    if (isSecondaryPanelVisible && secondaryPanelMode === 'addCombatant' && addCombatantActiveTab === 'enemies' && addEnemyActiveSubTab === "loadEncounter" && activeCampaign) {
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
  }, [isSecondaryPanelVisible, secondaryPanelMode, addCombatantActiveTab, addEnemyActiveSubTab, activeCampaign, savedEncountersUpdateKey]);

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
  
  useEffect(() => {
    if (currentTurnIndex !== null && combatants && combatants.length > 0 && combatants[currentTurnIndex]) {
        const activeCombatantId = combatants[currentTurnIndex]?.id;
        if (activeCombatantId) {
            const activeElement = combatantRefs.current.get(activeCombatantId);
            activeElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }
  }, [currentTurnIndex, combatants]);

  const enemyQuantityNum = parseInt(enemyQuantityInput) || 1;
  const isGroupSwitchDisabled = enemyQuantityNum <= 1;

  useEffect(() => {
    if (isGroupSwitchDisabled && rollGroupInitiativeFlag) {
      setRollGroupInitiativeFlag(false);
    }
  }, [isGroupSwitchDisabled, rollGroupInitiativeFlag]);


  const handleOpenSecondaryPanel = (mode: SecondaryPanelMode) => {
    if (isSecondaryPanelVisible && secondaryPanelMode === mode) {
      setIsSecondaryPanelVisible(false); // Close if already open and same mode
      setSecondaryPanelMode(null);
    } else {
      setSecondaryPanelMode(mode);
      setIsSecondaryPanelVisible(true);
    }
  };

  const handleCloseSecondaryPanel = () => {
    setIsSecondaryPanelVisible(false);
    setSecondaryPanelMode(null);
  };

  // --- Dice Roller Logic (to be used in secondary panel) ---
  const handleDiceRollSecondary = () => {
    const notationToParse = diceInputValue.trim() === "" ? "1d20" : diceInputValue.trim();
    const parsed = parseDiceNotation(notationToParse);
    const newRollId = `${diceUniqueId}-roll-${Date.now()}`;

    if (parsed.error) {
      onInternalRoll({ inputText: notationToParse, resultText: "Error", detailText: parsed.error }, newRollId);
      return;
    }
    if (parsed.sides <= 0 || parsed.count <= 0) {
      onInternalRoll({ inputText: notationToParse, resultText: "Error", detailText: "Dice sides and count must be positive." }, newRollId);
      return;
    }
    
    onInternalRoll({
      inputText: notationToParse,
      resultText: "...",
      detailText: <div className="flex items-center"><Dice5 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2 text-lg font-semibold text-primary">Rolling...</span></div> as unknown as string,
      isAdvantage: diceRollMode === "advantage",
      isDisadvantage: diceRollMode === "disadvantage",
      isRolling: true,
    }, newRollId);

    setTimeout(() => {
      let finalResult: number; let resultRolls: number[] = []; let detailText = ""; let chosen: number | undefined = undefined; let discarded: number | undefined = undefined;
      if (diceRollMode === "normal") {
        const { rolls, sum } = rollMultipleDice(parsed.count, parsed.sides); resultRolls = rolls; finalResult = sum + parsed.modifier;
        detailText = `Rolled ${parsed.count}d${parsed.sides}${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+" : "") + parsed.modifier : ""}: [${rolls.join(", ")}] ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+ " : "- ") + Math.abs(parsed.modifier) : ""} = ${finalResult}`;
      } else {
        if (parsed.count !== 1 || parsed.sides !== 20) {
            const { rolls, sum } = rollMultipleDice(parsed.count, parsed.sides); resultRolls = rolls; finalResult = sum + parsed.modifier;
            detailText = `Rolled ${parsed.count}d${parsed.sides}${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+" : "") + parsed.modifier : ""}: [${rolls.join(", ")}] ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+ " : "- ") + Math.abs(parsed.modifier) : ""} = ${finalResult} (Mode ignored for non-1d20)`;
        } else {
          const roll1Result = rollMultipleDice(1, 20); const roll2Result = rollMultipleDice(1, 20); const roll1 = roll1Result.sum; const roll2 = roll2Result.sum;
          if (diceRollMode === "advantage") { chosen = Math.max(roll1, roll2); discarded = Math.min(roll1, roll2); } else { chosen = Math.min(roll1, roll2); discarded = Math.max(roll1, roll2); }
          finalResult = chosen + parsed.modifier; resultRolls = [roll1, roll2];
          detailText = `Rolled 1d20 (${diceRollMode}) ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+" : "") + parsed.modifier : ""}: [${roll1 === chosen ? `**${roll1}**` : roll1}, ${roll2 === chosen ? `**${roll2}**` : roll2}] ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+ " : "- ") + Math.abs(parsed.modifier) : ""} = ${finalResult}`;
        }
      }
      onInternalRoll({ inputText: notationToParse, resultText: finalResult.toString(), detailText, isAdvantage: diceRollMode === "advantage", isDisadvantage: diceRollMode === "disadvantage", rolls: resultRolls, chosenRoll: chosen, discardedRoll: discarded, modifier: parsed.modifier, sides: parsed.sides }, newRollId);
    }, 500);
  };

  // --- Add Combatant Logic (to be used in secondary panel) ---
  const availablePartyMembers = activeCampaign?.activeParty ? activeCampaign.activeParty.filter(p => !combatants.some(c => c.playerId === p.id)) : [];

  const handleRollAllPlayerInitiatives = () => {
    if (!activeCampaign || !activeCampaign.activeParty) return;
    const playersToAdd: Combatant[] = [];
    availablePartyMembers.forEach(player => {
        const manualInit = manualPlayerInitiatives[player.id];
        let initiativeValue: number;
        if (manualInit && !isNaN(parseInt(manualInit))) { initiativeValue = parseInt(manualInit); } 
        else { initiativeValue = rollDie(20) + (player.initiativeModifier || 0); }
        playersToAdd.push({
            id: `${combatUniqueId}-player-${player.id}-${Date.now()}`, name: player.name, initiative: initiativeValue, type: 'player',
            color: player.color, playerId: player.id, ac: player.armorClass, hp: undefined, currentHp: undefined,
            initiativeModifier: player.initiativeModifier,
        });
    });
    if (playersToAdd.length > 0) { onAddCombatants(playersToAdd); }
    setManualPlayerInitiatives({});
    if (currentTurnIndex === null && combatants.length + playersToAdd.length > 0) { setCurrentTurnIndex(0); }
  };

  const handleSaveGenericFriendly = () => {
    const initiativeValue = parseInt(friendlyInitiativeInput);
    if (isNaN(initiativeValue) || friendlyInitiativeInput.trim() === "") { toast({ title: "Missing Initiative", variant: "destructive" }); return; }
    if (!friendlyNameInput.trim()) { toast({ title: "Missing Name", variant: "destructive" }); return; }
    const name = friendlyNameInput.trim();
    const ac = friendlyACInput.trim() === "" ? undefined : parseInt(friendlyACInput);
    const hp = friendlyHPInput.trim() === "" ? undefined : parseInt(friendlyHPInput);
    if(friendlyACInput.trim() !== "" && (isNaN(ac!) || ac! < 0)) { toast({ title: "Invalid AC", variant: "destructive" }); return; }
    if(friendlyHPInput.trim() !== "" && (isNaN(hp!) || hp! <=0 )) { toast({ title: "Invalid HP", variant: "destructive" }); return; }
    const newCombatant: Combatant = {
      id: `${combatUniqueId}-friendly-${name.replace(/\s+/g, '')}-${Date.now()}`, name, initiative: initiativeValue, type: 'player',
      ac, hp, currentHp: hp,
    };
    onAddCombatant(newCombatant);
    if (currentTurnIndex === null && combatants.length + 1 > 0) setCurrentTurnIndex(0);
    setFriendlyNameInput(""); setFriendlyInitiativeInput(""); setFriendlyACInput(""); setFriendlyHPInput("");
  };

  const handleRollGenericFriendlyInitiative = () => setFriendlyInitiativeInput((rollDie(20)).toString());

  const handleSelectFavoriteMonster = (fav: FavoriteMonster) => {
    setEnemyName(fav.name); setEnemyAC(fav.acValue !== undefined ? fav.acValue.toString() : ""); setEnemyHP(fav.hpValue !== undefined ? fav.hpValue.toString() : "");
    setEnemyCR(fav.cr !== undefined ? formatCRDisplay(fav.cr) : ""); setSelectedFavoriteMonsterIndexForCombatAdd(fav.index); setEnemyInitiativeModifierInput("0"); 
    setIsFavoriteMonsterDialogOpen(false);
  };

  const parseModifierString = (modStr: string): number => { const num = parseInt(modStr.trim()); return isNaN(num) ? 0 : num; };

  const handleAddSingleEnemyGroup = () => {
    if (!enemyName.trim()) { toast({ title: "Missing Name", variant: "destructive" }); return; }
    const quantity = parseInt(enemyQuantityInput) || 1; if (quantity <= 0) { toast({ title: "Invalid Quantity", variant: "destructive" }); return; }
    const acValue = enemyAC.trim() === "" ? undefined : parseInt(enemyAC); const hpValue = enemyHP.trim() === "" ? undefined : parseInt(enemyHP);
    if (enemyAC.trim() !== "" && (isNaN(acValue!) || acValue! < 0)) { toast({ title: "Invalid AC", variant: "destructive" }); return; }
    if (enemyHP.trim() !== "" && (isNaN(hpValue!) || hpValue! <= 0)) { toast({ title: "Invalid HP", variant: "destructive" }); return; }
    const initModValue = parseModifierString(enemyInitiativeModifierInput);
    const newEnemies: Combatant[] = []; let groupInitiativeValue: number | undefined;
    if (rollGroupInitiativeFlag && quantity > 1) { groupInitiativeValue = enemyInitiativeInput.trim() !== "" && !isNaN(parseInt(enemyInitiativeInput.trim())) ? parseInt(enemyInitiativeInput.trim()) : rollDie(20) + initModValue; }
    else if (quantity === 1 && enemyInitiativeInput.trim() !== "" && !isNaN(parseInt(enemyInitiativeInput.trim()))) { groupInitiativeValue = parseInt(enemyInitiativeInput.trim()); }
    for (let i = 0; i < quantity; i++) {
      let initiativeValue: number; const currentEnemyName = quantity > 1 ? `${enemyName.trim()} ${i + 1}` : enemyName.trim();
      if (groupInitiativeValue !== undefined) { initiativeValue = groupInitiativeValue; } else { initiativeValue = rollDie(20) + initModValue; }
      newEnemies.push({
        id: `${combatUniqueId}-enemy-${Date.now()}-${i}`, name: currentEnemyName, initiative: initiativeValue, type: 'enemy', ac: acValue, hp: hpValue, currentHp: hpValue, tempHp: 0, 
        initiativeModifier: initModValue, monsterIndex: selectedFavoriteMonsterIndexForCombatAdd, cr: enemyCR.trim() || undefined,
      });
    }
    onAddCombatants(newEnemies);
    if (currentTurnIndex === null && (combatants.length > 0 || newEnemies.length > 0)) setCurrentTurnIndex(0);
    setEnemyName(""); setEnemyInitiativeInput(""); setEnemyQuantityInput("1"); setEnemyInitiativeModifierInput("0"); setRollGroupInitiativeFlag(false); 
    setEnemyAC(""); setEnemyHP(""); setEnemyCR(""); setSelectedFavoriteMonsterIndexForCombatAdd(undefined); 
  };
  
  const handleLoadSavedEncounterToCombat = () => {
    if (!selectedSavedEncounterId) return; const encounter = savedEncountersForCombat.find(e => e.id === selectedSavedEncounterId); if (!encounter) return;
    const newEnemiesFromEncounter: Combatant[] = [];
    encounter.monsters.forEach((monster: EncounterMonster, monsterIndexInEncounter: number) => {
      for (let i = 0; i < monster.quantity; i++) {
        const combatantName = monster.quantity > 1 ? `${monster.name} ${i + 1}` : monster.name;
        const initiativeValue = rollDie(20) + (monster.initiativeModifier || 0);
        const acValue = monster.ac ? parseInt(monster.ac) : undefined; const hpValue = monster.hp ? parseInt(monster.hp) : undefined;
        newEnemiesFromEncounter.push({
          id: `${combatUniqueId}-enemy-${monster.name.replace(/\s+/g, '')}-${Date.now()}-${monsterIndexInEncounter}-${i}`, name: combatantName, initiative: initiativeValue, type: 'enemy', 
          ac: isNaN(acValue!) ? undefined : acValue, hp: isNaN(hpValue!) ? undefined : hpValue, currentHp: isNaN(hpValue!) ? undefined : hpValue, tempHp: 0,
          cr: monster.cr, initiativeModifier: monster.initiativeModifier, monsterIndex: monster.monsterIndex
        });
      }
    });
    onAddCombatants(newEnemiesFromEncounter);
    if (currentTurnIndex === null && combatants.length + newEnemiesFromEncounter.length > 0) setCurrentTurnIndex(0);
    setSelectedSavedEncounterId(undefined);
  };
  const selectedEncounterDetails = selectedSavedEncounterId ? savedEncountersForCombat.find(e => e.id === selectedSavedEncounterId) : null;

  // --- Primary Panel (Combat Tracker) Logic ---
  const handleDamageInputChange = (combatantId: string, value: string) => setDamageInputs(prev => ({ ...prev, [combatantId]: value }));
  const handleApplyDamage = (combatantId: string, type: 'damage' | 'heal') => {
    const amountStr = damageInputs[combatantId]; if (!amountStr) return; const amount = parseInt(amountStr); if (isNaN(amount) || amount <= 0) return;
    const combatant = combatants.find(c => c.id === combatantId); if (!combatant) return;
    let newCurrentHp = combatant.currentHp ?? combatant.hp ?? 0; let newTempHp = combatant.tempHp ?? 0; const updates: Partial<Combatant> = {};
    if (type === 'damage') {
      if (newTempHp > 0) { const damageToTemp = Math.min(amount, newTempHp); newTempHp -= damageToTemp; const remainingDamage = amount - damageToTemp; if (remainingDamage > 0) { newCurrentHp = Math.max(0, newCurrentHp - remainingDamage); } } 
      else { newCurrentHp = Math.max(0, newCurrentHp - amount); }
      updates.tempHp = newTempHp;
    } else if (type === 'heal') { if (combatant.hp !== undefined) { newCurrentHp = Math.min(combatant.hp, newCurrentHp + amount); } else { newCurrentHp += amount; } }
    updates.currentHp = newCurrentHp; onUpdateCombatant(combatantId, updates); setDamageInputs(prev => ({ ...prev, [combatantId]: "" }));
  };
  const handleAddTempHp = (combatantId: string) => {
    const amountStr = damageInputs[combatantId]; if (!amountStr) return; const amount = parseInt(amountStr); if (isNaN(amount) || amount < 0) { toast({ title: "Invalid Amount", variant: "destructive"}); return; }
    onUpdateCombatant(combatantId, { tempHp: Math.max(0, amount) }); setDamageInputs(prev => ({ ...prev, [combatantId]: "" }));
  };
  const handleOpenDeleteConfirm = (combatant: Combatant) => { setCombatantToDelete(combatant); setIsDeleteConfirmOpen(true); };
  const handleConfirmDeleteCombatant = () => {
    if (!combatantToDelete) return; const id = combatantToDelete.id; onRemoveCombatant(id);
    if (combatants.length -1 === 0) { setCurrentTurnIndex(null); } 
    else if (currentTurnIndex !== null) {
      const combatantToRemoveIndex = combatants.findIndex(c => c.id === id);
      if(combatantToRemoveIndex !== -1 && combatants.length -1 > 0) { // Ensure combatants.length-1 is positive
        if (combatantToRemoveIndex === currentTurnIndex) { setCurrentTurnIndex(currentTurnIndex % (combatants.length -1)); } 
        else if (combatantToRemoveIndex < currentTurnIndex) { setCurrentTurnIndex(currentTurnIndex - 1); }
      } else if (combatants.length -1 === 0) { setCurrentTurnIndex(null); }
    }
    if (selectedCombatantId === id) setSelectedCombatantId(null);
    setIsDeleteConfirmOpen(false); setCombatantToDelete(null);
  };
  const nextTurn = () => { if (!combatants || combatants.length === 0 || currentTurnIndex === null) return; setCurrentTurnIndex((currentTurnIndex + 1) % combatants.length); };
  const prevTurn = () => { if (!combatants || combatants.length === 0 || currentTurnIndex === null) return; setCurrentTurnIndex((currentTurnIndex - 1 + combatants.length) % combatants.length); };
  const handleEndCombatLocal = () => { onEndCombat(); setCurrentTurnIndex(null); setSelectedCombatantId(null); setDamageInputs({}); setIsSecondaryPanelVisible(false); setSecondaryPanelMode(null); };
  const handleCombatantCardClick = (combatant: Combatant) => { setSelectedCombatantId(prevId => prevId === combatant.id ? null : combatant.id); if (isMonsterDetailDialogOpen && selectedMonsterForDetailDialog?.id !== combatant.id) setIsMonsterDetailDialogOpen(false); };
  
  const fetchFullEnemyDetails = useCallback(async (combatant: Combatant) => {
    if (!combatant.monsterIndex) { setSelectedMonsterForDetailDialog(combatant); setIsMonsterDetailDialogOpen(true); return; }
    if (fullEnemyDetailsCache[combatant.monsterIndex]) { setSelectedMonsterForDetailDialog(combatant); setIsMonsterDetailDialogOpen(true); return; }
    setIsLoadingFullEnemyDetailsFor(combatant.id); setSelectedMonsterForDetailDialog(combatant); setIsMonsterDetailDialogOpen(true);
    try {
      const response = await fetch(`${DND5E_API_BASE_URL}/api/monsters/${combatant.monsterIndex}`);
      if (!response.ok) throw new Error(`Failed to fetch details for ${combatant.name}`);
      const data: MonsterDetail = await response.json(); setFullEnemyDetailsCache(prev => ({ ...prev, [combatant.monsterIndex!]: {...data, source: 'api'} }));
    } catch (err: any) { console.error(err); toast({ title: "Error", description: `Could not load details for ${combatant.name}.`, variant: "destructive" });
    } finally { setIsLoadingFullEnemyDetailsFor(null); }
  }, [fullEnemyDetailsCache, toast]);

  const handleOpenMonsterDetailDialog = (combatant: Combatant) => {
    if (selectedCombatantId === combatant.id) setSelectedCombatantId(null); 
    if (combatant.monsterIndex && !fullEnemyDetailsCache[combatant.monsterIndex]) { fetchFullEnemyDetails(combatant); } 
    else { setSelectedMonsterForDetailDialog(combatant); setIsMonsterDetailDialogOpen(true); }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "flex flex-col p-0 overflow-hidden sm:max-w-none", // Removed pr-8 here
          isSecondaryPanelVisible ? COMBINED_SHEET_WIDTH_CLASS : PRIMARY_SHEET_WIDTH_CLASS
        )}
        hideCloseButton={true}
      >
        <div className="flex flex-row h-full">
          {/* Secondary Panel (Left side when visible) */}
          {isSecondaryPanelVisible && (
            <div
              className={cn(
                SECONDARY_PANEL_CLASS,
                "h-full bg-card border-r border-border p-0 flex flex-col overflow-hidden flex-shrink-0 relative" // Added relative for close button
              )}
            >
              <ScrollArea className="flex-1 p-4"> {/* Scroll for content */}
              {secondaryPanelMode === 'addCombatant' && (
                <div className="space-y-4">
                  <Tabs value={addCombatantActiveTab} onValueChange={(value) => setAddCombatantActiveTab(value as AddCombatantSubTab)} className="flex flex-col flex-grow">
                    <TabsList className="grid w-full grid-cols-3 shrink-0">
                      <TabsTrigger value="partyMembers">Party</TabsTrigger>
                      <TabsTrigger value="genericFriendly">Friendly</TabsTrigger>
                      <TabsTrigger value="enemies">Enemies</TabsTrigger>
                    </TabsList>
                    <TabsContent value="partyMembers" className="mt-3 flex-grow flex flex-col">
                      {availablePartyMembers.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4 flex-grow flex items-center justify-center">All party members in combat or no party.</p> : (
                        <><ScrollArea className="flex-grow mb-3 border rounded-md"><div className="p-3 space-y-3">
                          {availablePartyMembers.map(player => (
                            <div key={player.id} className="flex items-center justify-between gap-3 p-2 border-b last:border-b-0">
                              <div className="flex-grow">
                                <p className="text-sm font-medium">{player.name}</p>
                                <p className="text-xs text-muted-foreground">Lvl {player.level} {player.race} {player.class} (Init Mod: {player.initiativeModifier !== undefined ? (player.initiativeModifier >= 0 ? '+':''):''}{player.initiativeModifier ?? '0'})</p>
                              </div>
                              <Input id={`player-init-${player.id}`} type="number" placeholder="Roll" value={manualPlayerInitiatives[player.id] || ""} onChange={(e) => setManualPlayerInitiatives(prev => ({...prev, [player.id]: e.target.value}))} className="w-24 h-9 text-sm" />
                            </div>))}
                        </div></ScrollArea>
                        <Button onClick={handleRollAllPlayerInitiatives} disabled={availablePartyMembers.length === 0} className="w-full shrink-0"><Users className="mr-2 h-4 w-4"/> Add Players to Combat</Button></>)}
                    </TabsContent>
                    <TabsContent value="genericFriendly" className="mt-3 space-y-4 flex-grow flex flex-col">
                      <div className="space-y-3 flex-grow">
                        <div><Label htmlFor="friendly-name-input">Friendly Name*</Label><Input id="friendly-name-input" value={friendlyNameInput} onChange={(e) => setFriendlyNameInput(e.target.value)} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label htmlFor="friendly-ac-input">AC</Label><Input id="friendly-ac-input" type="number" value={friendlyACInput} onChange={(e) => setFriendlyACInput(e.target.value)} /></div>
                          <div><Label htmlFor="friendly-hp-input">HP</Label><Input id="friendly-hp-input" type="number" value={friendlyHPInput} onChange={(e) => setFriendlyHPInput(e.target.value)} /></div>
                        </div>
                        <div><Label htmlFor="friendly-initiative-input">Initiative*</Label><div className="flex gap-2 items-center"><Input id="friendly-initiative-input" type="number" value={friendlyInitiativeInput} onChange={(e) => setFriendlyInitiativeInput(e.target.value)} className="flex-grow" /><Button onClick={handleRollGenericFriendlyInitiative} variant="outline" size="sm" className="shrink-0"><Dice5 className="mr-1 h-4 w-4"/> Roll d20</Button></div></div>
                      </div>
                      <Button onClick={handleSaveGenericFriendly} disabled={!friendlyNameInput.trim() || !friendlyInitiativeInput.trim()} className="w-full shrink-0 mt-auto"><UserPlus className="mr-2 h-4 w-4"/> Add Friendly</Button>
                    </TabsContent>
                    <TabsContent value="enemies" className="mt-1 flex-grow flex flex-col">
                      <Tabs value={addEnemyActiveSubTab} onValueChange={setAddEnemyActiveSubTab} className="flex flex-col flex-grow">
                        <TabsList className="grid w-full grid-cols-2 shrink-0"><TabsTrigger value="singleEnemy">Single/Group</TabsTrigger><TabsTrigger value="loadEncounter" disabled={!activeCampaign}>Load Encounter</TabsTrigger></TabsList>
                        <TabsContent value="singleEnemy" className="mt-3 space-y-3 flex-grow flex flex-col">
                          <div className="space-y-3 flex-grow">
                            <div className="flex items-center justify-between"><Label htmlFor="enemy-name-input">Enemy Name*</Label><Button variant="ghost" size="icon" onClick={() => setIsFavoriteMonsterDialogOpen(true)} className="h-7 w-7"><Star className="h-4 w-4 text-amber-400 hover:text-amber-500"/></Button></div>
                            <Input id="enemy-name-input" value={enemyName} onChange={(e) => setEnemyName(e.target.value)} />
                            <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="enemy-ac-input">AC</Label><Input id="enemy-ac-input" type="number" value={enemyAC} onChange={(e) => setEnemyAC(e.target.value)} /></div><div><Label htmlFor="enemy-hp-input">HP</Label><Input id="enemy-hp-input" type="number" value={enemyHP} onChange={(e) => setEnemyHP(e.target.value)} /></div></div>
                            <div className="flex items-end gap-3"><div className="w-20"><Label htmlFor="enemy-quantity-input">Quantity</Label><Input id="enemy-quantity-input" type="number" value={enemyQuantityInput} onChange={(e) => setEnemyQuantityInput(e.target.value)} min="1" /></div><div className="flex items-center space-x-2 pb-1"><Switch id="roll-group-initiative-flag" checked={rollGroupInitiativeFlag} onCheckedChange={setRollGroupInitiativeFlag} disabled={isGroupSwitchDisabled}/><Label htmlFor="roll-group-initiative-flag" className="cursor-pointer text-sm">Group</Label></div></div>
                            <div><Label htmlFor="enemy-init-mod-input">Init. Mod.</Label><Input id="enemy-init-mod-input" value={enemyInitiativeModifierInput} onChange={(e) => setEnemyInitiativeModifierInput(e.target.value)} /></div>
                            <div><Label htmlFor="enemy-initiative-val-input">Initiative</Label><div className="flex gap-2 items-center"><Input id="enemy-initiative-val-input" className="w-24 h-10" value={enemyInitiativeInput} onChange={(e) => setEnemyInitiativeInput(e.target.value)} type="number" disabled={enemyQuantityNum > 1 && !rollGroupInitiativeFlag} /><Button variant="outline" size="sm" className="shrink-0 h-10" onClick={() => setEnemyInitiativeInput((rollDie(20) + parseModifierString(enemyInitiativeModifierInput)).toString())} disabled={enemyQuantityNum > 1 && !rollGroupInitiativeFlag}><Dice5 className="mr-1 h-4 w-4"/> d20 + {parseModifierString(enemyInitiativeModifierInput)}</Button></div></div>
                          </div>
                          <Button onClick={handleAddSingleEnemyGroup} disabled={!enemyName.trim()} className="w-full shrink-0 mt-auto">
                            {(enemyQuantityNum > 1 && !rollGroupInitiativeFlag) ? <Dice5 className="mr-2 h-4 w-4"/> : null}
                            {(enemyQuantityNum > 1 && !rollGroupInitiativeFlag) ? "Add & Roll Individually" : "Add to Combat"}
                          </Button>
                        </TabsContent>
                        <TabsContent value="loadEncounter" className="mt-3 flex-grow flex flex-col min-h-0">
                          {isLoadingSavedEncounters ? <div className="flex items-center justify-center h-32 flex-grow"><Loader2 className="h-6 w-6 animate-spin" /></div> 
                          : savedEncountersForCombat.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4 flex-grow flex items-center justify-center">No saved encounters found.</p> 
                          : <><div className="shrink-0"><Label htmlFor="saved-encounter-select">Select Saved Encounter</Label><Select value={selectedSavedEncounterId} onValueChange={setSelectedSavedEncounterId}><SelectTrigger id="saved-encounter-select"><SelectValue placeholder="Choose an encounter..." /></SelectTrigger><SelectContent>{savedEncountersForCombat.map(enc => (<SelectItem key={enc.id} value={enc.id}>{enc.title}</SelectItem>))}</SelectContent></Select></div>
                            {selectedEncounterDetails && <div className="mt-2 flex-grow flex flex-col min-h-0"><Label className="font-medium shrink-0">Monsters in "{selectedEncounterDetails.title}":</Label><ScrollArea className="mt-1 border rounded-md p-2 bg-muted/30 flex-grow"><ul className="text-sm space-y-1">{selectedEncounterDetails.monsters.map(monster => (<li key={monster.id}>{monster.name} (x{monster.quantity})<span className="text-xs text-muted-foreground ml-1">{monster.cr && `CR:${monster.cr} `}{monster.ac && `AC:${monster.ac} `}{monster.hp && `HP:${monster.hp}`} {monster.initiativeModifier !== undefined && `Init Mod:${monster.initiativeModifier >=0 ? '+' : ''}${monster.initiativeModifier}`}</span></li>))}</ul></ScrollArea></div>}
                            <Button onClick={handleLoadSavedEncounterToCombat} disabled={!selectedSavedEncounterId} className="w-full shrink-0 mt-auto"><FolderOpen className="mr-2 h-4 w-4"/> Add Encounter to Combat</Button></>}
                        </TabsContent>
                      </Tabs>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              {secondaryPanelMode === 'diceRoller' && (
                <div className="p-4 space-y-4 h-full flex flex-col">
                  <div><Label htmlFor="dice-notation-secondary">Dice Notation</Label><Input id="dice-notation-secondary" value={diceInputValue} onChange={(e) => setDiceInputValue(e.target.value)} placeholder="e.g., 2d6+3, d20" /></div>
                  <div><Label>Roll Mode</Label><RadioGroup defaultValue="normal" value={diceRollMode} onValueChange={(value: string) => setDiceRollMode(value as RollMode)} className="flex space-x-2 pt-1">
                      <div className="flex items-center space-x-1"><RadioGroupItem value="normal" id={`${diceUniqueId}-mode-normal-secondary`} /><Label htmlFor={`${diceUniqueId}-mode-normal-secondary`} className="font-normal cursor-pointer">Normal</Label></div>
                      <div className="flex items-center space-x-1"><RadioGroupItem value="advantage" id={`${diceUniqueId}-mode-advantage-secondary`} /><Label htmlFor={`${diceUniqueId}-mode-advantage-secondary`} className="font-normal cursor-pointer">Advantage</Label></div>
                      <div className="flex items-center space-x-1"><RadioGroupItem value="disadvantage" id={`${diceUniqueId}-mode-disadvantage-secondary`} /><Label htmlFor={`${diceUniqueId}-mode-disadvantage-secondary`} className="font-normal cursor-pointer">Disadvantage</Label></div>
                  </RadioGroup></div>
                  <Button onClick={handleDiceRollSecondary} className={cn("w-full", diceRollMode === "advantage" && "border-2 border-green-500 hover:border-green-600", diceRollMode === "disadvantage" && "border-2 border-red-500 hover:border-red-600")}>
                      {diceInputValue.trim() === "" ? <Dice5 className="mr-2 h-5 w-5" /> : <Zap className="mr-2 h-5 w-5" />}
                      {diceInputValue.trim() === "" ? "Roll d20" : "Roll"}
                  </Button>
                  <div className="flex-grow flex flex-col min-h-0">
                      <div className="flex justify-between items-center mb-1 shrink-0"><Label>Roll Log</Label><Button variant="ghost" size="sm" onClick={onClearRollLog} className="text-xs text-muted-foreground hover:text-foreground"><Trash2 className="mr-1 h-3 w-3" /> Clear Log</Button></div>
                      <ScrollArea className="border rounded-md p-2 flex-grow bg-muted/30 h-full">
                          {rollLog.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No rolls yet.</p>}
                          <div className="space-y-3">{rollLog.map(entry => (
                            <div key={entry.id} className={cn("text-sm p-2 rounded-md bg-background shadow-sm", entry.isRolling ? "opacity-50" : "animate-in slide-in-from-top-2 fade-in duration-300")}>
                              {entry.isRolling ? (<div className="flex items-center h-10"><Dice5 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2 text-lg font-semibold text-primary">Rolling...</span></div>) 
                              : ( <> <p className="text-2xl font-bold text-primary">{entry.resultText}</p> <p className="text-xs text-muted-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: (entry.detailText as string).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} /> </> )}
                            </div> ))}</div>
                      </ScrollArea>
                  </div>
                </div>
              )}
              </ScrollArea>
               <button
                onClick={handleCloseSecondaryPanel}
                className="absolute top-1/2 -translate-y-1/2 -right-0.5 h-16 w-5 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[70] rounded-l-md border-y border-l"
                aria-label="Close Secondary Panel"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Primary Panel (Right side, or full width if secondary is hidden) */}
          <div
            className={cn(
              "h-full p-4 flex flex-col overflow-y-auto flex-shrink-0",
              isSecondaryPanelVisible ? PRIMARY_PANEL_CLASS : "flex-1 w-full"
            )}
          >
            {/* Content of the Combat Tracker (Combat Order) */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Button onClick={() => handleOpenSecondaryPanel('addCombatant')} variant={secondaryPanelMode === 'addCombatant' ? "secondary" : "outline"} size="sm">
                        <UserPlus className="mr-2 h-4 w-4"/>Add Combatant
                    </Button>
                    <Button onClick={() => handleOpenSecondaryPanel('diceRoller')} variant={secondaryPanelMode === 'diceRoller' ? "secondary" : "outline"} size="sm">
                        <Dice5 className="mr-2 h-4 w-4"/>Dice Roller
                    </Button>
                </div>
                {combatants.length > 0 && (
                    <Button onClick={handleEndCombatLocal} variant="destructive" size="sm">
                        <XCircle className="mr-2 h-4 w-4"/>End Combat
                    </Button>
                )}
            </div>

            <div className="flex flex-col flex-grow min-h-0">
              <Label className="mb-1 shrink-0">Combat Order (Highest to Lowest)</Label>
              <ScrollArea className="border rounded-md p-1 flex-grow bg-muted/30 h-full">
                  {combatants.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No combatants yet.</p>}
                  <ul className="space-y-1.5">
                  {combatants.map((c, index) => (
                      <li key={c.id} ref={(el) => combatantRefs.current.set(c.id, el)} 
                          className={`p-2.5 rounded-md flex flex-col gap-1.5 transition-all shadow-sm ${currentTurnIndex === index ? 'ring-2 ring-primary bg-primary/10' : 'bg-background'}`} 
                          style={c.type === 'player' && c.color ? { borderLeft: `4px solid ${c.color}` } : {}} 
                          onClick={() => handleCombatantCardClick(c)}
                      >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center flex-1">
                                <span className={`font-bold text-lg mr-3 ${currentTurnIndex === index ? 'text-primary' : ''}`}>{c.initiative}</span>
                                <div>
                                  <p className={cn("font-medium", c.type === 'enemy' && 'text-destructive', selectedCombatantId === c.id && c.type === 'enemy' && 'text-primary')}>{c.name}</p>
                                  <p className="text-xs text-muted-foreground">AC: {c.ac ?? 'N/A'} | HP: {c.currentHp ?? c.hp ?? 'N/A'}/{c.hp ?? 'N/A'} {c.tempHp !== undefined && c.tempHp > 0 && <span className="text-blue-500">(+{c.tempHp} Temp)</span>}</p>
                                </div>
                            </div>
                            {c.type === 'enemy' && c.monsterIndex && (<Button variant="ghost" size="icon" className="h-7 w-7 ml-auto" onClick={(e) => { e.stopPropagation(); handleOpenMonsterDetailDialog(c); }}><BookOpen className="h-4 w-4 text-muted-foreground" /></Button>)}
                        </div>
                        {c.type === 'enemy' && c.hp !== undefined && c.hp > 0 && c.currentHp !== undefined && (<div className={cn("mt-1 rounded-full", c.tempHp && c.tempHp > 0 && "ring-1 ring-blue-500 ring-offset-1 ring-offset-background p-px")}><Progress value={Math.max(0, (c.currentHp / c.hp) * 100)} className="h-1.5 [&>div]:bg-destructive rounded-full" /></div>)}
                        
                        {c.type === 'enemy' && c.id === selectedCombatantId && c.currentHp !== undefined && c.currentHp > 0 && (
                          <div className="flex items-center justify-center gap-1.5 pt-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleOpenDeleteConfirm(c);}}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                              <Button size="sm" variant="outline" className="px-2 py-1 h-8 text-xs border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleApplyDamage(c.id, 'damage'); }}><Swords className="mr-1 h-3 w-3" /> Hit</Button>
                              <Input type="number" className="h-8 text-sm w-20 px-2 py-1" value={damageInputs[c.id] || ""} onChange={(e) => handleDamageInputChange(c.id, e.target.value)} onClick={(e) => e.stopPropagation()} min="1" />
                              <Button size="sm" variant="outline" className="px-2 py-1 h-8 text-xs border-green-600 text-green-600 hover:bg-green-500/10 hover:text-green-700" onClick={(e) => { e.stopPropagation(); handleApplyDamage(c.id, 'heal'); }}><Bandage className="mr-1 h-3 w-3" /> Heal</Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleAddTempHp(c.id);}} title="Add Temporary HP"><Shield className="h-4 w-4 text-blue-500"/></Button>
                          </div> )}
                        {c.type === 'enemy' && c.currentHp !== undefined && c.currentHp <= 0 && (<Button variant="destructive" className="w-full mt-1.5 py-1 h-auto text-sm" onClick={(e) => { e.stopPropagation(); handleOpenDeleteConfirm(c); }}><Skull className="mr-2 h-4 w-4" /> Dead (Remove)</Button>)}
                      </li> ))}
                  </ul>
              </ScrollArea>
               {combatants.length > 0 && (
                <div className="pt-2 mt-auto flex gap-2 shrink-0">
                    <Button onClick={prevTurn} variant="outline" className="flex-1"><ArrowLeft className="mr-2 h-4 w-4"/>Prev</Button>
                    <Button onClick={nextTurn} className="flex-1 bg-primary hover:bg-primary/90"><ArrowRight className="mr-2 h-4 w-4"/>Next Turn</Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vertical Close Bar for the entire Sheet */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]"
          aria-label="Close Combat Tracker"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </SheetContent>
      
      {/* Dialogs used by this drawer */}
      <Dialog open={isFavoriteMonsterDialogOpen} onOpenChange={setIsFavoriteMonsterDialogOpen}>
        <DialogContent className="max-w-md min-h-[480px] flex flex-col">
          <DialogHeader className="bg-primary text-primary-foreground p-4 rounded-t-md -mx-6 -mt-0 mb-4">
            <DialogTitle className="text-primary-foreground">Select Favorite Monster</DialogTitle>
            <DialogDescription className="text-primary-foreground/80">Choose from your Monster Mash favorites.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="mt-4 flex-grow">
              {favoritesList.length === 0 ? (<p className="text-muted-foreground text-center py-4">No favorites found.</p>) : (<ul className="space-y-2">{favoritesList.map(fav => (<li key={fav.index}><Button variant="outline" className="w-full justify-start" onClick={() => handleSelectFavoriteMonster(fav)}>{fav.name} (CR: {formatCRDisplay(fav.cr)})</Button></li>))}</ul>)}
          </ScrollArea>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <UIAlertDialogContent>
            <UIAlertDialogHeader><UIAlertDialogTitle>Remove Combatant?</UIAlertDialogTitle><UIAlertDialogDescription>Are you sure you want to remove "{combatantToDelete?.name}" from the combat?</UIAlertDialogDescription></UIAlertDialogHeader>
            <UIAlertDialogFooter><AlertDialogCancel onClick={() => { setIsDeleteConfirmOpen(false); setCombatantToDelete(null); }}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDeleteCombatant} className={cn(buttonVariants({variant: 'destructive'}))}>Remove</AlertDialogAction></UIAlertDialogFooter>
        </UIAlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isMonsterDetailDialogOpen} onOpenChange={setIsMonsterDetailDialogOpen}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{selectedMonsterForDetailDialog?.name || "Monster Details"}</DialogTitle></DialogHeader><ScrollArea className="max-h-[70vh] pr-4">
        {isLoadingFullEnemyDetailsFor === selectedMonsterForDetailDialog?.id ? (<div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>)
        : selectedMonsterForDetailDialog?.monsterIndex && fullEnemyDetailsCache[selectedMonsterForDetailDialog.monsterIndex] ? (
        (() => { const detail = fullEnemyDetailsCache[selectedMonsterForDetailDialog.monsterIndex!];
            return (<div className="space-y-3 text-sm py-4">
                <p className="text-sm text-muted-foreground">{detail.size} {detail.type} {detail.subtype ? `(${detail.subtype})` : ''}, {detail.alignment}</p>
                <div className="grid grid-cols-3 gap-2 text-xs border p-2 rounded-md bg-background"><div><strong>AC:</strong> {formatArmorClass(detail.armor_class)}</div><div><strong>HP:</strong> {detail.hit_points} {detail.hit_dice ? `(${detail.hit_dice})` : ''}</div><div><strong>CR:</strong> {formatCRDisplay(detail.challenge_rating as number | string)} {detail.xp ? `(${detail.xp} XP)` : ''}</div></div>
                <div><strong>Speed:</strong> {typeof detail.speed === 'string' ? detail.speed : detail.speed ? Object.entries(detail.speed).map(([key, val]) => `${key} ${val}`).join(', ') : 'N/A'}</div>
                <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-xs border p-2 rounded-md bg-background">
                    <div className="text-center"><strong>STR</strong><br/>{detail.strength ?? 'N/A'} ({detail.strength ? Math.floor((detail.strength - 10) / 2) : 'N/A'})</div><div className="text-center"><strong>DEX</strong><br/>{detail.dexterity ?? 'N/A'} ({detail.dexterity ? Math.floor((detail.dexterity - 10) / 2) : 'N/A'})</div><div className="text-center"><strong>CON</strong><br/>{detail.constitution ?? 'N/A'} ({detail.constitution ? Math.floor((detail.constitution - 10) / 2) : 'N/A'})</div>
                    <div className="text-center"><strong>INT</strong><br/>{detail.intelligence ?? 'N/A'} ({detail.intelligence ? Math.floor((detail.intelligence - 10) / 2) : 'N/A'})</div><div className="text-center"><strong>WIS</strong><br/>{detail.wisdom ?? 'N/A'} ({detail.wisdom ? Math.floor((detail.wisdom - 10) / 2) : 'N/A'})</div><div className="text-center"><strong>CHA</strong><br/>{detail.charisma ?? 'N/A'} ({detail.charisma ? Math.floor((detail.charisma - 10) / 2) : 'N/A'})</div>
                </div>
                {detail.proficiencies?.length > 0 && (<div><strong>Saving Throws & Skills:</strong> {detail.proficiencies.map(p => `${p.proficiency.name.replace("Saving Throw: ", "").replace("Skill: ", "")} +${p.value}`).join(', ')}</div>)}
                {detail.damage_vulnerabilities?.length > 0 && <div><strong>Vulnerabilities:</strong> {Array.isArray(detail.damage_vulnerabilities) ? detail.damage_vulnerabilities.join(', ') : detail.damage_vulnerabilities}</div>}
                {detail.damage_resistances?.length > 0 && <div><strong>Resistances:</strong> {Array.isArray(detail.damage_resistances) ? detail.damage_resistances.join(', ') : detail.damage_resistances}</div>}
                {detail.damage_immunities?.length > 0 && <div><strong>Immunities:</strong> {Array.isArray(detail.damage_immunities) ? detail.damage_immunities.join(', ') : detail.damage_immunities}</div>}
                {detail.condition_immunities && (typeof detail.condition_immunities === 'string' ? detail.condition_immunities.length > 0 : detail.condition_immunities.length > 0) && <div><strong>Condition Immunities:</strong> {(Array.isArray(detail.condition_immunities) && detail.condition_immunities.length > 0 && typeof detail.condition_immunities[0] !== 'string') ? (detail.condition_immunities as { index: string; name: string; url: string }[]).map(ci => ci.name).join(', ') : (Array.isArray(detail.condition_immunities) ? detail.condition_immunities.join(', ') : detail.condition_immunities) }</div>}
                <div><strong>Senses:</strong> {typeof detail.senses === 'string' ? detail.senses : detail.senses ? Object.entries(detail.senses).map(([key, val]) => `${key.replace("_", " ")} ${val}`).join(', ') : 'N/A'}</div>
                <div><strong>Languages:</strong> {detail.languages || "None"}</div>
                {renderDetailActions(detail.special_abilities, "Special Abilities")}
                {renderDetailActions(detail.actions, "Actions")}
                {renderDetailActions(detail.legendary_actions, "Legendary Actions")}
                {detail.image && (<div className="mt-2"><Image src={detail.source === 'api' ? `${DND5E_API_BASE_URL}${detail.image}` : detail.image} alt={detail.name} width={300} height={300} className="rounded-md border object-contain mx-auto" data-ai-hint={`${detail.type} monster`}/></div>)}
            </div>);
        })() )
        : selectedMonsterForDetailDialog?.monsterIndex ? (<p className="text-sm text-muted-foreground py-4">Could not load details for {selectedMonsterForDetailDialog.name}.</p>)
        : (<p className="text-sm text-muted-foreground py-4">No detailed API data available for this manually added combatant.</p>)}
        </ScrollArea><DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter></DialogContent>
      </Dialog>

    </Sheet>
  );
}


// Helper functions for Monster Detail Dialog (copied from CombinedToolDrawer for now)
const formatArmorClass = (acArray: MonsterDetail["armor_class"] | undefined): string => {
    if (!acArray || acArray.length === 0) return "N/A";
    if (typeof acArray[0] === 'object' && acArray[0] !== null && 'value' in acArray[0] && 'type' in acArray[0]) {
        const mainAc = acArray[0] as ArmorClass;
        let str = `${mainAc.value} (${mainAc.type})`;
        if (mainAc.desc) { str += ` - ${mainAc.desc}`; }
        return str;
    }
    return "N/A";
};

const renderDetailTextField = (label: string, textContent: string | undefined | null) => {
    if (!textContent || textContent.trim() === "") return null;
    const paragraphs = textContent.split('\n\n').map(para => para.trim()).filter(Boolean);
    return ( <div className="mb-2"> <h4 className="font-semibold text-primary text-sm">{label}</h4> {paragraphs.map((paragraph, index) => {
          const parts = paragraph.split(/\*\*(.*?)\*\*/g); 
          return ( <p key={index} className="text-xs mb-1"> {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-medium">{part}</strong> : part )} </p> );
        })} </div> );
};

type DetailActionType = MonsterAction | SpecialAbility | LegendaryAction;
const renderDetailActions = (actions: DetailActionType[] | undefined | string, actionTypeLabel: string) => {
    if (!actions || (typeof actions === 'string' && actions.trim() === "") || (Array.isArray(actions) && actions.length === 0)) { return null; }
    if (typeof actions === 'string') { return renderDetailTextField(actionTypeLabel, actions); }
    return ( <div className="mb-2"> <h4 className="font-semibold text-primary text-sm">{actionTypeLabel}</h4> <ul className="list-disc pl-4 space-y-1">
        {actions.map((action: DetailActionType) => (
          <li key={action.name} className="text-xs">
            <strong className="font-medium">{action.name}
            {('usage' in action && action.usage) ? ` (${action.usage.type}${(action.usage as any).times ? ` ${(action.usage as any).times} times` : ''}${(action.usage as any).dice ? `, recharges on ${(action.usage as any).dice}` : ''})` : ''}
            .</strong> {(action as any).desc} 
             { ('attack_bonus' in action && action.attack_bonus !== undefined) && <p className="text-2xs pl-2">Attack Bonus: +{action.attack_bonus}</p> }
            { ('damage' in action && action.damage) && ((action.damage as any[])).map((dmg: any, i: number) => ( <p key={i} className="text-2xs pl-2">Damage: {dmg.damage_dice} {dmg.damage_type?.name}</p> ))}
             { ('dc' in action && action.dc) && <p className="text-2xs pl-2">DC {(action.dc as any).dc_value} {(action.dc as any).dc_type.name} ({(action.dc as any).success_type})</p>}
          </li> ))} </ul> </div> );
};
