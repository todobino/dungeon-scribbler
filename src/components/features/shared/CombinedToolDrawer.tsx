
"use client";

import { useState, useEffect, useId, useRef, useCallback } from "react";
import { Sheet, SheetContent, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

import { Dice5, Zap, Trash2, ChevronRight, PlusCircle, UserPlus, Users, ArrowRight, ArrowLeft, XCircle, Skull, Loader2, Swords, FolderOpen, MinusCircle, BookOpen, Star, Bandage, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { parseDiceNotation, rollMultipleDice, rollDie } from "@/lib/dice-utils";
import type { PlayerCharacter, Combatant, RollLogEntry, SavedEncounter, EncounterMonster, FavoriteMonster, MonsterDetail, ArmorClass, SpecialAbility, MonsterAction, LegendaryAction } from "@/lib/types";
import { useCampaign } from "@/contexts/campaign-context";
import { DICE_ROLLER_TAB_ID, COMBAT_TRACKER_TAB_ID, SAVED_ENCOUNTERS_STORAGE_KEY_PREFIX, MONSTER_MASH_FAVORITES_STORAGE_KEY, DND5E_API_BASE_URL } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCRDisplay } from "@/components/features/monster-mash/MonsterMashDrawer"; // Assuming this is exported
import { useToast } from "@/hooks/use-toast";


interface CombinedToolDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab: string;
  // Dice Roller Props
  rollLog: RollLogEntry[];
  onInternalRoll: (rollData: Omit<RollLogEntry, 'id' | 'isRolling'> & {isRolling?: boolean}, idToUpdate?: string) => void;
  getNewRollId: () => string;
  onClearRollLog: () => void;
  // Combat Tracker Props
  combatants: Combatant[];
  onAddCombatant: (combatant: Combatant) => void;
  onAddCombatants: (newCombatants: Combatant[]) => void;
  onRemoveCombatant: (combatantId: string) => void;
  onUpdateCombatantHp: (combatantId: string, newHp: number) => void;
  onEndCombat: () => void;
}

type RollMode = "normal" | "advantage" | "disadvantage";

// Helper functions for rendering monster details (for Combat Tracker dialog)
const formatDetailArmorClass = (acArray: MonsterDetail["armor_class"] | undefined): string => {
    if (!acArray || acArray.length === 0) return "N/A";
    const mainAc = acArray[0];
    let str = `${mainAc.value} (${mainAc.type})`;
    if (mainAc.desc) {
      str += ` - ${mainAc.desc}`;
    }
    return str;
};

const renderDetailTextField = (label: string, textContent: string | undefined | null) => {
    if (!textContent || textContent.trim() === "") return null;
    const paragraphs = textContent.split('\n\n').map(para => para.trim()).filter(Boolean);
    return (
      <div>
        <h4 className="font-semibold mt-2 mb-1 text-primary">{label}</h4>
        {paragraphs.map((paragraph, index) => {
          const parts = paragraph.split(/\*\*(.*?)\*\*/g);
          return (
            <p key={index} className="text-sm mb-1.5">
              {parts.map((part, i) =>
                i % 2 === 1 ? <strong key={i} className="font-medium">{part}</strong> : part
              )}
            </p>
          );
        })}
      </div>
    );
};

type DetailActionType = MonsterAction | SpecialAbility | LegendaryAction;
const renderDetailActions = (actions: DetailActionType[] | undefined, actionTypeLabel: string) => {
    if (!actions || actions.length === 0) return null;
    return (
      <div>
        <h4 className="font-semibold mt-2 mb-1 text-primary">{actionTypeLabel}</h4>
        <ul className="list-disc pl-5 space-y-2">
          {actions.map((action: DetailActionType) => (
            <li key={action.name} className="text-sm">
              <strong className="font-medium">{action.name}
              {('usage' in action && action.usage) ? ` (${action.usage.type}${(action.usage as any).times ? ` ${(action.usage as any).times} times` : ''}${(action.usage as any).dice ? `, recharges on ${(action.usage as any).dice}` : ''})` : ''}
              .</strong> {(action as any).desc}
               { ('attack_bonus' in action && action.attack_bonus !== undefined) && <p className="text-xs pl-2">Attack Bonus: +{action.attack_bonus}</p> }
              { ('damage' in action && action.damage) && ((action.damage as any[])).map((dmg: any, i: number) => (
                <p key={i} className="text-xs pl-2">Damage: {dmg.damage_dice} {dmg.damage_type?.name}</p>
              ))}
               { ('dc' in action && action.dc) && <p className="text-xs pl-2">DC {(action.dc as any).dc_value} {(action.dc as any).dc_type.name} ({(action.dc as any).success_type})</p>}
            </li>
          ))}
        </ul>
      </div>
    );
};


