
"use client";
// This file is deprecated and its content has been moved to features/combat-tracker/CombatTrackerDrawer.tsx
// It can be deleted after the refactor is confirmed.

import { useState, useEffect, useId, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent as UIAlertDialogContent, AlertDialogDescription, AlertDialogHeader as UIAlertDialogHeader, AlertDialogTitle as UIAlertDialogTitle, AlertDialogFooter as UIAlertDialogFooter } from "@/components/ui/alert-dialog";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Dice5, Zap, Trash2, PlusCircle, UserPlus, Users, ArrowRight, ArrowLeft, XCircle, Skull, Loader2, Swords, FolderOpen, MinusCircle, BookOpen, Star, Bandage, Shield, Settings2Icon, ChevronsRight, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { parseDiceNotation, rollMultipleDice, rollDie } from "@/lib/dice-utils";
import type { PlayerCharacter, Combatant, RollLogEntry, SavedEncounter, EncounterMonster, FavoriteMonster, MonsterDetail, ArmorClass, SpecialAbility, MonsterAction, LegendaryAction } from "@/lib/types";
import { useCampaign } from "@/contexts/campaign-context";
import { DICE_ROLLER_TAB_ID, COMBAT_TRACKER_TAB_ID, SAVED_ENCOUNTERS_STORAGE_KEY_PREFIX, MONSTER_MASH_FAVORITES_STORAGE_KEY, DND5E_API_BASE_URL } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCRDisplay } from "@/components/features/monster-mash/MonsterMashDrawer"; 
import { useToast } from "@/hooks/use-toast";


interface CombinedToolDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab: string;
  rollLog: RollLogEntry[];
  onInternalRoll: (rollData: Omit<RollLogEntry, 'id'>, idToUpdate?: string) => void;
  onClearRollLog: () => void;
  combatants: Combatant[];
  onAddCombatant: (combatant: Combatant) => void;
  onAddCombatants: (newCombatants: Combatant[]) => void;
  onRemoveCombatant: (combatantId: string) => void;
  onUpdateCombatant: (combatantId: string, updates: Partial<Combatant>) => void;
  onEndCombat: () => void;
}

type RollMode = "normal" | "advantage" | "disadvantage";

export function CombinedToolDrawer({
  open,
  onOpenChange,
  defaultTab,
  rollLog = [],
  onInternalRoll,
  onClearRollLog,
  combatants = [],
  onAddCombatant,
  onAddCombatants,
  onRemoveCombatant,
  onUpdateCombatant,
  onEndCombat
}: CombinedToolDrawerProps) {
  
  if (open) {
    console.warn("CombinedToolDrawer.tsx is deprecated and its content has been moved to CombatTrackerDrawer.tsx. Please update references and delete this file.");
  }
  return null; 
}
