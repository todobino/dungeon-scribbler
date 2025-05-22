
"use client";

import React, { useState, useEffect, useId, useRef, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button, buttonVariants }
from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader as UIAlertDialogHeader, AlertDialogTitle as UIAlertDialogTitle, AlertDialogFooter as UIAlertDialogFooter } from "@/components/ui/alert-dialog";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ChevronRight, UserPlus, Dice5, XCircle, Skull, Loader2, Swords, FolderOpen,
  MinusCircle, BookOpen, Star, Bandage, Shield, PanelLeftOpen, PlusCircle, Users as UsersIcon, Trash2, ChevronLeft, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseDiceNotation, rollMultipleDice, rollDie } from "@/lib/dice-utils";
import type { PlayerCharacter, Combatant, RollLogEntry, SavedEncounter, EncounterMonster, FavoriteMonster, MonsterDetail, ArmorClass, SpecialAbility, MonsterAction, LegendaryAction } from "@/lib/types";
import { useCampaign } from "@/contexts/campaign-context";
import { SAVED_ENCOUNTERS_STORAGE_KEY_PREFIX, MONSTER_MASH_FAVORITES_STORAGE_KEY, DND5E_API_BASE_URL } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCRDisplay } from "@/components/features/monster-mash/MonsterMashDrawer";
import { useToast } from "@/hooks/use-toast";

// Width definitions
const PRIMARY_PANEL_CONTENT_WIDTH_VAL = 380;
const SECONDARY_PANEL_CONTENT_WIDTH_VAL = 380;
const CLOSE_BAR_WIDTH_VAL = 32; // approx 2rem or w-8

const PRIMARY_SHEET_WIDTH_CLASS = `w-[${PRIMARY_PANEL_CONTENT_WIDTH_VAL + CLOSE_BAR_WIDTH_VAL}px]`;
const COMBINED_SHEET_WIDTH_CLASS = `w-[${SECONDARY_PANEL_CONTENT_WIDTH_VAL + PRIMARY_PANEL_CONTENT_WIDTH_VAL + CLOSE_BAR_WIDTH_VAL}px]`;

const PRIMARY_PANEL_CLASS = `w-[${PRIMARY_PANEL_CONTENT_WIDTH_VAL}px]`;
const SECONDARY_PANEL_CLASS = `w-[${SECONDARY_PANEL_CONTENT_WIDTH_VAL}px]`;


interface CombatTrackerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCampaign: PlayerCharacter['campaignId'] | null;
  activeCampaignParty: PlayerCharacter[];
  combatants: Combatant[];
  onAddCombatant: (combatant: Combatant) => void;
  onAddCombatants: (newCombatants: Combatant[]) => void;
  onRemoveCombatant: (combatantId: string) => void;
  onUpdateCombatant: (combatantId: string, updates: Partial<Combatant>) => void;
  onEndCombat: () => void;
  rollLog: RollLogEntry[];
  onInternalRoll: (rollData: Omit<RollLogEntry, 'id'>) => void;
  onClearRollLog: () => void;
}