export function CombinedToolDrawer({
  open,
  onOpenChange,
  defaultTab,
  // Dice Roller Props
  rollLog = [],
  onInternalRoll,
  getNewRollId,
  onClearRollLog,
  // Combat Tracker Props
  combatants = [],
  onAddCombatant,
  onAddCombatants,
  onRemoveCombatant,
  onUpdateCombatantHp,
  onEndCombat
}: CombinedToolDrawerProps) {
  const { activeCampaign, savedEncountersUpdateKey } = useCampaign();
  const { toast } = useToast();

  const [inputValue, setInputValue] = useState("");
  const [rollMode, setRollMode] = useState<RollMode>("normal");
  const diceUniqueId = useId();

  const [currentTurnIndex, setCurrentTurnIndex] = useState<number | null>(null);
  const combatUniqueId = useId();

  const [damageInputs, setDamageInputs] = useState<Record<string, string>>({});
  const combatantRefs = useRef<Map<string, HTMLLIElement | null>>(new Map());

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, open]);

  const [showAddFriendlySection, setShowAddFriendlySection] = useState(false);
  const [showAddEnemySection, setShowAddEnemySection] = useState(false);

  const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState<PlayerCharacter | null>(null);
  const [allyNameInput, setAllyNameInput] = useState<string>("");
  const [allyACInput, setAllyACInput] = useState<string>("");
  const [allyHPInput, setAllyHPInput] = useState<string>("");
  const [friendlyInitiativeInput, setFriendlyInitiativeInput] = useState<string>("");

  const [activeAddEnemyTab, setActiveAddEnemyTab] = useState("single-enemy");
  const [enemyName, setEnemyName] = useState("");
  const [enemyInitiativeInput, setEnemyInitiativeInput] = useState<string>("");
  const [enemyInitiativeModifierInput, setEnemyInitiativeModifierInput] = useState<string>("0");
  const [enemyQuantityInput, setEnemyQuantityInput] = useState<string>("1");
  const [rollGroupInitiativeFlag, setRollGroupInitiativeFlag] = useState<boolean>(false);
  const [enemyAC, setEnemyAC] = useState<string>("");
  const [enemyHP, setEnemyHP] = useState<string>("");
  const [selectedFavoriteMonsterIndexForCombatAdd, setSelectedFavoriteMonsterIndexForCombatAdd] = useState<string | undefined>(undefined);

  const [isFavoriteMonsterDialogOpen, setIsFavoriteMonsterDialogOpen] = useState(false);
  const [favoritesList, setFavoritesList] = useState<FavoriteMonster[]>([]);
  const [savedEncountersForCombat, setSavedEncountersForCombat] = useState<SavedEncounter[]>([]);
  const [selectedSavedEncounterId, setSelectedSavedEncounterId] = useState<string | undefined>(undefined);
  const [isLoadingSavedEncounters, setIsLoadingSavedEncounters] = useState(false);

  const [combatantToDelete, setCombatantToDelete] = useState<Combatant | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [selectedCombatantId, setSelectedCombatantId] = useState<string | null>(null);

  const [isMonsterDetailDialogOpen, setIsMonsterDetailDialogOpen] = useState(false);
  const [selectedMonsterForDetailDialog, setSelectedMonsterForDetailDialog] = useState<Combatant | null>(null);
  const [fullEnemyDetailsCache, setFullEnemyDetailsCache] = useState<Record<string, MonsterDetail>>({});
  const [isLoadingFullEnemyDetailsFor, setIsLoadingFullEnemyDetailsFor] = useState<string | null>(null);


  const handleDiceRoll = () => {
    const notationToParse = inputValue.trim() === "" ? "1d20" : inputValue.trim();
    const parsed = parseDiceNotation(notationToParse);
    const entryId = getNewRollId();

    if (parsed.error) {
      const errorEntryData: Omit<RollLogEntry, 'id' | 'isRolling'> = {
        inputText: notationToParse, resultText: "Error", detailText: parsed.error,
      };
      onInternalRoll(errorEntryData, entryId);
      return;
    }
    if (parsed.sides <= 0 || parsed.count <= 0) {
      const errorEntryData: Omit<RollLogEntry, 'id' | 'isRolling'> = {
        inputText: notationToParse, resultText: "Error", detailText: "Dice sides and count must be positive.",
      };
      onInternalRoll(errorEntryData, entryId);
      return;
    }

    const placeholderEntryData: Omit<RollLogEntry, 'id'> = {
      inputText: notationToParse,
      resultText: "...",
      detailText: "Rolling...",
      isAdvantage: rollMode === "advantage",
      isDisadvantage: rollMode === "disadvantage",
      isRolling: true,
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
        detailText = `Rolled ${parsed.count}d${parsed.sides}${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+" : "") + parsed.modifier : ""}: [${rolls.join(", ")}] ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+ " : "- ") + Math.abs(parsed.modifier) : ""} = ${finalResult}`;
      } else {
        if (parsed.count !== 1 || parsed.sides !== 20) {
            const { rolls, sum } = rollMultipleDice(parsed.count, parsed.sides);
            resultRolls = rolls;
            finalResult = sum + parsed.modifier;
            detailText = `Rolled ${parsed.count}d${parsed.sides}${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+" : "") + parsed.modifier : ""}: [${rolls.join(", ")}] ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+ " : "- ") + Math.abs(parsed.modifier) : ""} = ${finalResult} (Mode ignored for non-1d20)`;
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
          detailText += ` ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+ " : "- ") + Math.abs(parsed.modifier) : ""} = ${finalResult}`;
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
      setSelectedCombatantId(null);
      setSelectedPlayerToAdd(null);
      setAllyNameInput("");
      setFriendlyInitiativeInput("");
      setAllyACInput("");
      setAllyHPInput("");
      setEnemyName("");
      setEnemyInitiativeInput("");
      setEnemyInitiativeModifierInput("0");
      setEnemyQuantityInput("1");
      setRollGroupInitiativeFlag(false);
      setEnemyAC("");
      setEnemyHP("");
      setActiveAddEnemyTab("single-enemy");
      setSelectedSavedEncounterId(undefined);
      setIsMonsterDetailDialogOpen(false);
      setSelectedMonsterForDetailDialog(null);
    }
  }, [open]);

  useEffect(() => {
    if (currentTurnIndex !== null && combatants && combatants.length > 0 && combatants[currentTurnIndex]) {
        const activeCombatantId = combatants[currentTurnIndex]?.id;
        if (activeCombatantId) {
            const activeElement = combatantRefs.current.get(activeCombatantId);
            activeElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }
  }, [currentTurnIndex, combatants]);

  const availablePartyMembers = activeCampaign?.activeParty ? activeCampaign.activeParty.filter(p => !combatants.some(c => c.playerId === p.id)) : [];

  const handleDamageInputChange = (combatantId: string, value: string) => setDamageInputs(prev => ({ ...prev, [combatantId]: value }));
  const handleApplyDamage = (combatantId: string, type: 'damage' | 'heal') => {
    const amountStr = damageInputs[combatantId]; if (!amountStr) return;
    const amount = parseInt(amountStr); if (isNaN(amount) || amount <= 0) return;
    const combatant = combatants.find(c => c.id === combatantId);
    if (combatant && combatant.hp !== undefined) {
      let newHp = combatant.currentHp ?? combatant.hp;
      newHp = type === 'damage' ? Math.max(0, newHp - amount) : Math.min(combatant.hp, newHp + amount);
      onUpdateCombatantHp(combatantId, newHp);
    }
    setDamageInputs(prev => ({ ...prev, [combatantId]: "" }));
  };

  const handleOpenDeleteConfirm = (combatant: Combatant) => {
    setCombatantToDelete(combatant);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteCombatant = () => {
    if (!combatantToDelete) return;
    const id = combatantToDelete.id;
    onRemoveCombatant(id);
    if (combatants.length -1 === 0) {
      setCurrentTurnIndex(null);
    } else if (currentTurnIndex !== null) {
      const combatantToRemoveIndex = combatants.findIndex(c => c.id === id);
      if(combatantToRemoveIndex !== -1) {
        if (combatantToRemoveIndex === currentTurnIndex) {
          setCurrentTurnIndex(currentTurnIndex >= combatants.length - 1 ? (combatants.length - 1 > 0 ? 0 : null) : currentTurnIndex % (combatants.length -1));
        } else if (combatantToRemoveIndex < currentTurnIndex) {
          setCurrentTurnIndex(currentTurnIndex - 1);
        }
      }
    }
    if (selectedCombatantId === id) setSelectedCombatantId(null);
    setIsDeleteConfirmOpen(false);
    setCombatantToDelete(null);
  };

  const nextTurn = () => { if (!combatants || combatants.length === 0 || currentTurnIndex === null) return; setCurrentTurnIndex((currentTurnIndex + 1) % combatants.length); };
  const prevTurn = () => { if (!combatants || combatants.length === 0 || currentTurnIndex === null) return; setCurrentTurnIndex((currentTurnIndex - 1 + combatants.length) % combatants.length); };

  const handleEndCombatLocal = () => {
    onEndCombat();
    setCurrentTurnIndex(null);
    setSelectedCombatantId(null);
    setDamageInputs({});
    setShowAddFriendlySection(false);
    setShowAddEnemySection(false);
  };

  const handleRollAllPlayerInitiatives = () => {
    if (availablePartyMembers.length === 0) return;
    const newCombatantsFromParty: Combatant[] = availablePartyMembers.map(player => ({
      id: `${combatUniqueId}-player-${player.id}-${Date.now()}`, name: player.name, initiative: rollDie(20) + (player.initiativeModifier || 0), type: 'player', color: player.color, playerId: player.id, ac: player.armorClass, initiativeModifier: player.initiativeModifier
    }));
    onAddCombatants(newCombatantsFromParty);
    if (currentTurnIndex === null && (combatants.length === 0 && newCombatantsFromParty.length > 0)) setCurrentTurnIndex(0);
  };

  const handleSaveFriendly = () => {
    const initiativeValue = parseInt(friendlyInitiativeInput);
    if (isNaN(initiativeValue) || friendlyInitiativeInput.trim() === "") return;

    let name: string, playerId: string | undefined, color: string | undefined;
    let ac: number | undefined;
    let hp: number | undefined;
    let initiativeModifier: number | undefined;

    const isAllyMode = availablePartyMembers.length === 0;

    if (isAllyMode) {
      if (!allyNameInput.trim()) return;
      name = allyNameInput.trim();
      ac = allyACInput.trim() === "" ? undefined : parseInt(allyACInput);
      hp = allyHPInput.trim() === "" ? undefined : parseInt(allyHPInput);
      if(allyACInput.trim() !== "" && (isNaN(ac!) || ac! < 0)) return;
      if(allyHPInput.trim() !== "" && (isNaN(hp!) || hp! <=0 )) return;
    } else {
      if (!selectedPlayerToAdd) return;
      name = selectedPlayerToAdd.name;
      playerId = selectedPlayerToAdd.id;
      color = selectedPlayerToAdd.color;
      ac = selectedPlayerToAdd.armorClass;
      initiativeModifier = selectedPlayerToAdd.initiativeModifier;
      hp = undefined; // Players typically track their own HP outside this form
    }

    const newCombatant: Combatant = {
      id: `${combatUniqueId}-${isAllyMode ? 'ally' : 'player'}-${playerId || name.replace(/\s+/g, '')}-${Date.now()}`,
      name,
      initiative: initiativeValue,
      type: 'player',
      color,
      playerId,
      ac,
      hp,
      currentHp: hp,
      initiativeModifier
    };
    onAddCombatant(newCombatant);
    if (currentTurnIndex === null && combatants.length + 1 > 0) setCurrentTurnIndex(0);

    setSelectedPlayerToAdd(null);
    setAllyNameInput("");
    setFriendlyInitiativeInput("");
    setAllyACInput("");
    setAllyHPInput("");
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

  useEffect(() => {
    if (showAddEnemySection && activeCampaign && activeAddEnemyTab === "load-encounter") {
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
  }, [showAddEnemySection, activeCampaign, activeAddEnemyTab, savedEncountersUpdateKey]);


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
    setSelectedFavoriteMonsterIndexForCombatAdd(fav.index); // Store the index
    setIsFavoriteMonsterDialogOpen(false);
    toast({title: "Favorite Selected", description: `${fav.name} details pre-filled where possible.`});
  };

  const parseModifierString = (modStr: string): number => {
    modStr = modStr.trim();
    if (modStr === "") return 0;
    if (modStr === "+") return 0; // Allow just "+" to mean +0
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
    const initMod = parseModifierString(enemyInitiativeModifierInput);

    if (rollGroupInitiativeFlag) {
      groupInitiativeValue = rollDie(20) + initMod;
    }

    for (let i = 0; i < quantity; i++) {
      let initiativeValue: number;
      const currentEnemyName = quantity > 1 ? `${enemyName.trim()} ${i + 1}` : enemyName.trim();

      if (rollGroupInitiativeFlag && groupInitiativeValue !== undefined) {
        initiativeValue = groupInitiativeValue;
      } else if (enemyInitiativeInput.trim() !== "" && !isNaN(parseInt(enemyInitiativeInput.trim()))) {
        initiativeValue = parseInt(enemyInitiativeInput.trim());
      }
      else {
        initiativeValue = rollDie(20) + initMod;
      }

      newEnemies.push({
        id: `${combatUniqueId}-enemy-${Date.now()}-${i}`,
        name: currentEnemyName,
        initiative: initiativeValue,
        type: 'enemy',
        ac: acValue,
        hp: hpValue,
        currentHp: hpValue,
        initiativeModifier: initMod,
        monsterIndex: selectedFavoriteMonsterIndexForCombatAdd,
        cr: favoritesList.find(f => f.index === selectedFavoriteMonsterIndexForCombatAdd)?.cr !== undefined ? formatCRDisplay(favoritesList.find(f => f.index === selectedFavoriteMonsterIndexForCombatAdd)!.cr) : undefined,
      });
    }
    onAddCombatants(newEnemies);
    if (currentTurnIndex === null && combatants.length + newEnemies.length > 0) setCurrentTurnIndex(0);

    setEnemyName(""); setEnemyInitiativeInput(""); setEnemyQuantityInput("1");
    setEnemyInitiativeModifierInput("0");
    setRollGroupInitiativeFlag(false);
    setEnemyAC(""); setEnemyHP("");
    setSelectedFavoriteMonsterIndexForCombatAdd(undefined); // Clear stored index
    setShowAddEnemySection(false);
  };

  const handleLoadSavedEncounterToCombat = () => {
    if (!selectedSavedEncounterId) return;
    const encounter = savedEncountersForCombat.find(e => e.id === selectedSavedEncounterId);
    if (!encounter) return;

    const newEnemiesFromEncounter: Combatant[] = [];
    encounter.monsters.forEach((monster: EncounterMonster, monsterIndexInEncounter: number) => {
      for (let i = 0; i < monster.quantity; i++) {
        const combatantName = monster.quantity > 1 ? `${monster.name} ${i + 1}` : monster.name;
        const initiativeValue = rollDie(20) + (monster.initiativeModifier || 0);
        const acValue = monster.ac ? parseInt(monster.ac) : undefined;
        const hpValue = monster.hp ? parseInt(monster.hp) : undefined;

        newEnemiesFromEncounter.push({
          id: `${combatUniqueId}-enemy-${monster.name.replace(/\s+/g, '')}-${Date.now()}-${monsterIndexInEncounter}-${i}`,
          name: combatantName,
          initiative: initiativeValue,
          type: 'enemy',
          ac: isNaN(acValue!) ? undefined : acValue,
          hp: isNaN(hpValue!) ? undefined : hpValue,
          currentHp: isNaN(hpValue!) ? undefined : hpValue,
          cr: monster.cr, // Added CR from EncounterMonster
          initiativeModifier: monster.initiativeModifier,
          monsterIndex: monster.monsterIndex // Transfer monsterIndex
        });
      }
    });
    onAddCombatants(newEnemiesFromEncounter);
     if (currentTurnIndex === null && combatants.length + newEnemiesFromEncounter.length > 0) setCurrentTurnIndex(0);

    setSelectedSavedEncounterId(undefined);
    setShowAddEnemySection(false);
  };

  const selectedEncounterDetails = selectedSavedEncounterId ? savedEncountersForCombat.find(e => e.id === selectedSavedEncounterId) : null;

  const handleCombatantCardClick = (combatant: Combatant) => {
    if (combatant.type === 'enemy') {
      setSelectedCombatantId(prevId => prevId === combatant.id ? null : combatant.id);
    } else {
      setSelectedCombatantId(null); // Deselect if a player card is clicked, or if an enemy card is clicked again
    }
    if (isMonsterDetailDialogOpen && selectedMonsterForDetailDialog?.id !== combatant.id) {
      setIsMonsterDetailDialogOpen(false); // Close details if a different combatant is selected
    }
  };

  const fetchFullEnemyDetails = useCallback(async (combatant: Combatant) => {
    if (!combatant.monsterIndex) {
      toast({ title: "Details Unavailable", description: "No API index found for this enemy.", variant: "default" });
      return;
    }
    if (fullEnemyDetailsCache[combatant.monsterIndex]) {
      return; // Already cached
    }
    setIsLoadingFullEnemyDetailsFor(combatant.id);
    try {
      const response = await fetch(`${DND5E_API_BASE_URL}/api/monsters/${combatant.monsterIndex}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch details for ${combatant.name}`);
      }
      const data: MonsterDetail = await response.json();
      setFullEnemyDetailsCache(prev => ({ ...prev, [combatant.monsterIndex!]: {...data, source: 'api'} }));
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: `Could not load details for ${combatant.name}.`, variant: "destructive" });
    } finally {
      setIsLoadingFullEnemyDetailsFor(null);
    }
  }, [fullEnemyDetailsCache, toast]);

  const handleOpenMonsterDetailDialog = (combatant: Combatant) => {
    if (selectedCombatantId === combatant.id) setSelectedCombatantId(null); // Close action bar if opening details
    setSelectedMonsterForDetailDialog(combatant);
    setIsMonsterDetailDialogOpen(true);
    if (combatant.monsterIndex && !fullEnemyDetailsCache[combatant.monsterIndex]) {
      fetchFullEnemyDetails(combatant);
    }
  };


  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:w-[500px] flex flex-col p-0" hideCloseButton={true}>
        <SheetHeader className="sr-only">
          <SheetTitle>DM Tools</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full pr-8"> 
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow min-h-0">
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

            <TabsContent value={DICE_ROLLER_TAB_ID} className="data-[state=active]:flex flex-col flex-grow min-h-0 p-4 space-y-4">
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
                        <div key={entry.id} className={cn("text-sm p-2 rounded-md bg-background shadow-sm", entry.isRolling ? "opacity-50" : "animate-in slide-in-from-top-2 fade-in duration-300")}>
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
            </TabsContent>

            <TabsContent value={COMBAT_TRACKER_TAB_ID} className="data-[state=active]:flex flex-col flex-grow min-h-0">
              <div className="p-4 flex gap-2 border-b shrink-0">
                  <Button
                    onClick={() => { setShowAddFriendlySection(p => !p); setShowAddEnemySection(false); setSelectedCombatantId(null);}}
                    variant={showAddFriendlySection ? "secondary" : "outline"}
                    className="flex-1"
                  >
                    {availablePartyMembers.length === 0 ? <UserPlus className="mr-2 h-4 w-4" /> : <Users className="mr-2 h-4 w-4" />}
                    {availablePartyMembers.length === 0 ? "Add Ally" : "Add Player"}
                  </Button>
                  <Button
                    onClick={() => { setShowAddEnemySection(p => !p); setShowAddFriendlySection(false); setSelectedCombatantId(null);}}
                    variant={showAddEnemySection ? "secondary" : "outline"}
                    className="flex-1"
                  >
                    <ShieldAlert className="mr-2 h-4 w-4" /> Add Enemy
                  </Button>
              </div>
               {availablePartyMembers.length > 0 && !showAddFriendlySection && !showAddEnemySection && (
                <div className="p-4 border-b shrink-0">
                    <Button onClick={handleRollAllPlayerInitiatives} variant="outline" className="w-full">
                        <Dice5 className="mr-2 h-4 w-4"/> Roll All Player Initiatives
                    </Button>
                </div>
                )}

              {showAddFriendlySection && (
              <div className="p-4 space-y-3 border-b bg-card shrink-0">
                {availablePartyMembers.length > 0 ? (
                <div>
                  <Label htmlFor="player-select-inline">Player Character</Label>
                  <Select value={selectedPlayerToAdd?.id || ""} onValueChange={(value) => setSelectedPlayerToAdd(activeCampaign?.activeParty?.find((p) => p.id === value) || null)}>
                  <SelectTrigger id="player-select-inline" className="mt-1"><SelectValue placeholder="Select a player" /></SelectTrigger>
                  <SelectContent>
                    {availablePartyMembers.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name} - {p.race} {p.class}</SelectItem>))}
                  </SelectContent>
                  </Select>
                </div>
                ) : (
                <>
                  <div>
                  <Label htmlFor="ally-name-inline">Ally Name</Label>
                  <Input id="ally-name-inline" value={allyNameInput} onChange={(e) => setAllyNameInput(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label htmlFor="ally-ac-inline">AC (Optional)</Label><Input id="ally-ac-inline" type="number" value={allyACInput} onChange={(e) => setAllyACInput(e.target.value)} /></div>
                    <div><Label htmlFor="ally-hp-inline">HP (Optional)</Label><Input id="ally-hp-inline" type="number" value={allyHPInput} onChange={(e) => setAllyHPInput(e.target.value)} /></div>
                  </div>
                </>
                )}
                <div>
                <Label htmlFor="friendly-initiative-inline">Initiative</Label>
                <div className="flex gap-2 items-center">
                  <Input id="friendly-initiative-inline" type="number" value={friendlyInitiativeInput} onChange={(e) => setFriendlyInitiativeInput(e.target.value)} className="flex-grow" />
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

              {showAddEnemySection && (
              <div className="px-4 pb-4 border-b bg-card shrink-0 flex-grow flex flex-col">
                <Tabs value={activeAddEnemyTab} onValueChange={setActiveAddEnemyTab} className="flex flex-col flex-grow">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single-enemy">Single Enemy/Group</TabsTrigger>
                  <TabsTrigger value="load-encounter" disabled={!activeCampaign}>Load Saved Encounter</TabsTrigger>
                </TabsList>
                <TabsContent value="single-enemy" className="mt-4 space-y-3 flex-grow flex flex-col">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enemy-name-inline">Enemy Name</Label>
                    <Button variant="ghost" size="icon" onClick={() => setIsFavoriteMonsterDialogOpen(true)} className="h-7 w-7">
                      <Star className="h-4 w-4 text-amber-400 hover:text-amber-500"/>
                    </Button>
                  </div>
                  <Input id="enemy-name-inline" value={enemyName} onChange={(e) => setEnemyName(e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                      <div><Label htmlFor="enemy-ac-inline">AC</Label><Input id="enemy-ac-inline" type="number" value={enemyAC} onChange={(e) => setEnemyAC(e.target.value)} /></div>
                      <div><Label htmlFor="enemy-hp-inline">HP</Label><Input id="enemy-hp-inline" type="number" value={enemyHP} onChange={(e) => setEnemyHP(e.target.value)} /></div>
                  </div>
                   <div className="grid grid-cols-2 gap-3">
                    <div><Label htmlFor="enemy-init-mod-inline">Init. Mod.</Label><Input id="enemy-init-mod-inline" value={enemyInitiativeModifierInput} onChange={(e) => setEnemyInitiativeModifierInput(e.target.value)} /></div>
                    <div className="flex items-end gap-1">
                      <div className="flex-grow">
                         <Label htmlFor="enemy-initiative-input-inline">Initiative</Label>
                         <Input id="enemy-initiative-input-inline" className="w-full" value={enemyInitiativeInput} onChange={(e) => setEnemyInitiativeInput(e.target.value)} type="number" />
                      </div>
                      <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => setEnemyInitiativeInput((rollDie(20) + parseModifierString(enemyInitiativeModifierInput)).toString())}>
                          <Dice5 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                   <div className="flex items-end gap-3">
                      <div className="w-20">
                          <Label htmlFor="enemy-quantity-inline">Quantity</Label>
                          <Input id="enemy-quantity-inline" type="number" value={enemyQuantityInput} onChange={(e) => setEnemyQuantityInput(e.target.value)} min="1" />
                      </div>
                      <div className="flex items-center space-x-2 pb-1">
                          <Switch id="roll-group-initiative-inline" checked={rollGroupInitiativeFlag} onCheckedChange={setRollGroupInitiativeFlag} />
                          <Label htmlFor="roll-group-initiative-inline" className="cursor-pointer text-sm">Group</Label>
                      </div>
                  </div>

                  <div className="mt-auto pt-4">
                  <Button onClick={handleAddSingleEnemyGroup} disabled={!enemyName.trim()} className="w-full">Add to Combat</Button>
                  </div>
                </TabsContent>
                <TabsContent value="load-encounter" className="mt-4 flex-grow flex flex-col min-h-0">
                  {isLoadingSavedEncounters ? (
                  <div className="flex items-center justify-center h-32 flex-grow"><Loader2 className="h-6 w-6 animate-spin" /></div>
                  ) : savedEncountersForCombat.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 flex-grow">No saved encounters found for this campaign.</p>
                  ) : (
                  <>
                    <div className="shrink-0">
                    <Label htmlFor="saved-encounter-select-inline">Select Saved Encounter</Label>
                    <Select value={selectedSavedEncounterId} onValueChange={setSelectedSavedEncounterId}>
                      <SelectTrigger id="saved-encounter-select-inline" className="mt-1"><SelectValue placeholder="Choose an encounter..." /></SelectTrigger>
                      <SelectContent>
                      {savedEncountersForCombat.map(enc => (<SelectItem key={enc.id} value={enc.id}>{enc.title}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    </div>
                    {selectedEncounterDetails && (
                    <div className="mt-2 flex-grow flex flex-col min-h-0">
                      <Label className="font-medium shrink-0">Monsters in "{selectedEncounterDetails.title}":</Label>
                      <ScrollArea className="mt-1 border rounded-md p-2 bg-muted/30 flex-grow">
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
                    <div className="mt-auto pt-4 shrink-0">
                    <Button onClick={handleLoadSavedEncounterToCombat} disabled={!selectedSavedEncounterId} className="w-full">Add Encounter to Combat</Button>
                    </div>
                  </>
                  )}
                </TabsContent>
                </Tabs>
              </div>
              )}

             <div className="p-4 flex-grow flex flex-col min-h-0">
                <Label className="mb-1">Combat Order (Highest to Lowest)</Label>
                <ScrollArea className="border rounded-md p-1 flex-grow bg-muted/30 h-full">
                    {combatants.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No combatants yet.</p>}
                    <ul className="space-y-1.5">
                    {combatants.map((c, index) => (
                        <li
                        key={c.id}
                        ref={(el) => combatantRefs.current.set(c.id, el)}
                        className={`p-2.5 rounded-md flex flex-col gap-1.5 transition-all shadow-sm ${currentTurnIndex === index ? 'ring-2 ring-primary bg-primary/10' : 'bg-background'}`}
                        style={c.type === 'player' && c.color ? { borderLeft: `4px solid ${c.color}` } : {}}
                        >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center cursor-pointer flex-1" onClick={() => handleCombatantCardClick(c)}>
                              <span className={`font-bold text-lg mr-3 ${currentTurnIndex === index ? 'text-primary' : ''}`}>{c.initiative}</span>
                              <div>
                                  <p className={cn("font-medium", c.type === 'enemy' && selectedCombatantId !== c.id && 'text-destructive', c.type === 'enemy' && selectedCombatantId === c.id && 'text-primary')}>{c.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    AC: {c.ac ?? 'N/A'}
                                    {(c.hp !== undefined) && <span className="ml-1">| HP: {c.currentHp ?? c.hp ?? 'N/A'}/{c.hp ?? 'N/A'}</span>}
                                  </p>
                              </div>
                            </div>
                             {c.type === 'enemy' && c.monsterIndex && (
                                <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto" onClick={() => handleOpenMonsterDetailDialog(c)}>
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            )}
                        </div>

                        {c.type === 'enemy' && c.hp !== undefined && c.hp > 0 && c.currentHp !== undefined && (
                          <div className="mt-1">
                            <Progress value={(c.currentHp / c.hp) * 100} className="h-2 [&>div]:bg-destructive" />
                          </div>
                        )}

                        {c.type === 'enemy' && c.id === selectedCombatantId && (
                        <>
                        {c.currentHp !== undefined && c.currentHp === 0 ? (
                            <Button variant="destructive" className="w-full mt-1.5 py-1 h-auto text-sm" onClick={(e) => { e.stopPropagation(); handleOpenDeleteConfirm(c); }}><Skull className="mr-2 h-4 w-4" /> Dead (Remove)</Button>
                        ) : (
                            <div className="flex items-center justify-center gap-1.5 pt-1">
                              <Button size="sm" variant="destructive" className="px-2 py-1 h-8 text-xs" onClick={(e) => { e.stopPropagation(); handleApplyDamage(c.id, 'damage'); }}><Swords className="mr-1 h-3 w-3" /> Hit</Button>
                              <Input type="number" className="h-8 text-sm w-20 px-2 py-1" value={damageInputs[c.id] || ""} onChange={(e) => handleDamageInputChange(c.id, e.target.value)} onClick={(e) => e.stopPropagation()} min="1" />
                              <Button size="sm" variant="outline" className="px-2 py-1 h-8 text-xs border-green-600 text-green-600 hover:bg-green-500/10 hover:text-green-700" onClick={(e) => { e.stopPropagation(); handleApplyDamage(c.id, 'heal'); }}><Bandage className="mr-1 h-3 w-3" /> Heal</Button>
                            </div>
                        )}
                        </>
                        )}
                        </li>
                    ))}
                    </ul>
                </ScrollArea>
              </div>
              {(combatants || []).length > 0 && (
              <div className="p-4 space-y-2 border-t shrink-0">
                <div className="flex gap-2">
                <Button onClick={prevTurn} variant="outline" className="flex-1"><ArrowLeft className="mr-2 h-4 w-4"/>Prev</Button>
                <Button onClick={nextTurn} className="flex-1 bg-primary hover:bg-primary/90"><ArrowRight className="mr-2 h-4 w-4"/>Next Turn</Button>
                </div>
                <Button onClick={handleEndCombatLocal} variant="destructive" className="w-full"><XCircle className="mr-2 h-4 w-4"/>End Combat</Button>
              </div>
              )}
            </TabsContent>
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
      <DialogContent className="max-w-md min-h-[480px] flex flex-col">
        <DialogHeader className="bg-primary text-primary-foreground p-4 rounded-t-md -mx-6 -mt-0 mb-4">
          <DialogTitle className="text-primary-foreground">Select Favorite Monster</DialogTitle>
          <DialogDescription className="text-primary-foreground/80">Choose from your Monster Mash favorites.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-4 flex-grow">
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

    {/* Delete Combatant Confirmation Dialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Combatant?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{combatantToDelete?.name}" from the combat?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setIsDeleteConfirmOpen(false); setCombatantToDelete(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteCombatant} className={cn("bg-destructive text-destructive-foreground hover:bg-destructive/90")}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    {/* Monster Detail Dialog */}
    <Dialog open={isMonsterDetailDialogOpen} onOpenChange={setIsMonsterDetailDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{selectedMonsterForDetailDialog?.name || "Monster Details"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          {isLoadingFullEnemyDetailsFor === selectedMonsterForDetailDialog?.id ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedMonsterForDetailDialog?.monsterIndex && fullEnemyDetailsCache[selectedMonsterForDetailDialog.monsterIndex] ? (
            (() => {
              const detail = fullEnemyDetailsCache[selectedMonsterForDetailDialog.monsterIndex!];
              return (
                <div className="space-y-3 text-sm py-4">
                  <p className="text-sm text-muted-foreground">{detail.size} {detail.type} {detail.subtype ? `(${detail.subtype})` : ''}, {detail.alignment}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs border p-2 rounded-md bg-background">
                    <div><strong>AC:</strong> {formatDetailArmorClass(detail.armor_class)}</div>
                    <div><strong>HP:</strong> {detail.hit_points} {detail.hit_dice ? `(${detail.hit_dice})` : ''}</div>
                    <div><strong>CR:</strong> {formatCRDisplay(detail.challenge_rating)} {detail.xp ? `(${detail.xp} XP)` : ''}</div>
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
                  {detail.damage_vulnerabilities?.length > 0 && <div><strong>Vulnerabilities:</strong> {detail.damage_vulnerabilities.join(', ')}</div>}
                  {detail.damage_resistances?.length > 0 && <div><strong>Resistances:</strong> {detail.damage_resistances.join(', ')}</div>}
                  {detail.damage_immunities?.length > 0 && <div><strong>Immunities:</strong> {detail.damage_immunities.join(', ')}</div>}
                  {detail.condition_immunities && (typeof detail.condition_immunities === 'string' ? detail.condition_immunities.length > 0 : detail.condition_immunities.length > 0) && <div><strong>Condition Immunities:</strong> {(Array.isArray(detail.condition_immunities) && detail.condition_immunities.length > 0 && typeof detail.condition_immunities[0] !== 'string') ? (detail.condition_immunities as { index: string; name: string; url: string }[]).map(ci => ci.name).join(', ') : (Array.isArray(detail.condition_immunities) ? detail.condition_immunities.join(', ') : detail.condition_immunities) }</div>}
                  <div><strong>Senses:</strong> {typeof detail.senses === 'string' ? detail.senses : detail.senses ? Object.entries(detail.senses).map(([key, val]) => `${key.replace("_", " ")} ${val}`).join(', ') : 'N/A'}</div>
                  <div><strong>Languages:</strong> {detail.languages || "None"}</div>

                  {renderDetailActions(detail.special_abilities as SpecialAbility[] | undefined, "Special Abilities")}
                  {renderDetailActions(detail.actions as MonsterAction[] | undefined, "Actions")}
                  {renderDetailActions(detail.legendary_actions as LegendaryAction[] | undefined, "Legendary Actions")}

                  {detail.image && (<div className="mt-2"><Image src={detail.source === 'api' ? `${DND5E_API_BASE_URL}${detail.image}` : detail.image} alt={detail.name} width={300} height={300} className="rounded-md border object-contain mx-auto" data-ai-hint={`${detail.type} monster`} /></div>)}
                </div>
              );
            })()
          ) : selectedMonsterForDetailDialog?.monsterIndex ? (
             <p className="text-sm text-muted-foreground py-4">Could not load details for {selectedMonsterForDetailDialog.name}.</p>
          ) : (
            <p className="text-sm text-muted-foreground py-4">No detailed API data available for this manually added combatant.</p>
          )}
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