// Helper function for rendering monster actions (copied from MonsterMashDrawer)
const renderDetailActions = (actions: MonsterAction[] | SpecialAbility[] | LegendaryAction[] | undefined | string, actionTypeLabel: string) => {
    if (!actions || (typeof actions === 'string' && actions.trim() === "") || (Array.isArray(actions) && actions.length === 0)) { return null; }
    if (typeof actions === 'string') {
      const paragraphs = actions.split('\n\n').map(para => para.trim()).filter(Boolean);
      return ( <div className="mb-2"> <h4 className="font-semibold text-primary text-sm">{actionTypeLabel}</h4> {paragraphs.map((paragraph, index) => {
            const parts = paragraph.split(/\*\*(.*?)\*\*/g); // Regex to split by markdown bold
            return ( <p key={index} className="text-xs mb-1"> {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-medium">{part}</strong> : part )} </p> );
          })} </div> );
    }
    return ( <div className="mb-2"> <h4 className="font-semibold text-primary text-sm">{actionTypeLabel}</h4> <ul className="list-disc pl-4 space-y-1">
        {actions.map((action) => ( // Explicitly type action
          <li key={action.name} className="text-xs">
            <strong className="font-medium">{action.name}
            {('usage' in action && action.usage) ? ` (${action.usage.type}${(action.usage as any).times ? ` ${(action.usage as any).times} times` : ''}${(action.usage as any).dice ? `, recharges on ${(action.usage as any).dice}` : ''})` : ''}
            .</strong> {(action as any).desc}
             { ('attack_bonus' in action && action.attack_bonus !== undefined) && <p className="text-xs pl-2">Attack Bonus: +{action.attack_bonus}</p> }
            { ('damage' in action && action.damage) && ((action.damage as any[])).map((dmg: any, i: number) => ( <p key={i} className="text-xs pl-2">Damage: {dmg.damage_dice} {dmg.damage_type?.name}</p> ))}
             { ('dc' in action && action.dc) && <p className="text-xs pl-2">DC {(action.dc as any).dc_value} {(action.dc as any).dc_type.name} ({(action.dc as any).success_type})</p>}
          </li> ))} </ul> </div> );
};

const formatDetailArmorClass = (acArray: MonsterDetail["armor_class"] | undefined): string => {
    if (!acArray || acArray.length === 0) return "N/A";
    const mainAcObj = Array.isArray(acArray) ? acArray[0] : acArray;
    if (typeof mainAcObj === 'object' && mainAcObj !== null && 'value' in mainAcObj && 'type' in mainAcObj) {
        const mainAc = mainAcObj as ArmorClass;
        let str = `${mainAc.value} (${mainAc.type})`;
        if (mainAc.desc) { str += ` - ${mainAc.desc}`; }
        return str;
    }
    return "N/A";
};


export function CombatTrackerDrawer(props: CombatTrackerDrawerProps) {
  const {
    open, onOpenChange, activeCampaign, activeCampaignParty = [], combatants = [],
    onAddCombatant, onAddCombatants, onRemoveCombatant, onUpdateCombatant, onEndCombat,
    rollLog = [], onInternalRoll, onClearRollLog
  } = props;

  const { toast } = useToast();
  const combatUniqueId = useId();
  const diceUniqueId = useId();

  const [isSecondaryPanelVisible, setIsSecondaryPanelVisible] = useState(false);
  const [secondaryPanelMode, setSecondaryPanelMode] = useState<'addCombatant' | 'diceRoller' | null>(null);

  // Dice Roller states
  const [diceInputValue, setDiceInputValue] = useState("");
  const [diceRollMode, setDiceRollMode] = useState<'normal' | 'advantage' | 'disadvantage'>("normal");

  // "Add Player Character" section states
  // SelectedPlayerToAdd and PlayerInitiativeInput are no longer needed here, handled by batch add

  // "Add Single/Group" & "Load Encounter" Tabs states
  const [addCombatantActiveTab, setAddCombatantActiveTab] = useState<'single-enemy' | 'load-encounter'>('single-enemy');
  const [newCombatantType, setNewCombatantType] = useState<'enemy' | 'player'>('enemy');
  const [enemyName, setEnemyName] = useState("");
  const [enemyAC, setEnemyAC] = useState<string>("");
  const [enemyHP, setEnemyHP] = useState<string>("");
  const [enemyInitiativeModifierInput, setEnemyInitiativeModifierInput] = useState<string>("0");
  const [enemyInitiativeInput, setEnemyInitiativeInput] = useState<string>("");
  const [enemyQuantityInput, setEnemyQuantityInput] = useState<string>("1");
  const [rollGroupInitiativeFlag, setRollGroupInitiativeFlag] = useState<boolean>(false);
  const [selectedMonsterIndexFromFavorite, setSelectedMonsterIndexFromFavorite] = useState<string | undefined>(undefined);
  const [isFavoriteMonsterDialogOpen, setIsFavoriteMonsterDialogOpen] = useState(false);
  const [favoritesList, setFavoritesList] = useState<FavoriteMonster[]>([]);

  const [savedEncountersForCombat, setSavedEncountersForCombat] = useState<SavedEncounter[]>([]);
  const [selectedSavedEncounterId, setSelectedSavedEncounterId] = useState<string | undefined>(undefined);
  const [isLoadingSavedEncounters, setIsLoadingSavedEncounters] = useState(false);

  // Combat Tracker display states
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number | null>(null);
  const [damageInputs, setDamageInputs] = useState<Record<string, string>>({});
  const [selectedCombatantId, setSelectedCombatantId] = useState<string | null>(null);

  const [combatantToDelete, setCombatantToDelete] = useState<Combatant | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const combatantRefs = useRef<Map<string, HTMLLIElement | null>>(new Map());

  const [isMonsterDetailDialogOpen, setIsMonsterDetailDialogOpen] = useState(false);
  const [selectedMonsterForDetailDialog, setSelectedMonsterForDetailDialog] = useState<Combatant | null>(null);
  const [fullEnemyDetailsCache, setFullEnemyDetailsCache] = useState<Record<string, MonsterDetail>>({});
  const [isLoadingFullEnemyDetailsFor, setIsLoadingFullEnemyDetailsFor] = useState<string | null>(null);

  const { savedEncountersUpdateKey } = useCampaign();

  const availablePartyMembers = activeCampaignParty
    ? activeCampaignParty.filter(p => !combatants.some(c => c.playerId === p.id))
    : [];


  useEffect(() => {
    if (!open) {
      setIsSecondaryPanelVisible(false);
      setSecondaryPanelMode(null);
      setCurrentTurnIndex(null);
      setSelectedCombatantId(null);
      setNewCombatantType('enemy');
      setEnemyName(""); setEnemyAC(""); setEnemyHP("");
      setEnemyInitiativeModifierInput("0"); setEnemyInitiativeInput(""); setEnemyQuantityInput("1");
      setRollGroupInitiativeFlag(false);
      setSelectedSavedEncounterId(undefined);
      setSelectedMonsterIndexFromFavorite(undefined);
    }
  }, [open]);


  useEffect(() => {
    if (isSecondaryPanelVisible && secondaryPanelMode === 'addCombatant' && addCombatantActiveTab === "load-encounter" && activeCampaign) {
      setIsLoadingSavedEncounters(true);
      try {
        const storageKey = `${SAVED_ENCOUNTERS_STORAGE_KEY_PREFIX}${typeof activeCampaign === 'string' ? activeCampaign : activeCampaign?.id}`;
        const storedEncounters = localStorage.getItem(storageKey);
        setSavedEncountersForCombat(storedEncounters ? JSON.parse(storedEncounters) : []);
      } catch (error) {
        console.error("Error loading saved encounters for combat tracker:", error);
        setSavedEncountersForCombat([]);
      }
      setIsLoadingSavedEncounters(false);
    }
  }, [isSecondaryPanelVisible, secondaryPanelMode, addCombatantActiveTab, activeCampaign, savedEncountersUpdateKey]);

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

  const handleDiceRoll = () => {
    const notationToParse = diceInputValue.trim() === "" ? "1d20" : diceInputValue.trim();
    const parsed = parseDiceNotation(notationToParse);
    
    onInternalRoll({
      inputText: notationToParse,
      resultText: "...",
      detailText: "Rolling...",
      isRolling: true,
    });

    setTimeout(() => {
      if (parsed.error) {
        onInternalRoll({ inputText: notationToParse, resultText: "Error", detailText: parsed.error, isRolling: false });
        return;
      }
      if (parsed.sides <= 0 || parsed.count <= 0) {
        onInternalRoll({ inputText: notationToParse, resultText: "Error", detailText: "Dice sides and count must be positive.", isRolling: false });
        return;
      }
      let finalResult: number; let resultRolls: number[] = []; let detailText = ""; let chosen: number | undefined = undefined;
      if (diceRollMode === "normal") {
        const { rolls, sum } = rollMultipleDice(parsed.count, parsed.sides); resultRolls = rolls; finalResult = sum + parsed.modifier;
        detailText = `Rolled ${parsed.count}d${parsed.sides}${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+" : "") + parsed.modifier : ""}: [${rolls.join(", ")}] ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+ " : "- ") + Math.abs(parsed.modifier) : ""} = ${finalResult}`;
      } else {
         if (parsed.count !== 1 || parsed.sides !== 20) {
            const { rolls, sum } = rollMultipleDice(parsed.count, parsed.sides); resultRolls = rolls; finalResult = sum + parsed.modifier;
            detailText = `Rolled ${parsed.count}d${parsed.sides}${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+" : "") + parsed.modifier : ""}: [${rolls.join(", ")}] ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+ " : "- ") + Math.abs(parsed.modifier) : ""} = ${finalResult} (Mode ignored for non-1d20)`;
        } else {
          const roll1Result = rollMultipleDice(1, 20); const roll2Result = rollMultipleDice(1, 20); const roll1 = roll1Result.sum; const roll2 = roll2Result.sum;
          if (diceRollMode === "advantage") { chosen = Math.max(roll1, roll2); } else { chosen = Math.min(roll1, roll2); }
          finalResult = chosen + parsed.modifier; resultRolls = [roll1, roll2];
          detailText = `Rolled 1d20 (${diceRollMode}) ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+" : "") + parsed.modifier : ""}: [${roll1 === chosen ? `**${roll1}**` : roll1}, ${roll2 === chosen ? `**${roll2}**` : roll2}] ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+ " : "- ") + Math.abs(parsed.modifier) : ""} = ${finalResult}`;
        }
      }
      onInternalRoll({ inputText: notationToParse, resultText: finalResult.toString(), detailText, isAdvantage: diceRollMode === "advantage", isDisadvantage: diceRollMode === "disadvantage", rolls: resultRolls, chosenRoll: chosen, modifier: parsed.modifier, sides: parsed.sides, isRolling: false });
    }, 500);
  };

  const handleRollAllPlayerInitiatives = () => {
    if (!activeCampaignParty || availablePartyMembers.length === 0) return;
    const newPlayerCombatants: Combatant[] = availablePartyMembers.map(player => ({
      id: `${combatUniqueId}-player-${player.id}-${Date.now()}`,
      name: player.name,
      initiative: rollDie(20) + (player.initiativeModifier ?? 0),
      type: 'player',
      color: player.color,
      playerId: player.id,
      ac: player.armorClass,
      hp: undefined, // Players track their own HP
      currentHp: undefined,
      tempHp: 0,
      initiativeModifier: player.initiativeModifier,
    }));
    onAddCombatants(newPlayerCombatants);
    if (currentTurnIndex === null && combatants.length + newPlayerCombatants.length > 0) setCurrentTurnIndex(0);
    setIsSecondaryPanelVisible(false); // Close panel after adding
    setSecondaryPanelMode(null);
  };


  const parseModifierString = (modStr: string): number => { const num = parseInt(modStr.trim()); return isNaN(num) ? 0 : num; };

  const handleSelectFavoriteMonsterForCombat = (fav: FavoriteMonster) => {
    setEnemyName(fav.name);
    setEnemyAC(fav.acValue !== undefined ? fav.acValue.toString() : "");
    setEnemyHP(fav.hpValue !== undefined ? fav.hpValue.toString() : "");
    setSelectedMonsterIndexFromFavorite(fav.index);
    setEnemyInitiativeModifierInput("0");
    setIsFavoriteMonsterDialogOpen(false);
  };

  const handleNewCombatantTypeToggle = (checked: boolean) => {
    setNewCombatantType(checked ? 'player' : 'enemy');
  };

  const handleAddSingleEnemyGroup = () => {
    if (!enemyName.trim()) { toast({ title: "Missing Name", description: "Please enter a name for the combatant.", variant: "destructive" }); return; }
    const quantity = parseInt(enemyQuantityInput) || 1; if (quantity <= 0) { toast({ title: "Invalid Quantity", variant: "destructive" }); return; }
    const acValue = enemyAC.trim() === "" ? undefined : parseInt(enemyAC);
    const hpValue = enemyHP.trim() === "" ? undefined : parseInt(enemyHP);
    const crValueString = favoritesList.find(f => f.index === selectedMonsterIndexFromFavorite)?.cr?.toString();
    
    if (enemyAC.trim() !== "" && (isNaN(acValue!) || acValue! < 0)) { toast({ title: "Invalid AC", variant: "destructive" }); return; }
    if (enemyHP.trim() !== "" && (isNaN(hpValue!) || hpValue! <= 0)) { toast({ title: "Invalid HP", variant: "destructive" }); return; }

    const initModValue = parseModifierString(enemyInitiativeModifierInput);
    const newCombatantsToAdd: Combatant[] = [];
    let groupInitiativeValue: number | undefined;

    const fixedInit = parseInt(enemyInitiativeInput.trim());
    const useFixedInit = enemyInitiativeInput.trim() !== "" && !isNaN(fixedInit);

    if (rollGroupInitiativeFlag && quantity > 1) {
      groupInitiativeValue = useFixedInit ? fixedInit : rollDie(20) + initModValue;
    } else if (quantity === 1 && useFixedInit) {
      groupInitiativeValue = fixedInit;
    }

    for (let i = 0; i < quantity; i++) {
      let initiativeValue: number;
      const currentCombatantName = quantity > 1 ? `${enemyName.trim()} ${i + 1}` : enemyName.trim();
      if (groupInitiativeValue !== undefined) {
        initiativeValue = groupInitiativeValue;
      } else {
        initiativeValue = rollDie(20) + initModValue;
      }
      newCombatantsToAdd.push({
        id: `${combatUniqueId}-${newCombatantType}-${Date.now()}-${i}`, name: currentCombatantName, initiative: initiativeValue,
        type: newCombatantType,
        ac: acValue, hp: hpValue, currentHp: hpValue, tempHp: 0, cr: crValueString,
        initiativeModifier: initModValue, monsterIndex: selectedMonsterIndexFromFavorite
      });
    }
    onAddCombatants(newCombatantsToAdd);
    if (currentTurnIndex === null && (combatants.length > 0 || newCombatantsToAdd.length > 0)) setCurrentTurnIndex(0);
    // Reset form fields
    setEnemyName(""); setEnemyAC(""); setEnemyHP("");
    setEnemyInitiativeModifierInput("0"); setEnemyInitiativeInput(""); setEnemyQuantityInput("1");
    setRollGroupInitiativeFlag(false);
    setSelectedMonsterIndexFromFavorite(undefined);
  };

  const handleRollEnemyInitiative = () => {
    setEnemyInitiativeInput((rollDie(20) + parseModifierString(enemyInitiativeModifierInput)).toString());
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

  useEffect(() => {
    if (currentTurnIndex !== null && combatants && combatants.length > 0 && combatants[currentTurnIndex]) {
        const activeCombatantId = combatants[currentTurnIndex]?.id;
        if (activeCombatantId) {
            const activeElement = combatantRefs.current.get(activeCombatantId);
            activeElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }
  }, [currentTurnIndex, combatants]);

  const handleDamageInputChange = (combatantId: string, value: string) => setDamageInputs(prev => ({ ...prev, [combatantId]: value }));

  const handleApplyDamage = (combatantId: string, type: 'damage' | 'heal') => {
    const amountStr = damageInputs[combatantId]; if (!amountStr) return; const amount = parseInt(amountStr); if (isNaN(amount) || amount <= 0) return;
    const combatant = combatants.find(c => c.id === combatantId); if (!combatant) return;
    let newCurrentHp = combatant.currentHp ?? combatant.hp ?? 0; let newTempHp = combatant.tempHp ?? 0; const updates: Partial<Combatant> = {};
    if (type === 'damage') {
      if (newTempHp > 0) { const damageToTemp = Math.min(amount, newTempHp); newTempHp -= damageToTemp; updates.tempHp = newTempHp; const remainingDamage = amount - damageToTemp; if (remainingDamage > 0) { newCurrentHp = Math.max(0, newCurrentHp - remainingDamage); } }
      else { newCurrentHp = Math.max(0, newCurrentHp - amount); }
    } else if (type === 'heal') { if (combatant.hp !== undefined) { newCurrentHp = Math.min(combatant.hp, newCurrentHp + amount); } else { newCurrentHp += amount; } }
    updates.currentHp = newCurrentHp; onUpdateCombatant(combatantId, updates); setDamageInputs(prev => ({ ...prev, [combatantId]: "" }));
  };

  const handleAddTempHp = (combatantId: string) => {
    const amountStr = damageInputs[combatantId]; if (!amountStr) return; const amount = parseInt(amountStr); if (isNaN(amount) || amount < 0) { toast({ title: "Invalid Amount", variant: "destructive"}); return; }
    const currentCombatant = combatants.find(c => c.id === combatantId);
    if (currentCombatant) {
      onUpdateCombatant(combatantId, { tempHp: Math.max(amount, currentCombatant.tempHp || 0) });
    }
    setDamageInputs(prev => ({ ...prev, [combatantId]: "" }));
  };

  const handleOpenDeleteConfirm = (combatant: Combatant) => { setCombatantToDelete(combatant); setIsDeleteConfirmOpen(true); };
  const handleConfirmDeleteCombatant = () => {
    if (!combatantToDelete) return; const id = combatantToDelete.id;
    const combatantIndex = combatants.findIndex(c => c.id === id);
    onRemoveCombatant(id);
    if (combatants.length -1 === 0) {
      setCurrentTurnIndex(null);
    } else if (currentTurnIndex !== null) {
      if(combatantIndex < currentTurnIndex) {
        setCurrentTurnIndex(currentTurnIndex - 1);
      } else if (combatantIndex === currentTurnIndex && combatants.length -1 > 0) {
        setCurrentTurnIndex(currentTurnIndex % (combatants.length -1));
      } else if (currentTurnIndex >= combatants.length -1 && combatants.length -1 > 0) {
        setCurrentTurnIndex(combatants.length - 2);
      }
    }
    if (selectedCombatantId === id) setSelectedCombatantId(null);
    if (isLoadingFullEnemyDetailsFor === id) setIsLoadingFullEnemyDetailsFor(null);
    if (selectedMonsterForDetailDialog?.id === id) {
        setSelectedMonsterForDetailDialog(null);
        setIsMonsterDetailDialogOpen(false);
    }
    setIsDeleteConfirmOpen(false); setCombatantToDelete(null);
  };

  const nextTurn = () => { if (!combatants || combatants.length === 0 || currentTurnIndex === null) return; setCurrentTurnIndex((currentTurnIndex + 1) % combatants.length); };
  const prevTurn = () => { if (!combatants || combatants.length === 0 || currentTurnIndex === null) return; setCurrentTurnIndex((currentTurnIndex - 1 + combatants.length) % combatants.length); };

  const handleEndCombatLocal = () => {
    onEndCombat();
    setCurrentTurnIndex(null);
    setSelectedCombatantId(null);
    setDamageInputs({});
    setIsSecondaryPanelVisible(false);
    setSecondaryPanelMode(null);
    setNewCombatantType('enemy');
    setEnemyName(""); setEnemyAC(""); setEnemyHP("");
    setEnemyInitiativeModifierInput("0"); setEnemyInitiativeInput(""); setEnemyQuantityInput("1");
    setRollGroupInitiativeFlag(false);
    setSelectedMonsterIndexFromFavorite(undefined);
    setSelectedSavedEncounterId(undefined);
  };

  const handleCombatantCardClick = (combatant: Combatant) => {
    setSelectedCombatantId(prevId => {
      if (prevId === combatant.id) {
        return null;
      }
      return combatant.id;
    });
    if (selectedMonsterForDetailDialog && selectedMonsterForDetailDialog.id !== combatant.id) {
        setIsMonsterDetailDialogOpen(false);
    }
  };

  const fetchFullEnemyDetails = useCallback(async (combatant: Combatant) => {
    if (!combatant.monsterIndex) {
      toast({title: "No API Data", description: "This combatant was manually added or has no API link.", variant: "default"});
      setSelectedMonsterForDetailDialog(combatant);
      setIsMonsterDetailDialogOpen(true);
      return;
    }
    if (fullEnemyDetailsCache[combatant.monsterIndex]) {
      setSelectedMonsterForDetailDialog(combatant);
      setIsMonsterDetailDialogOpen(true);
      return;
    }
    setIsLoadingFullEnemyDetailsFor(combatant.id);
    setSelectedMonsterForDetailDialog(combatant);
    setIsMonsterDetailDialogOpen(true);
    try {
      const response = await fetch(`${DND5E_API_BASE_URL}/api/monsters/${combatant.monsterIndex}`);
      if (!response.ok) throw new Error(`Failed to fetch details for ${combatant.name}`);
      const data: MonsterDetail = await response.json();
      setFullEnemyDetailsCache(prev => ({ ...prev, [combatant.monsterIndex!]: {...data, source: 'api'} }));
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error Loading Details", description: `Could not load API details for ${combatant.name}. ${err.message}`, variant: "destructive" });
    } finally {
      setIsLoadingFullEnemyDetailsFor(null);
    }
  }, [fullEnemyDetailsCache, toast]);

  const handleOpenMonsterDetailDialog = (combatant: Combatant) => {
    if (combatant.type === 'enemy') {
        if (selectedMonsterForDetailDialog?.id === combatant.id && isMonsterDetailDialogOpen) {
             setIsMonsterDetailDialogOpen(false);
        } else {
            fetchFullEnemyDetails(combatant);
        }
    }
  };

  const handleToggleSecondaryPanel = (mode: 'addCombatant' | 'diceRoller') => {
    if (isSecondaryPanelVisible && secondaryPanelMode === mode) {
      setIsSecondaryPanelVisible(false);
      setSecondaryPanelMode(null);
    } else {
      setSecondaryPanelMode(mode);
      setIsSecondaryPanelVisible(true);
    }
  };

  const enemyQuantityNum = parseInt(enemyQuantityInput) || 1;
  const isGroupSwitchDisabled = enemyQuantityNum <= 1;
  useEffect(() => {
    if (isGroupSwitchDisabled && rollGroupInitiativeFlag) {
      setRollGroupInitiativeFlag(false);
    }
  }, [isGroupSwitchDisabled, rollGroupInitiativeFlag]);


  const currentEnemyInitMod = parseModifierString(enemyInitiativeModifierInput);
  const enemyInitiativeButtonText = `d20${currentEnemyInitMod !== 0 ? (currentEnemyInitMod > 0 ? ` + ${currentEnemyInitMod}` : ` - ${Math.abs(currentEnemyInitMod)}`) : ''}`;


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
            "flex flex-col p-0 overflow-hidden sm:max-w-none",
            isSecondaryPanelVisible ? COMBINED_SHEET_WIDTH_CLASS : PRIMARY_SHEET_WIDTH_CLASS
        )}
        hideCloseButton={true}
      >
        <div className="relative h-full pr-8">
          <div className="flex flex-row h-full">
            {/* Secondary Panel (Left - Add Combatant / Dice Roller) */}
            {isSecondaryPanelVisible && (
              <div className={cn(SECONDARY_PANEL_CLASS, "h-full flex flex-col border-r bg-card flex-shrink-0")}>
                <SheetHeader className="p-3 flex items-center justify-between sticky top-0 z-10 shrink-0 bg-primary text-primary-foreground">
                    <SheetTitle className="text-lg font-semibold text-primary-foreground">
                        {secondaryPanelMode === 'addCombatant' ? 'Add to Combat' : 'Dice Roller'}
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1">
                  {secondaryPanelMode === 'addCombatant' && (
                    <div className="p-4 space-y-4">
                      <Accordion type="single" collapsible className="w-full" defaultValue="add-players">
                        <AccordionItem value="add-players">
                          <AccordionTrigger className="text-base font-medium hover:no-underline">
                            <div className="flex items-center"><UsersIcon className="mr-2 h-4 w-4"/>Add Player Character</div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-3 space-y-3">
                            {availablePartyMembers.length > 0 ? (
                                <>
                                    <p className="text-sm text-muted-foreground">Select players to add:</p>
                                    <ScrollArea className="max-h-40 border rounded-md">
                                        {activeCampaignParty.map(player => {
                                            const isInCombat = combatants.some(c => c.playerId === player.id);
                                            return (
                                                <div key={player.id} className={cn("p-2 text-sm flex justify-between items-center", isInCombat ? "opacity-50" : "hover:bg-accent")}>
                                                   <div>
                                                        <p className="font-medium">{player.name}</p>
                                                        <p className="text-xs text-muted-foreground">Lvl {player.level} {player.race} {player.class} (Init Mod: {player.initiativeModifier !== undefined ? (player.initiativeModifier >= 0 ? `+${player.initiativeModifier}` : player.initiativeModifier) : '+0'})</p>
                                                    </div>
                                                    {isInCombat && <Badge variant="secondary" className="text-xs">In Combat</Badge>}
                                                </div>
                                            );
                                        })}
                                    </ScrollArea>
                                    <Button onClick={handleRollAllPlayerInitiatives} className="w-full mt-2" variant="outline" disabled={availablePartyMembers.length === 0}>
                                        <Dice5 className="mr-2 h-4 w-4" /> Add All Players & Roll Initiatives
                                    </Button>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-2">
                                    {activeCampaignParty.length === 0 ? "No players in active party." : "All party members are in combat."}
                                </p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <Tabs defaultValue="single-enemy" className="flex flex-col flex-grow" onValueChange={(value) => setAddCombatantActiveTab(value as 'single-enemy' | 'load-encounter')}>
                        <TabsList className="grid w-full grid-cols-2 shrink-0">
                          <TabsTrigger value="single-enemy">Single/Group</TabsTrigger>
                          <TabsTrigger value="load-encounter" disabled={!activeCampaign}>Load Encounter</TabsTrigger>
                        </TabsList>

                        <TabsContent value="single-enemy" className="mt-4 space-y-3 flex-grow flex flex-col">
                           <div className="space-y-3 flex-grow">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="combatant-name-input">Combatant Name</Label>
                              <Dialog open={isFavoriteMonsterDialogOpen} onOpenChange={setIsFavoriteMonsterDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <Star className="h-4 w-4 text-amber-400 hover:text-amber-500"/>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md min-h-[480px] flex flex-col">
                                  <DialogHeader className="bg-primary text-primary-foreground p-4 rounded-t-md -mx-6 -mt-0 mb-4">
                                    <DialogTitle className="text-primary-foreground">Select Favorite Monster</DialogTitle>
                                    <DialogDescription className="text-primary-foreground/80">Choose from your Monster Mash favorites.</DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="mt-4 flex-grow">
                                      {favoritesList.length === 0 ? (<p className="text-muted-foreground text-center py-4">No favorites found.</p>) : (<ul className="space-y-2">{favoritesList.map(fav => (<li key={fav.index}><Button variant="outline" className="w-full justify-start" onClick={() => handleSelectFavoriteMonsterForCombat(fav)}>{fav.name} (CR: {formatCRDisplay(fav.cr)})</Button></li>))}</ul>)}
                                  </ScrollArea>
                                  <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose></DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                            <Input id="combatant-name-input" value={enemyName} onChange={(e) => setEnemyName(e.target.value)} />
                            
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="combatant-type-toggle"
                                checked={newCombatantType === 'player'}
                                onCheckedChange={handleNewCombatantTypeToggle}
                              />
                              <Label
                                htmlFor="combatant-type-toggle"
                                className={cn(newCombatantType === 'player' ? 'text-green-600' : 'text-destructive')}
                              >
                                {newCombatantType === 'player' ? 'Friendly' : 'Enemy'}
                              </Label>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div><Label htmlFor="enemy-ac-input">AC</Label><Input id="enemy-ac-input" type="number" value={enemyAC} onChange={(e) => setEnemyAC(e.target.value)} /></div>
                              <div><Label htmlFor="enemy-hp-input">HP</Label><Input id="enemy-hp-input" type="number" value={enemyHP} onChange={(e) => setEnemyHP(e.target.value)} /></div>
                            </div>
                            <div><Label htmlFor="enemy-init-mod-input">Init. Mod.</Label><Input id="enemy-init-mod-input" value={enemyInitiativeModifierInput} onChange={(e) => setEnemyInitiativeModifierInput(e.target.value)} /></div>
                            
                            <div className="flex items-end gap-3">
                                <div className="w-20"><Label htmlFor="enemy-quantity-input">Quantity</Label><Input id="enemy-quantity-input" type="number" value={enemyQuantityInput} onChange={(e) => setEnemyQuantityInput(e.target.value)} min="1" /></div>
                                <div className="flex items-center space-x-2 pb-1">
                                  <Switch id="roll-group-initiative-flag" checked={rollGroupInitiativeFlag} onCheckedChange={setRollGroupInitiativeFlag} disabled={isGroupSwitchDisabled}/>
                                  <Label htmlFor="roll-group-initiative-flag" className="cursor-pointer text-sm">Group</Label>
                                </div>
                            </div>
                            <div>
                              <Label htmlFor="enemy-initiative-val-input">Initiative</Label>
                              <div className="flex gap-2 items-center">
                                  <Input id="enemy-initiative-val-input" className="w-24 h-9 text-sm" value={enemyInitiativeInput} onChange={(e) => setEnemyInitiativeInput(e.target.value)} type="number" disabled={(parseInt(enemyQuantityInput) || 1) > 1 && !rollGroupInitiativeFlag} />
                                  <Button variant="outline" size="icon" className="shrink-0 h-9 w-auto px-2" onClick={handleRollEnemyInitiative} disabled={(parseInt(enemyQuantityInput) || 1) > 1 && !rollGroupInitiativeFlag} title={`Roll ${enemyInitiativeButtonText}`}>
                                    <Dice5 className="h-4 w-4" />
                                    {currentEnemyInitMod !== 0 && (
                                      <span className="ml-1 text-xs">
                                        {currentEnemyInitMod > 0 ? `+${currentEnemyInitMod}` : currentEnemyInitMod}
                                      </span>
                                    )}
                                  </Button>
                              </div>
                            </div>
                           </div>
                           <Button onClick={handleAddSingleEnemyGroup} disabled={!enemyName.trim()} className="w-full shrink-0 mt-auto bg-primary hover:bg-primary/90">
                                {((parseInt(enemyQuantityInput) || 1) > 1 && !rollGroupInitiativeFlag) && <Dice5 className="mr-2 h-4 w-4"/>}
                                {((parseInt(enemyQuantityInput) || 1) > 1 && !rollGroupInitiativeFlag) ? "Add & Roll Individually" : "Add to Combat"}
                            </Button>
                        </TabsContent>

                        <TabsContent value="load-encounter" className="pt-0 flex-grow flex flex-col min-h-0">
                          {isLoadingSavedEncounters ? <div className="flex items-center justify-center h-32 flex-grow"><Loader2 className="h-6 w-6 animate-spin" /></div>
                          : savedEncountersForCombat.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4 flex-grow flex items-center justify-center">No saved encounters found.</p>
                          : <>
                              <div className="shrink-0">
                                <Label htmlFor="saved-encounter-select">Select Saved Encounter</Label>
                                <Select value={selectedSavedEncounterId || ""} onValueChange={setSelectedSavedEncounterId}>
                                  <SelectTrigger id="saved-encounter-select"><SelectValue placeholder="Choose an encounter..." /></SelectTrigger>
                                  <SelectContent>{savedEncountersForCombat.map(enc => (<SelectItem key={enc.id} value={enc.id}>{enc.title}</SelectItem>))}</SelectContent>
                                </Select>
                              </div>
                              {selectedEncounterDetails &&
                                <div className="mt-2 flex-grow flex flex-col min-h-0">
                                  <Label className="font-medium shrink-0">Monsters in "{selectedEncounterDetails.title}":</Label>
                                  <ScrollArea className="mt-1 border rounded-md p-2 bg-muted/30 flex-grow">
                                    <ul className="text-sm space-y-1">
                                      {selectedEncounterDetails.monsters.map(monster => (
                                        <li key={monster.id}>{monster.name} (x{monster.quantity})
                                          <span className="text-xs text-muted-foreground ml-1">
                                            {monster.cr && `CR:${formatCRDisplay(monster.cr)} `}
                                            {monster.ac && `AC:${monster.ac} `}
                                            {monster.hp && `HP:${monster.hp}`}
                                            {monster.initiativeModifier !== undefined && ` Init Mod:${monster.initiativeModifier >=0 ? '+' : ''}${monster.initiativeModifier}`}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </ScrollArea>
                                </div>
                              }
                              <Button onClick={handleLoadSavedEncounterToCombat} disabled={!selectedSavedEncounterId} className="w-full shrink-0 mt-auto bg-primary hover:bg-primary/90">
                                <FolderOpen className="mr-2 h-4 w-4"/> Add Encounter to Combat
                              </Button>
                            </>}
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                  {secondaryPanelMode === 'diceRoller' && (
                     <div className="p-4 space-y-4 h-full flex flex-col">
                      <div>
                        <Label htmlFor="dice-notation">Dice Notation</Label>
                        <Input id="dice-notation" value={diceInputValue} onChange={(e) => setDiceInputValue(e.target.value)} placeholder="e.g., 2d6+3" />
                      </div>
                      <div>
                        <Label>Roll Mode</Label>
                        <Tabs defaultValue="normal" value={diceRollMode} onValueChange={(value) => setDiceRollMode(value as 'normal' | 'advantage' | 'disadvantage')} className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="normal">Normal</TabsTrigger>
                            <TabsTrigger value="advantage">Advantage</TabsTrigger>
                            <TabsTrigger value="disadvantage">Disadvantage</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      <Button onClick={handleDiceRoll} className={cn("w-full", diceRollMode === "advantage" && "border-2 border-green-500 hover:border-green-600", diceRollMode === "disadvantage" && "border-2 border-red-500 hover:border-red-600")}>
                          {diceInputValue.trim() === "" ? <Dice5 className="mr-2 h-5 w-5" /> : <Zap className="mr-2 h-5 w-5" />}
                          {diceInputValue.trim() === "" ? "Roll d20" : "Roll"}
                      </Button>
                      <div className="flex-grow flex flex-col min-h-0">
                          <div className="flex justify-between items-center mb-1 shrink-0">
                            <Label>Roll Log</Label>
                            <Button variant="ghost" size="sm" onClick={onClearRollLog} className="text-xs text-muted-foreground hover:text-foreground"><XCircle className="mr-1 h-3 w-3" /> Clear Log</Button>
                          </div>
                          <ScrollArea className="border rounded-md p-2 flex-grow bg-muted/30 h-full">
                              {rollLog.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No rolls yet.</p>}
                              <div className="space-y-3">
                                {rollLog.map(entry => (
                                  <div key={entry.id} className={cn("text-sm p-2 rounded-md bg-background shadow-sm", entry.isRolling ? "opacity-50" : "animate-in slide-in-from-top-2 fade-in duration-300")}>
                                    {entry.isRolling ? (
                                      <div className="flex items-center h-10">
                                        <Dice5 className="h-6 w-6 animate-spin text-primary" />
                                        <span className="ml-2 text-lg font-semibold text-primary">Rolling...</span>
                                      </div>
                                    ) : ( <>
                                        <p className="text-2xl font-bold text-primary">{entry.resultText}</p>
                                        <p className="text-xs text-muted-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: (entry.detailText as string).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                          </ScrollArea>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}

            {/* Primary Panel (Right - Combat Order List) */}
            <div className={cn(PRIMARY_PANEL_CLASS, "h-full flex flex-col bg-sidebar-background flex-shrink-0")}>
              <SheetHeader className="bg-primary text-primary-foreground p-3 flex flex-row items-center justify-between shrink-0 sticky top-0 z-10">
                <SheetTitle className="text-lg font-semibold flex items-center text-primary-foreground"><Swords className="mr-2 h-5 w-5"/>Combat Tracker</SheetTitle>
              </SheetHeader>

              <div className="p-4 flex flex-col flex-grow min-h-0">
                  <div className="flex items-center gap-2 mb-3 shrink-0">
                      <Button
                          onClick={() => handleToggleSecondaryPanel('addCombatant')}
                          variant={isSecondaryPanelVisible && secondaryPanelMode === 'addCombatant' ? "default" : "outline"}
                          size="sm"
                          className={cn(
                              "flex-1",
                              isSecondaryPanelVisible && secondaryPanelMode === 'addCombatant' ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90" : "text-primary-foreground border-primary-foreground/50 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                          )}
                      >
                          <UserPlus className="mr-1.5 h-4 w-4"/> Add Combatant
                      </Button>
                      <Button
                          onClick={() => handleToggleSecondaryPanel('diceRoller')}
                          variant={isSecondaryPanelVisible && secondaryPanelMode === 'diceRoller' ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "flex-1",
                            isSecondaryPanelVisible && secondaryPanelMode === 'diceRoller' ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90" : "text-primary-foreground border-primary-foreground/50 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                          )}
                      >
                          <Dice5 className="mr-1.5 h-4 w-4"/>Dice Roller
                      </Button>
                  </div>

                  <div className="flex flex-col flex-grow min-h-0">
                    <Label className="mb-1 shrink-0 text-sidebar-foreground/80">Combat Order (Highest to Lowest)</Label>
                    <ScrollArea className="border border-sidebar-border rounded-md p-1 flex-grow bg-secondary h-full">
                        {combatants.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No combatants yet.</p>}
                        <ul className="space-y-1.5">
                        {combatants.map((c, index) => (
                            <li key={c.id} ref={(el) => combatantRefs.current.set(c.id, el)}
                                className={cn("p-2.5 rounded-md flex flex-col gap-1.5 transition-all shadow-sm bg-card",
                                    currentTurnIndex === index ? 'ring-2 ring-primary' : '',
                                    selectedCombatantId === c.id && currentTurnIndex !== index && 'ring-2 ring-blue-500'
                                )}
                                style={c.type === 'player' && c.color ? { borderLeft: `4px solid ${c.color}` } : {}}
                                onClick={() => handleCombatantCardClick(c)}
                            >
                              <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center flex-1">
                                      <span className={cn("font-bold text-lg mr-3", currentTurnIndex === index ? 'text-primary' : (c.type === 'enemy' ? 'text-destructive' : 'text-card-foreground'))}>{c.initiative}</span>
                                      <div>
                                        <p className={cn("font-medium",
                                          c.type === 'enemy' && 'text-destructive',
                                          currentTurnIndex === index && 'text-primary'
                                        )}>{c.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          AC: {c.ac ?? 'N/A'} | HP: {c.currentHp ?? c.hp ?? 'N/A'}{c.hp !== undefined ? `/${c.hp}` : ''}
                                          {c.tempHp !== undefined && c.tempHp > 0 && <span className="text-blue-500 font-semibold"> (+{c.tempHp} Temp)</span>}
                                        </p>
                                      </div>
                                  </div>
                                  {c.type === 'enemy' && c.monsterIndex && (<Button variant="ghost" size="icon" className="h-7 w-7 ml-auto" onClick={(e) => { e.stopPropagation(); handleOpenMonsterDetailDialog(c); }}><BookOpen className="h-4 w-4 text-muted-foreground" /></Button>)}
                              </div>
                              {(c.type === 'enemy' || (c.type === 'player' && c.hp !== undefined)) && c.hp !== undefined && c.hp > 0 && c.currentHp !== undefined && (
                                <div className={cn("mt-1 rounded-full", c.tempHp && c.tempHp > 0 && "ring-1 ring-blue-500 ring-offset-1 ring-offset-card p-px")}>
                                  <Progress value={Math.max(0, (c.currentHp / c.hp) * 100)} className={cn("h-1.5 [&>div]:rounded-full", c.type === 'enemy' ? "[&>div]:bg-destructive" : "[&>div]:bg-green-500")} />
                                </div>
                              )}

                              {c.id === selectedCombatantId && (c.type === 'enemy' || c.hp !== undefined) && c.currentHp !== undefined && c.currentHp > 0 && (
                                <div className="flex items-center justify-center gap-1.5 pt-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleOpenDeleteConfirm(c);}} title="Remove Combatant"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    <Button size="sm" variant="outline" className="px-2 py-1 h-8 text-xs border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleApplyDamage(c.id, 'damage'); }}><Swords className="mr-1 h-3 w-3" /> Hit</Button>
                                    <Input type="number" className="h-8 text-sm w-20 px-2 py-1" value={damageInputs[c.id] || ""} onChange={(e) => handleDamageInputChange(c.id, e.target.value)} onClick={(e) => e.stopPropagation()} min="1" />
                                    <Button size="sm" variant="outline" className="px-2 py-1 h-8 text-xs border-green-600 text-green-600 hover:bg-green-500/10 hover:text-green-700" onClick={(e) => { e.stopPropagation(); handleApplyDamage(c.id, 'heal'); }}><Bandage className="mr-1 h-3 w-3" /> Heal</Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleAddTempHp(c.id);}} title="Add Temporary HP"><Shield className="h-4 w-4 text-blue-500"/></Button>
                                </div> )}
                              {(c.type === 'enemy' || c.hp !== undefined) && c.currentHp !== undefined && c.currentHp <= 0 && (<Button variant="destructive" className="w-full mt-1.5 py-1 h-auto text-sm" onClick={(e) => { e.stopPropagation(); handleOpenDeleteConfirm(c); }}><Skull className="mr-2 h-4 w-4" /> Dead (Remove)</Button>)}
                            </li> ))}
                        </ul>
                    </ScrollArea>
                    <div className="mt-2 shrink-0 space-y-2">
                        {combatants.length > 0 && (
                        <div className="flex gap-2">
                            <Button onClick={prevTurn} variant="outline" className="flex-1 text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">Prev Turn</Button>
                            <Button onClick={nextTurn} className="flex-1 bg-primary hover:bg-primary/90">Next Turn</Button>
                        </div>
                        )}
                        <Button onClick={handleEndCombatLocal} variant="destructive" size="sm" className="w-full" disabled={combatants.length === 0}>
                            <XCircle className="mr-1.5 h-4 w-4"/>End Combat
                        </Button>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            onOpenChange(false);
            setIsSecondaryPanelVisible(false);
            setSecondaryPanelMode(null);
          }}
          className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[70]"
          aria-label="Close DM Tools"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </SheetContent>

      {/* Monster Detail Dialog (used by BookOpen icon in combatant list) */}
      <Dialog open={isMonsterDetailDialogOpen} onOpenChange={setIsMonsterDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMonsterForDetailDialog?.name || "Monster Details"}</DialogTitle>
            {selectedMonsterForDetailDialog?.cr && <DialogDescription>CR: {formatCRDisplay(selectedMonsterForDetailDialog.cr)}</DialogDescription>}
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            {isLoadingFullEnemyDetailsFor === selectedMonsterForDetailDialog?.id ? (
              <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : selectedMonsterForDetailDialog?.monsterIndex && fullEnemyDetailsCache[selectedMonsterForDetailDialog.monsterIndex] ? (
              (() => {
                const detail = fullEnemyDetailsCache[selectedMonsterForDetailDialog.monsterIndex!];
                return (<div className="space-y-3 text-sm py-4">
                    <p className="text-sm text-muted-foreground">{detail.size} {detail.type} {detail.subtype ? `(${detail.subtype})` : ''}, {detail.alignment}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs border p-2 rounded-md bg-background">
                      <div><strong>AC:</strong> {formatDetailArmorClass(detail.armor_class)}</div>
                      <div><strong>HP:</strong> {detail.hit_points} {detail.hit_dice ? `(${detail.hit_dice})` : ''}</div>
                      <div><strong>CR:</strong> {formatCRDisplay(detail.challenge_rating as number | string)} {detail.xp ? `(${detail.xp} XP)` : ''}</div>
                    </div>
                    <div><strong>Speed:</strong> {typeof detail.speed === 'string' ? detail.speed : detail.speed ? Object.entries(detail.speed).map(([key, val]) => `${key} ${val}`).join(', ') : 'N/A'}</div>
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-xs border p-2 rounded-md bg-background">
                        <div className="text-center"><strong>STR</strong><br/>{detail.strength ?? 'N/A'} ({detail.strength ? Math.floor((detail.strength - 10) / 2) : 'N/A'})</div>
                        <div className="text-center"><strong>DEX</strong><br/>{detail.dexterity ?? 'N/A'} ({detail.dexterity ? Math.floor((detail.dexterity - 10) / 2) : 'N/A'})</div>
                        <div className="text-center"><strong>CON</strong><br/>{detail.constitution ?? 'N/A'} ({detail.constitution ? Math.floor((detail.constitution - 10) / 2) : 'N/A'})</div>
                        <div className="text-center"><strong>INT</strong><br/>{detail.intelligence ?? 'N/A'} ({detail.intelligence ? Math.floor((detail.intelligence - 10) / 2) : 'N/A'})</div>
                        <div className="text-center"><strong>WIS</strong><br/>{detail.wisdom ?? 'N/A'} ({detail.wisdom ? Math.floor((detail.wisdom - 10) / 2) : 'N/A'})</div>
                        <div className="text-center"><strong>CHA</strong><br/>{detail.charisma ?? 'N/A'} ({detail.charisma ? Math.floor((detail.charisma - 10) / 2) : 'N/A'})</div>
                    </div>
                    {detail.proficiencies?.length > 0 && (<div><strong>Saving Throws & Skills:</strong> {detail.proficiencies.map(p => `${p.proficiency.name.replace("Saving Throw: ", "").replace("Skill: ", "")} +${p.value}`).join(', ')}</div>)}
                    {typeof detail.damage_vulnerabilities === 'string' && detail.damage_vulnerabilities.length > 0 ? <div><strong>Vulnerabilities:</strong> {detail.damage_vulnerabilities}</div> : Array.isArray(detail.damage_vulnerabilities) && detail.damage_vulnerabilities.length > 0 && <div><strong>Vulnerabilities:</strong> {detail.damage_vulnerabilities.join(', ')}</div>}
                    {typeof detail.damage_resistances === 'string' && detail.damage_resistances.length > 0 ? <div><strong>Resistances:</strong> {detail.damage_resistances}</div> : Array.isArray(detail.damage_resistances) && detail.damage_resistances.length > 0 && <div><strong>Resistances:</strong> {detail.damage_resistances.join(', ')}</div>}
                    {typeof detail.damage_immunities === 'string' && detail.damage_immunities.length > 0 ? <div><strong>Immunities:</strong> {detail.damage_immunities}</div> : Array.isArray(detail.damage_immunities) && detail.damage_immunities.length > 0 && <div><strong>Immunities:</strong> {detail.damage_immunities.join(', ')}</div>}
                    {detail.condition_immunities && (typeof detail.condition_immunities === 'string' ? detail.condition_immunities.length > 0 : (Array.isArray(detail.condition_immunities) && detail.condition_immunities.length > 0)) && <div><strong>Condition Immunities:</strong> {(Array.isArray(detail.condition_immunities) && detail.condition_immunities.length > 0 && typeof detail.condition_immunities[0] !== 'string') ? (detail.condition_immunities as { index: string; name: string; url: string }[]).map(ci => ci.name).join(', ') : (Array.isArray(detail.condition_immunities) ? detail.condition_immunities.join(', ') : detail.condition_immunities) }</div>}
                    <div><strong>Senses:</strong> {typeof detail.senses === 'string' ? detail.senses : detail.senses ? Object.entries(detail.senses).map(([key, val]) => `${key.replace("_", " ")} ${val}`).join(', ') : 'N/A'}</div>
                    <div><strong>Languages:</strong> {detail.languages || "None"}</div>

                    {renderDetailActions(detail.special_abilities, "Special Abilities")}
                    {renderDetailActions(detail.actions, "Actions")}
                    {renderDetailActions(detail.legendary_actions, "Legendary Actions")}

                    {detail.image && (<div className="mt-2"><Image src={detail.source === 'api' ? `${DND5E_API_BASE_URL}${detail.image}` : detail.image} alt={detail.name} width={300} height={300} className="rounded-md border object-contain mx-auto" data-ai-hint={`${detail.type || 'monster'} image`}/></div>)}
                </div>);
              })()
            ) : selectedMonsterForDetailDialog?.monsterIndex ? (
              <p className="text-sm text-muted-foreground py-4">Could not load details for {selectedMonsterForDetailDialog.name}.</p>
            ) : (
              <p className="text-sm text-muted-foreground py-4">No detailed API data available for this manually added combatant.</p>
            )}
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Combatant Confirmation Dialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
            <UIAlertDialogHeader>
                <UIAlertDialogTitle>Remove Combatant?</UIAlertDialogTitle>
                <AlertDialogDescription>Are you sure you want to remove "{combatantToDelete?.name}" from the combat?</AlertDialogDescription>
            </UIAlertDialogHeader>
            <UIAlertDialogFooter>
                <AlertDialogCancel onClick={() => { setIsDeleteConfirmOpen(false); setCombatantToDelete(null); }}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDeleteCombatant} className={cn(buttonVariants({variant: 'destructive'}))}>Remove</AlertDialogAction>
            </UIAlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
    