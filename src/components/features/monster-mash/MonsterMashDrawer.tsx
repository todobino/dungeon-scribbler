"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { MonsterSummary, MonsterDetail, FavoriteMonster, ArmorClass, MonsterAction, SpecialAbility, LegendaryAction, HomebrewMonsterFormData, MonsterSummaryWithCR } from "@/lib/types";
import { 
  MONSTER_MASH_FAVORITES_STORAGE_KEY, 
  MONSTER_MASH_FULL_INDEX_STORAGE_KEY, 
  MONSTER_MASH_HOMEBREW_STORAGE_KEY,
  MONSTER_TYPES,
  MONSTER_SIZES,
  MONSTER_AC_TYPES,
  MONSTER_ALIGNMENTS
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Search, X, Star, ShieldAlert, MapPin, Loader2, AlertTriangle, Info, ShieldCheck, BookOpen, ArrowUpDown, HelpCircle, ChevronRight, Skull, PlusCircle, Save, VenetianMask, ChevronDown, Dna, Edit3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const DND5E_API_BASE_URL = "https://www.dnd5eapi.co";

interface MonsterMashDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SortKey = "name" | "cr";
type SortOrder = "asc" | "desc";

interface SortConfig {
  key: SortKey;
  order: SortOrder;
}

const crToNumber = (cr: string | number | undefined): number => {
  if (cr === undefined) return -1; 
  if (typeof cr === 'number') return cr;
  if (typeof cr === 'string') {
    if (cr.toLowerCase() === "unknown" || cr.toLowerCase() === "n/a") return -1;
    if (cr.includes('/')) {
      const parts = cr.split('/');
      return parseFloat(parts[0]) / parseFloat(parts[1]);
    }
    return parseFloat(cr);
  }
  return -1; 
};

const formatCRDisplay = (crValue: string | number | undefined): string => {
    if (crValue === undefined || crValue === -1) return "N/A";
    const numCR = typeof crValue === 'string' ? crToNumber(crValue) : crValue;

    if (numCR === -1) return "N/A";
    if (numCR === 0) return "0";
    if (numCR === 0.125) return "1/8";
    if (numCR === 0.25) return "1/4";
    if (numCR === 0.5) return "1/2";
    if (numCR === 0.75) return "3/4";
    if (Number.isInteger(numCR)) return numCR.toString();
    return numCR.toString(); 
};

const CR_SLIDER_MIN = 0;
const CR_SLIDER_MAX = 30;

const snapCRValue = (rawValue: number): number => {
  if (rawValue <= 0) return 0;
  if (rawValue < 0.125) return 0; 
  if (rawValue < (0.125 + 0.25) / 2) return 0.125; 
  if (rawValue < (0.25 + 0.5) / 2) return 0.25; 
  if (rawValue < (0.5 + 0.75) / 2) return 0.5;
  if (rawValue < (0.75 + 1) / 2) return 0.75;
  return Math.round(rawValue);
};

const initialHomebrewFormData: HomebrewMonsterFormData = {
  name: "", challenge_rating: "", type: "", size: "",
  armor_class_value: "10", armor_class_type: "Natural Armor",
  hit_points_value: "10", hit_points_dice: "", speed: "30 ft.",
  str: "10", dex: "10", con: "10", int: "10", wis: "10", cha: "10",
  special_abilities_text: "", actions_text: "", legendary_actions_text: "",
  image_url: "", alignment: "Unaligned", languages: "None", senses_text: "Passive Perception 10",
  damage_vulnerabilities_text: "", damage_resistances_text: "", damage_immunities_text: "",
  condition_immunities_text: ""
};

// Helper to convert MonsterDetail to HomebrewMonsterFormData for editing
const monsterDetailToFormData = (monster: MonsterDetail): HomebrewMonsterFormData => {
  return {
    name: monster.name || "",
    challenge_rating: monster.challenge_rating !== undefined ? monster.challenge_rating.toString() : "",
    type: monster.type || "",
    size: monster.size || "",
    armor_class_value: monster.armor_class && monster.armor_class[0] ? monster.armor_class[0].value.toString() : "10",
    armor_class_type: monster.armor_class && monster.armor_class[0] ? monster.armor_class[0].type : "Natural Armor",
    hit_points_value: monster.hit_points?.toString() || "10",
    hit_points_dice: monster.hit_dice || "",
    speed: typeof monster.speed === 'string' ? monster.speed : (monster.speed ? Object.entries(monster.speed).map(([k, v]) => `${k} ${v}`).join(', ') : "30 ft."),
    str: monster.strength?.toString() || "10",
    dex: monster.dexterity?.toString() || "10",
    con: monster.constitution?.toString() || "10",
    int: monster.intelligence?.toString() || "10",
    wis: monster.wisdom?.toString() || "10",
    cha: monster.charisma?.toString() || "10",
    special_abilities_text: typeof monster.special_abilities === 'string' ? monster.special_abilities : (monster.special_abilities?.map(sa => `**${sa.name}**. ${sa.desc}`).join('\n\n') || ""),
    actions_text: typeof monster.actions === 'string' ? monster.actions : (monster.actions?.map(a => `**${a.name}**. ${a.desc}`).join('\n\n') || ""),
    legendary_actions_text: typeof monster.legendary_actions === 'string' ? monster.legendary_actions : (monster.legendary_actions?.map(la => `**${la.name}**. ${la.desc}`).join('\n\n') || ""),
    image_url: monster.image || "",
    alignment: monster.alignment || "Unaligned",
    languages: monster.languages || "None",
    senses_text: typeof monster.senses === 'string' ? monster.senses : (monster.senses ? Object.entries(monster.senses).map(([k, v]) => `${k.replace(/_/g, ' ')} ${v}`).join(', ') : "Passive Perception 10"),
    damage_vulnerabilities_text: monster.damage_vulnerabilities?.join(', ') || "",
    damage_resistances_text: monster.damage_resistances?.join(', ') || "",
    damage_immunities_text: monster.damage_immunities?.join(', ') || "",
    condition_immunities_text: Array.isArray(monster.condition_immunities) ? monster.condition_immunities.map(ci => typeof ci === 'string' ? ci : ci.name).join(', ') : "",
  };
};


export function MonsterMashDrawer({ open, onOpenChange }: MonsterMashDrawerProps) {
  const [allMonstersData, setAllMonstersData] = useState<MonsterSummaryWithCR[]>([]);
  const [filteredMonsters, setFilteredMonsters] = useState<MonsterSummaryWithCR[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<MonsterDetail | null>(null);
  const [homebrewMonsters, setHomebrewMonsters] = useState<MonsterDetail[]>([]);
  
  const [isCreatingHomebrew, setIsCreatingHomebrew] = useState(false);
  const [editingHomebrewIndex, setEditingHomebrewIndex] = useState<string | null>(null);
  const [homebrewFormData, setHomebrewFormData] = useState<HomebrewMonsterFormData>(initialHomebrewFormData);
  const [initialEditFormData, setInitialEditFormData] = useState<HomebrewMonsterFormData | null>(null);
  
  const [isHomebrewFormDirty, setIsHomebrewFormDirty] = useState(false);
  const [isUnsavedChangesDialogOpen, setIsUnsavedChangesDialogOpen] = useState(false);
  const [pendingActionAfterUnsavedDialog, setPendingActionAfterUnsavedDialog] = useState<(() => void) | null>(null);
  
  const [isDeleteHomebrewConfirmOpen, setIsDeleteHomebrewConfirmOpen] = useState(false);
  const [monsterToDeleteIndex, setMonsterToDeleteIndex] = useState<string | null>(null);


  const [searchTerm, setSearchTerm] = useState("");
  const [crRange, setCrRange] = useState<[number, number]>([CR_SLIDER_MIN, CR_SLIDER_MAX]);
  const [favorites, setFavorites] = useState<FavoriteMonster[]>([]);

  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isBuildingIndex, setIsBuildingIndex] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resultsSortConfig, setResultsSortConfig] = useState<SortConfig>({ key: 'name', order: 'asc' });
  const [favoritesSortConfig, setFavoritesSortConfig] = useState<SortConfig>({ key: 'name', order: 'asc' });
  const [homebrewSortConfig, setHomebrewSortConfig] = useState<SortConfig>({ key: 'name', order: 'asc' });

  // Check if homebrew form is dirty
 useEffect(() => {
    if (isCreatingHomebrew) {
      const initialDataForCompare = editingHomebrewIndex ? initialEditFormData : initialHomebrewFormData;
      const isDirty = JSON.stringify(homebrewFormData) !== JSON.stringify(initialDataForCompare);
      setIsHomebrewFormDirty(isDirty);
    } else {
      setIsHomebrewFormDirty(false);
    }
  }, [homebrewFormData, isCreatingHomebrew, editingHomebrewIndex, initialEditFormData]);

  const applyFiltersAndSort = useCallback(() => {
    let combinedData: MonsterSummaryWithCR[] = [
        ...allMonstersData.filter(m => m.source !== 'homebrew'), // Exclude homebrew from API list
        ...homebrewMonsters.map(hb => ({
            index: hb.index, name: hb.name, cr: crToNumber(hb.challenge_rating), type: hb.type,
            url: hb.url, source: 'homebrew' as 'homebrew'
        }))
    ];

    let tempFiltered = [...combinedData];

    if (searchTerm.trim() !== "") {
      tempFiltered = tempFiltered.filter(monster =>
        monster.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const [minCRSlider, maxCRSlider] = crRange;
    if (minCRSlider !== CR_SLIDER_MIN || maxCRSlider !== CR_SLIDER_MAX) {
        tempFiltered = tempFiltered.filter(monster => {
            const monsterCRNum = monster.cr;
            if (monsterCRNum === undefined || monsterCRNum === -1) return false; 
            return monsterCRNum >= minCRSlider && monsterCRNum <= maxCRSlider;
        });
    }

    const sortKey = resultsSortConfig.key;
    const sortOrder = resultsSortConfig.order;
    tempFiltered.sort((a, b) => {
        let valA, valB;
        if (sortKey === 'name') {
            valA = a.name.toLowerCase(); valB = b.name.toLowerCase();
        } else { 
            valA = a.cr === undefined ? -Infinity : a.cr; 
            valB = b.cr === undefined ? -Infinity : b.cr;
        }
        let comparison = 0;
        if (valA > valB) {comparison = 1;}
        else if (valA < valB) {comparison = -1;}
        return sortOrder === 'asc' ? comparison : comparison * -1;
    });
    setFilteredMonsters(tempFiltered);
  }, [allMonstersData, homebrewMonsters, searchTerm, crRange, resultsSortConfig]);


  const fetchAndCacheFullMonsterIndex = useCallback(async () => {
    setIsBuildingIndex(true); setError(null);
    try {
      const summaryResponse = await fetch(`${DND5E_API_BASE_URL}/api/monsters`);
      if (!summaryResponse.ok) throw new Error(`Failed to fetch monster summary list: ${summaryResponse.statusText}`);
      const summaryData = await summaryResponse.json();
      const summaries: MonsterSummary[] = summaryData.results || [];
      
      const enrichedMonstersPromises = summaries.map(async (summary, index) => {
        // Add a small delay to be kind to the API, especially for many monsters
        await new Promise(resolve => setTimeout(resolve, index * 20)); // e.g., 20ms delay per monster
        try {
          const detailResponse = await fetch(`${DND5E_API_BASE_URL}${summary.url}`);
          if (detailResponse.ok) {
            const detailData: MonsterDetail = await detailResponse.json();
            return {
              index: detailData.index, name: detailData.name, cr: crToNumber(detailData.challenge_rating),
              type: detailData.type, url: summary.url, source: 'api' as 'api'
            };
          }
          console.warn(`Failed to fetch details for ${summary.name}: ${detailResponse.statusText}`);
          return { index: summary.index, name: summary.name, url: summary.url, source: 'api' as 'api', cr: undefined, type: undefined };
        } catch (detailError) {
            console.warn(`Error fetching details for ${summary.name}:`, detailError);
            return { index: summary.index, name: summary.name, url: summary.url, source: 'api' as 'api', cr: undefined, type: undefined };
        }
      });

      const enrichedMonsters = await Promise.all(enrichedMonstersPromises);
      const validEnrichedMonsters = enrichedMonsters.filter(m => m !== null) as MonsterSummaryWithCR[];
      
      localStorage.setItem(MONSTER_MASH_FULL_INDEX_STORAGE_KEY, JSON.stringify(validEnrichedMonsters));
      setAllMonstersData(validEnrichedMonsters);
    } catch (err: any) {
      console.error("Error building full monster index:", err);
      setError(err.message || "Could not build local monster index. Some features might be limited.");
      if (allMonstersData.length === 0) { 
         try {
            const summaryResponseFallback = await fetch(`${DND5E_API_BASE_URL}/api/monsters`);
            if (summaryResponseFallback.ok) {
                const summaryDataFallback = await summaryResponseFallback.json();
                setAllMonstersData((summaryDataFallback.results || []).map((m: MonsterSummary) => ({...m, source: 'api', cr: undefined, type: undefined })));
            } else { setError("Failed to load even basic monster list. Please try again later."); }
         } catch (fallbackErr) { setError("Failed to load basic monster list after index build error. Please try again later."); }
      }
    } finally { setIsBuildingIndex(false); setIsLoadingList(false); }
  }, [allMonstersData.length]);

  useEffect(() => {
    if (open && allMonstersData.length === 0 && !isLoadingList && !isBuildingIndex) {
        setIsLoadingList(true);
        try {
            const cachedIndex = localStorage.getItem(MONSTER_MASH_FULL_INDEX_STORAGE_KEY);
            if (cachedIndex) {
                const parsedIndex: MonsterSummaryWithCR[] = JSON.parse(cachedIndex);
                setAllMonstersData(parsedIndex.map(m => ({...m, source: m.source || 'api'}))); // Ensure source is set
                setIsLoadingList(false);
            } else { fetchAndCacheFullMonsterIndex(); }
        } catch (e) { console.error("Error loading cached monster index:", e); fetchAndCacheFullMonsterIndex(); }
    }
  }, [open, allMonstersData.length, isLoadingList, isBuildingIndex, fetchAndCacheFullMonsterIndex]);

  useEffect(() => { if (allMonstersData.length > 0 || homebrewMonsters.length > 0) { applyFiltersAndSort(); }
  }, [allMonstersData, homebrewMonsters, applyFiltersAndSort]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (open && (allMonstersData.length > 0 || homebrewMonsters.length > 0)) { applyFiltersAndSort(); }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, crRange, resultsSortConfig, open, allMonstersData, homebrewMonsters, applyFiltersAndSort]);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(MONSTER_MASH_FAVORITES_STORAGE_KEY);
      if (storedFavorites) { setFavorites(JSON.parse(storedFavorites)); }
    } catch (e) { console.error("Error loading favorites from localStorage", e); setFavorites([]); }
    try {
      const storedHomebrew = localStorage.getItem(MONSTER_MASH_HOMEBREW_STORAGE_KEY);
      if (storedHomebrew) { setHomebrewMonsters(JSON.parse(storedHomebrew)); }
    } catch (e) { console.error("Error loading homebrew monsters from localStorage", e); setHomebrewMonsters([]); }
  }, []);

  useEffect(() => {
    if (favorites.length > 0 || localStorage.getItem(MONSTER_MASH_FAVORITES_STORAGE_KEY)) { 
      try { localStorage.setItem(MONSTER_MASH_FAVORITES_STORAGE_KEY, JSON.stringify(favorites)); } 
      catch (e) { console.error("Error saving favorites to localStorage", e); }
    } else if (favorites.length === 0 && localStorage.getItem(MONSTER_MASH_FAVORITES_STORAGE_KEY)) { 
      localStorage.removeItem(MONSTER_MASH_FAVORITES_STORAGE_KEY);
    }
  }, [favorites]);

  useEffect(() => {
     if (homebrewMonsters.length > 0 || localStorage.getItem(MONSTER_MASH_HOMEBREW_STORAGE_KEY)) {
        try { localStorage.setItem(MONSTER_MASH_HOMEBREW_STORAGE_KEY, JSON.stringify(homebrewMonsters)); } 
        catch (e) { console.error("Error saving homebrew monsters to localStorage", e); }
     } else if (homebrewMonsters.length === 0 && localStorage.getItem(MONSTER_MASH_HOMEBREW_STORAGE_KEY)) {
        localStorage.removeItem(MONSTER_MASH_HOMEBREW_STORAGE_KEY);
     }
  }, [homebrewMonsters]);


  const proceedWithPendingAction = () => {
    if (pendingActionAfterUnsavedDialog) {
      pendingActionAfterUnsavedDialog();
      setPendingActionAfterUnsavedDialog(null);
    }
  };

  const handleOpenCreateHomebrewForm = () => {
    const action = () => {
        setSelectedMonster(null);
        setEditingHomebrewIndex(null);
        setHomebrewFormData(initialHomebrewFormData);
        setInitialEditFormData(null); // Clear initial edit data
        setIsCreatingHomebrew(true);
        setIsHomebrewFormDirty(false); // New form is not dirty initially
    };

    if (isCreatingHomebrew && isHomebrewFormDirty) {
        setPendingActionAfterUnsavedDialog(() => action);
        setIsUnsavedChangesDialogOpen(true);
    } else {
        action();
    }
  };
  
  const handleOpenEditHomebrewForm = (monster: MonsterDetail) => {
     const action = () => {
        setSelectedMonster(monster);
        setEditingHomebrewIndex(monster.index);
        const formData = monsterDetailToFormData(monster);
        setHomebrewFormData(formData);
        setInitialEditFormData(formData); // Store initial data for dirty checking
        setIsCreatingHomebrew(true);
        setIsHomebrewFormDirty(false); // Form is not dirty initially when loading existing monster
    };
    if (isCreatingHomebrew && isHomebrewFormDirty && editingHomebrewIndex !== monster.index) {
      setPendingActionAfterUnsavedDialog(() => action);
      setIsUnsavedChangesDialogOpen(true);
    } else {
      action();
    }
  };

  const fetchMonsterDetail = async (monsterIndex: string, source: 'api' | 'homebrew' = 'api') => {
    if (!monsterIndex) return;

    const action = async () => {
        setIsCreatingHomebrew(false); 
        setEditingHomebrewIndex(null);
        setHomebrewFormData(initialHomebrewFormData);
        setInitialEditFormData(null); 
        setIsLoadingDetail(true); setError(null); setSelectedMonster(null); 
        if (source === 'homebrew') {
            const homebrewDetail = homebrewMonsters.find(m => m.index === monsterIndex);
            if (homebrewDetail) { setSelectedMonster(homebrewDetail); } 
            else { setError(`Could not find homebrew monster ${monsterIndex}.`); }
            setIsLoadingDetail(false); return;
        }
        try {
          const response = await fetch(`${DND5E_API_BASE_URL}/api/monsters/${monsterIndex}`);
          if (!response.ok) throw new Error(`Failed to fetch details for ${monsterIndex}: ${response.statusText}`);
          const data: MonsterDetail = await response.json();
          setSelectedMonster({...data, source: 'api'}); 
        } catch (err: any) {
          console.error("Error fetching monster detail:", err);
          setError(err.message || `Could not load details for ${monsterIndex}.`);
          setSelectedMonster(null); 
        } finally { setIsLoadingDetail(false); }
    };

    if (isCreatingHomebrew && isHomebrewFormDirty) {
      setPendingActionAfterUnsavedDialog(() => action);
      setIsUnsavedChangesDialogOpen(true);
    } else {
      action();
    }
  };

  const handleUnsavedChangesDialogChoice = (choice: 'save' | 'discard' | 'cancel') => {
    setIsUnsavedChangesDialogOpen(false);
    if (choice === 'save') {
      handleSaveHomebrewMonster(); // This will reset isCreatingHomebrew and dirty flag
      // if there was a pending action (like fetching another monster), it should proceed
      // The save function should ideally handle this by clearing isCreatingHomebrew, so the next fetch isn't blocked.
      // For now, we assume save makes the form clean and ready for the next action.
      // We need to make sure handleSaveHomebrewMonster also clears isCreatingHomebrew and isHomebrewFormDirty flags AFTER saving.
      setTimeout(() => { // Give time for save to complete and reset flags
         if(pendingActionAfterUnsavedDialog) {
            pendingActionAfterUnsavedDialog();
            setPendingActionAfterUnsavedDialog(null);
        }
      }, 100); // Small delay to allow save state updates
    } else if (choice === 'discard') {
      setIsCreatingHomebrew(false);
      setEditingHomebrewIndex(null);
      setHomebrewFormData(initialHomebrewFormData);
      setInitialEditFormData(null);
      setIsHomebrewFormDirty(false);
      if (pendingActionAfterUnsavedDialog) {
          pendingActionAfterUnsavedDialog();
          setPendingActionAfterUnsavedDialog(null);
      }
    } else { // Cancel
      setPendingActionAfterUnsavedDialog(null);
    }
  };

  const toggleFavorite = async (monsterToToggle: MonsterSummaryWithCR | MonsterDetail) => {
    const existingFav = favorites.find(f => f.index === monsterToToggle.index);
    if (existingFav) {
      setFavorites(favorites.filter(f => f.index !== monsterToToggle.index));
    } else {
      let crNum: number; let typeValue: string | undefined;
      let sourceValue: 'api' | 'homebrew' = (monsterToToggle as MonsterSummaryWithCR).source || 'api';

      if ('challenge_rating' in monsterToToggle && monsterToToggle.challenge_rating !== undefined) { 
        crNum = crToNumber(monsterToToggle.challenge_rating); typeValue = monsterToToggle.type;
      } else if ('cr' in monsterToToggle && monsterToToggle.cr !== undefined) { 
        crNum = monsterToToggle.cr; typeValue = monsterToToggle.type;
      } else {
         setError(`CR or Type undefined for ${monsterToToggle.name}. Cannot add to favorites.`); return; 
      }

      if (crNum === -1) { setError(`CR undefined for ${monsterToToggle.name}. Cannot add to favorites.`); return; }
      
      const newFavorite: FavoriteMonster = {
        index: monsterToToggle.index, name: monsterToToggle.name, cr: crNum, 
        type: typeValue || "Unknown Type", source: sourceValue
      };
      setFavorites(prevFavs => [...prevFavs, newFavorite]);
    }
  };

  const isFavorite = (monsterIndex: string) => favorites.some(f => f.index === monsterIndex);

  const handleHomebrewFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHomebrewFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleHomebrewSelectChange = (name: keyof HomebrewMonsterFormData, value: string) => {
    setHomebrewFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveHomebrewMonster = () => {
    if (!homebrewFormData.name.trim()) { setError("Homebrew monster name is required."); return; }
    const crNum = homebrewFormData.challenge_rating ? crToNumber(homebrewFormData.challenge_rating) : 0;
    const acVal = parseInt(homebrewFormData.armor_class_value || "10") || 10;
    const hpVal = parseInt(homebrewFormData.hit_points_value || "10") || 10;

    const monsterData: Omit<MonsterDetail, 'index' | 'url'> = {
        name: homebrewFormData.name.trim(),
        challenge_rating: crNum, 
        type: homebrewFormData.type?.trim() || "Unknown Type",
        size: homebrewFormData.size?.trim() || "Medium",
        armor_class: [{ type: homebrewFormData.armor_class_type?.trim() || "Natural Armor", value: acVal }],
        hit_points: hpVal, hit_dice: homebrewFormData.hit_points_dice?.trim(),
        speed: homebrewFormData.speed?.trim() || "30 ft.",
        strength: parseInt(homebrewFormData.str || "10") || 10,
        dexterity: parseInt(homebrewFormData.dex || "10") || 10,
        constitution: parseInt(homebrewFormData.con || "10") || 10,
        intelligence: parseInt(homebrewFormData.int || "10") || 10,
        wisdom: parseInt(homebrewFormData.wis || "10") || 10,
        charisma: parseInt(homebrewFormData.cha || "10") || 10,
        proficiencies: [], 
        damage_vulnerabilities: homebrewFormData.damage_vulnerabilities_text?.split(',').map(s => s.trim()).filter(Boolean) || [],
        damage_resistances: homebrewFormData.damage_resistances_text?.split(',').map(s => s.trim()).filter(Boolean) || [],
        damage_immunities: homebrewFormData.damage_immunities_text?.split(',').map(s => s.trim()).filter(Boolean) || [],
        condition_immunities: homebrewFormData.condition_immunities_text?.split(',').map(s => s.trim()).filter(Boolean) || [],
        senses: homebrewFormData.senses_text?.trim() || "Passive Perception 10",
        languages: homebrewFormData.languages?.trim() || "None",
        alignment: homebrewFormData.alignment?.trim() || "Unaligned",
        special_abilities: homebrewFormData.special_abilities_text?.trim(), 
        actions: homebrewFormData.actions_text?.trim(), 
        legendary_actions: homebrewFormData.legendary_actions_text?.trim(), 
        image: homebrewFormData.image_url?.trim(),
        source: 'homebrew', isHomebrew: true,
    };

    let newSelectedMonster: MonsterDetail | null = null;
    if (editingHomebrewIndex) {
        const updatedMonster = { ...monsterData, index: editingHomebrewIndex, url: '' };
        setHomebrewMonsters(prev => prev.map(m => m.index === editingHomebrewIndex ? updatedMonster : m));
        newSelectedMonster = updatedMonster;
    } else {
        const newIndex = `homebrew-${Date.now()}-${homebrewFormData.name.toLowerCase().replace(/\s+/g, '-')}`;
        const newMonster = { ...monsterData, index: newIndex, url: '' };
        setHomebrewMonsters(prev => [...prev, newMonster]);
        newSelectedMonster = newMonster;
    }
    
    setIsCreatingHomebrew(false); 
    setEditingHomebrewIndex(null);
    setHomebrewFormData(initialHomebrewFormData); 
    setInitialEditFormData(null);
    setError(null);
    setIsHomebrewFormDirty(false);
    setSelectedMonster(newSelectedMonster); // Display the newly saved/updated monster
  };

  const handleOpenDeleteHomebrewConfirm = (monsterIndex: string) => {
    setMonsterToDeleteIndex(monsterIndex);
    setIsDeleteHomebrewConfirmOpen(true);
  };

  const handleConfirmDeleteHomebrew = () => {
    if (!monsterToDeleteIndex) return;
    setHomebrewMonsters(prev => prev.filter(m => m.index !== monsterToDeleteIndex));
    setFavorites(prev => prev.filter(f => f.index !== monsterToDeleteIndex));
    if (selectedMonster?.index === monsterToDeleteIndex) {
      setSelectedMonster(null);
    }
    if (editingHomebrewIndex === monsterToDeleteIndex) {
      setIsCreatingHomebrew(false);
      setEditingHomebrewIndex(null);
      setHomebrewFormData(initialHomebrewFormData);
      setInitialEditFormData(null);
      setIsHomebrewFormDirty(false);
    }
    setIsDeleteHomebrewConfirmOpen(false);
    setMonsterToDeleteIndex(null);
  };

  const handleCancelHomebrewForm = () => {
     if (isHomebrewFormDirty) {
        setIsUnsavedChangesDialogOpen(true);
        setPendingActionAfterUnsavedDialog(() => () => { // Action to take if user discards
            setIsCreatingHomebrew(false);
            setEditingHomebrewIndex(null);
            setHomebrewFormData(initialHomebrewFormData);
            setInitialEditFormData(null);
            setIsHomebrewFormDirty(false);
        });
    } else {
        setIsCreatingHomebrew(false);
        setEditingHomebrewIndex(null);
        setHomebrewFormData(initialHomebrewFormData);
        setInitialEditFormData(null);
        setIsHomebrewFormDirty(false);
    }
  };


  const formatArmorClass = (acArray: MonsterDetail["armor_class"] | undefined): string => {
    if (!acArray || acArray.length === 0) return "N/A";
    const mainAc = acArray[0]; 
    let str = `${mainAc.value} (${mainAc.type})`;
    // Shadcn ArmorClass type has desc, simple object might not
    if ('desc' in mainAc && (mainAc as ArmorClass).desc) {
      str += ` - ${(mainAc as ArmorClass).desc}`;
    }
    return str;
  };
  
  const renderMonsterTextField = (label: string, textContent: string | undefined | null) => {
    if (!textContent || textContent.trim() === "") return null;
    const paragraphs = textContent.split('\n').map(para => para.trim()).filter(Boolean);
    return (
      <div>
        <h4 className="font-semibold mt-2 mb-1 text-primary">{label}</h4>
        {paragraphs.map((paragraph, index) => {
          const parts = paragraph.split(/\*\*(.*?)\*\*/g); // Split by **bold**
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

  const renderMonsterActions = (actions: MonsterAction[] | SpecialAbility[] | LegendaryAction[] | undefined) => {
    if (!actions || actions.length === 0) return <p className="text-sm text-muted-foreground">None</p>;
    type ActionType = MonsterAction | SpecialAbility | LegendaryAction;
    return (
      <ul className="list-disc pl-5 space-y-2">
        {actions.map((action: ActionType) => (
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
    );
  };

  const formatCRSliderRangeLabel = (): string => {
    const minLabel = formatCRDisplay(crRange[0]); const maxLabel = formatCRDisplay(crRange[1]);
    if (crRange[0] === CR_SLIDER_MIN && crRange[1] === CR_SLIDER_MAX) return "CR Range: All";
    return `CR Range: ${minLabel} - ${maxLabel}`;
  };
  const handleCRSliderChange = (newSliderValues: number[]) => {
    if (newSliderValues.length === 2) {
      const [rawMin, rawMax] = newSliderValues;
      const snappedMin = snapCRValue(rawMin); const snappedMax = snapCRValue(rawMax);
      setCrRange([snappedMin, Math.max(snappedMin, snappedMax)]);
    }
  };

  const sortedFavorites = [...favorites].sort((a, b) => {
    let valA, valB;
    if (favoritesSortConfig.key === 'name') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); } 
    else { valA = a.cr; valB = b.cr; }
    let comparison = 0; if (valA > valB) {comparison = 1;} else if (valA < valB) {comparison = -1;}
    return favoritesSortConfig.order === 'asc' ? comparison : comparison * -1;
  });
  const sortedHomebrew = [...homebrewMonsters].sort((a, b) => {
    let valA, valB;
    if (homebrewSortConfig.key === 'name') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); } 
    else { valA = crToNumber(a.challenge_rating); valB = crToNumber(b.challenge_rating); }
    let comparison = 0; if (valA > valB) {comparison = 1;} else if (valA < valB) {comparison = -1;}
    return homebrewSortConfig.order === 'asc' ? comparison : comparison * -1;
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full h-full max-w-full sm:max-w-full flex flex-col p-0 overflow-hidden" 
        hideCloseButton={true}
      >
        <SheetHeader className="p-4 border-b bg-primary text-primary-foreground flex flex-row items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <SheetTitle className="flex items-center text-2xl text-primary-foreground">
              <Skull className="mr-3 h-7 w-7"/>Monster Mash
            </SheetTitle>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary/80" tabIndex={-1}>
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>Search the D&D 5e bestiary or your homebrew creations. Building the local index of API monster CRs may be slow on first open.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </SheetHeader>

        <div className="flex flex-1 min-h-0 border-t pr-8 relative"> {/* Main 3-column container */}
          {/* Left Sidebar: Favorites & Homebrew (Column 1) */}
          <div className="w-1/5 min-w-[200px] max-w-[280px] border-r bg-card p-3 flex flex-col space-y-4 overflow-y-auto">
            <Accordion type="multiple" defaultValue={["favorites-section", "homebrew-section"]} className="w-full">
              <AccordionItem value="favorites-section">
                <AccordionTrigger className="py-2 hover:no-underline">
                  <div className="flex justify-between items-center w-full pr-2">
                    <h3 className="text-lg font-semibold text-primary">Favorites ({favorites.length})</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><ArrowUpDown className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Sort Key</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={favoritesSortConfig.key} onValueChange={(value) => setFavoritesSortConfig(prev => ({ ...prev, key: value as SortKey }))}>
                          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem><DropdownMenuRadioItem value="cr">CR</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                        <DropdownMenuSeparator /><DropdownMenuLabel>Order</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={favoritesSortConfig.order} onValueChange={(value) => setFavoritesSortConfig(prev => ({ ...prev, order: value as SortOrder }))}>
                          <DropdownMenuRadioItem value="asc">Asc</DropdownMenuRadioItem><DropdownMenuRadioItem value="desc">Desc</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-0">
                  <Separator className="mb-2" />
                  <ScrollArea className="h-40"> 
                    {favorites.length === 0 ? <p className="text-sm text-muted-foreground">No favorites yet.</p> : (
                      <ul className="space-y-1">
                        {sortedFavorites.map(fav => (
                          <li key={fav.index} onClick={() => fetchMonsterDetail(fav.index, fav.source)}
                            className={cn("p-2 rounded-md hover:bg-muted cursor-pointer text-sm flex justify-between items-center", selectedMonster?.index === fav.index && "bg-primary/10 text-primary font-medium")}>
                            <span className="truncate">{fav.name} <span className="text-xs text-muted-foreground">(CR {formatCRDisplay(fav.cr)})</span></span>
                            {fav.source === 'homebrew' && (
                              <TooltipProvider delayDuration={50}>
                                <Tooltip><TooltipTrigger asChild>
                                  <Dna className="h-4 w-4 text-muted-foreground ml-1 shrink-0"/>
                                </TooltipTrigger><TooltipContent><p>Homebrew</p></TooltipContent></Tooltip>
                              </TooltipProvider>
                            )}
                          </li>))}
                      </ul>
                    )}
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="homebrew-section">
                <AccordionTrigger className="py-2 hover:no-underline">
                  <div className="flex justify-between items-center w-full pr-2">
                    <h3 className="text-lg font-semibold text-primary">Homebrew ({homebrewMonsters.length})</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><ArrowUpDown className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Sort Key</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={homebrewSortConfig.key} onValueChange={(value) => setHomebrewSortConfig(prev => ({ ...prev, key: value as SortKey }))}>
                          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem><DropdownMenuRadioItem value="cr">CR</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                        <DropdownMenuSeparator /><DropdownMenuLabel>Order</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={homebrewSortConfig.order} onValueChange={(value) => setHomebrewSortConfig(prev => ({ ...prev, order: value as SortOrder }))}>
                          <DropdownMenuRadioItem value="asc">Asc</DropdownMenuRadioItem><DropdownMenuRadioItem value="desc">Desc</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-0">
                  <Separator className="mb-2" />
                  <ScrollArea className="h-40"> 
                    {homebrewMonsters.length === 0 ? <p className="text-sm text-muted-foreground">No homebrew monsters.</p> : (
                      <ul className="space-y-1">
                        {sortedHomebrew.map(hb => (
                          <li key={hb.index} onClick={() => fetchMonsterDetail(hb.index, 'homebrew')}
                            className={cn("p-2 rounded-md hover:bg-muted cursor-pointer text-sm flex justify-between items-center", selectedMonster?.index === hb.index && "bg-primary/10 text-primary font-medium")}>
                            <span>{hb.name} <span className="text-xs text-muted-foreground">(CR {formatCRDisplay(hb.challenge_rating)})</span></span>
                          </li>))}
                      </ul>
                    )}
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Middle Column: Search/Filters & Results (Column 2) */}
          <div className="w-2/5 flex flex-col p-4 border-r bg-background overflow-y-auto">
            <div className="sticky top-0 bg-background z-10 py-3 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="relative flex-grow">
                        <Input id="monster-search" placeholder="Search Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-8 h-9"/>
                        {searchTerm && <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm("")}><X className="h-4 w-4"/></Button>}
                    </div>
                    <TooltipProvider><Tooltip><TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={handleOpenCreateHomebrewForm}>
                            <PlusCircle className="h-5 w-5"/>
                        </Button>
                    </TooltipTrigger><TooltipContent><p>Create Custom Enemy</p></TooltipContent></Tooltip></TooltipProvider>
                </div>
                <div>
                    <Label htmlFor="cr-slider" className="text-sm mb-1 block">{formatCRSliderRangeLabel()}</Label>
                    <Slider id="cr-slider" min={CR_SLIDER_MIN} max={CR_SLIDER_MAX} step={0.125} value={crRange} onValueChange={handleCRSliderChange} className="my-2"/>
                </div>
            </div>

            <div className="flex flex-col border rounded-lg overflow-hidden flex-1 bg-card mt-3">
              <div className="p-3 bg-muted border-b flex justify-between items-center">
                <h3 className="text-md font-semibold text-primary">Results ({isLoadingList || isBuildingIndex ? "..." : filteredMonsters.length})</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><ArrowUpDown className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort Key</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={resultsSortConfig.key} onValueChange={(value) => setResultsSortConfig(prev => ({ ...prev, key: value as SortKey }))}>
                      <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="cr">CR</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator /><DropdownMenuLabel>Order</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={resultsSortConfig.order} onValueChange={(value) => setResultsSortConfig(prev => ({ ...prev, order: value as SortOrder }))}>
                      <DropdownMenuRadioItem value="asc">Asc</DropdownMenuRadioItem><DropdownMenuRadioItem value="desc">Desc</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {isBuildingIndex ? ( <div className="flex-1 flex flex-col items-center justify-center p-4 text-center"> <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" /><p className="text-sm text-muted-foreground">Building local monster index... <br/>This may take a moment.</p></div>
              ) : isLoadingList ? ( <div className="flex-1 flex items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : error && !isLoadingList && allMonstersData.length === 0 && homebrewMonsters.length === 0 ? ( <p className="p-4 text-destructive text-center">{error}</p>
              ) : filteredMonsters.length === 0 && !isLoadingList && !isBuildingIndex ? ( <p className="p-4 text-sm text-muted-foreground text-center"> {allMonstersData.length > 0 || homebrewMonsters.length > 0 ? "No monsters match search/filter." : "No monsters loaded."} </p>
              ) : (
                <ScrollArea className="flex-1">
                  <ul className="divide-y">
                    {filteredMonsters.map(monster => (
                      <li key={monster.index} className={cn("p-2 hover:bg-muted/50 flex justify-between items-center", selectedMonster?.index === monster.index && "bg-primary/10")}>
                        <span className="font-medium text-sm cursor-pointer flex-1" onClick={() => fetchMonsterDetail(monster.index, monster.source)}>
                          {monster.name} {monster.cr !== undefined ? <span className="text-xs text-muted-foreground">(CR {formatCRDisplay(monster.cr)})</span> : ""}
                          {monster.source === 'homebrew' && <Badge variant="secondary" className="ml-2 text-xs">Homebrew</Badge>}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => toggleFavorite(monster)} className="h-7 w-7" aria-label={isFavorite(monster.index) ? "Unfavorite" : "Favorite"}>
                          <Star className={cn("h-4 w-4", isFavorite(monster.index) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")}/>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </div>
          </div>

          {/* Right Column: Monster Details or Homebrew Form (Column 3) */}
          <div className="flex-1 flex flex-col bg-card border-l"> 
            <div className="p-3 border-b flex justify-between items-center sticky top-0 bg-card z-10">
                <h3 className="text-md font-semibold truncate pr-2 text-foreground">
                    {isCreatingHomebrew ? (editingHomebrewIndex ? "Edit Homebrew Monster" : "Create Homebrew Monster") 
                        : (selectedMonster ? selectedMonster.name : "Monster Details")}
                    {selectedMonster && selectedMonster.isHomebrew && !isCreatingHomebrew && <Badge variant="outline" className="ml-2 align-middle">Homebrew</Badge>}
                </h3>
                {!isCreatingHomebrew && selectedMonster && (
                    <div className="flex gap-1 items-center">
                        {selectedMonster.isHomebrew && (
                            <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditHomebrewForm(selectedMonster)} className="h-8 w-8">
                                <Edit3 className="h-5 w-5 text-muted-foreground/70 hover:text-muted-foreground"/>
                                </Button>
                            </TooltipTrigger><TooltipContent>Edit Homebrew</TooltipContent></Tooltip></TooltipProvider>
                        )}
                        <TooltipProvider><Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => toggleFavorite(selectedMonster)} className="h-8 w-8" aria-label={isFavorite(selectedMonster.index) ? "Unfavorite" : "Favorite"}>
                            <Star className={cn("h-5 w-5", isFavorite(selectedMonster.index) && "text-yellow-400 fill-yellow-400", !isFavorite(selectedMonster.index) && "text-muted-foreground/70")}/>
                            </Button>
                        </TooltipTrigger><TooltipContent>{isFavorite(selectedMonster.index) ? "Unfavorite" : "Favorite"}</TooltipContent></Tooltip></TooltipProvider>
                        <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled className="h-8 w-8"><ShieldAlert className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent>Add to Combat (TBD)</TooltipContent></Tooltip></TooltipProvider>
                        <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled className="h-8 w-8"><MapPin className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent>Add to Location (TBD)</TooltipContent></Tooltip></TooltipProvider>
                    </div>
                )}
                {isCreatingHomebrew && editingHomebrewIndex && (
                    <Button onClick={handleSaveHomebrewMonster} disabled={!isHomebrewFormDirty} size="sm">
                        <Save className="mr-2 h-4 w-4" /> Update Changes
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4"> 
                {isCreatingHomebrew ? (
                    <div className="space-y-3 text-sm">
                        {/* Form Fields */}
                        <div><Label htmlFor="hb-name">Name*</Label><Input id="hb-name" name="name" value={homebrewFormData.name} onChange={handleHomebrewFormChange} /></div>
                        <div><Label htmlFor="hb-cr">CR</Label><Input id="hb-cr" name="challenge_rating" value={homebrewFormData.challenge_rating || ""} onChange={handleHomebrewFormChange} placeholder="e.g., 5 or 1/2"/></div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div> <Label htmlFor="hb-type">Type</Label> <Select name="type" value={homebrewFormData.type} onValueChange={(value) => handleHomebrewSelectChange("type", value || "")}> <SelectTrigger id="hb-type"><SelectValue placeholder="Select Type..." /></SelectTrigger> <SelectContent>{MONSTER_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent> </Select> </div>
                          <div> <Label htmlFor="hb-size">Size</Label> <Select name="size" value={homebrewFormData.size} onValueChange={(value) => handleHomebrewSelectChange("size", value || "")}> <SelectTrigger id="hb-size"><SelectValue placeholder="Select Size..." /></SelectTrigger> <SelectContent>{MONSTER_SIZES.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}</SelectContent> </Select> </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div><Label htmlFor="hb-ac-value">AC Value</Label><Input id="hb-ac-value" name="armor_class_value" value={homebrewFormData.armor_class_value} onChange={handleHomebrewFormChange} /></div>
                            <div> <Label htmlFor="hb-ac-type">AC Type</Label> <Select name="armor_class_type" value={homebrewFormData.armor_class_type} onValueChange={(value) => handleHomebrewSelectChange("armor_class_type", value || "")}> <SelectTrigger id="hb-ac-type"><SelectValue placeholder="Select AC Type..." /></SelectTrigger> <SelectContent>{MONSTER_AC_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent> </Select> </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div><Label htmlFor="hb-hp-value">HP Value</Label><Input id="hb-hp-value" name="hit_points_value" value={homebrewFormData.hit_points_value} onChange={handleHomebrewFormChange} /></div>
                            <div><Label htmlFor="hb-hp-dice">HP Dice</Label><Input id="hb-hp-dice" name="hit_points_dice" value={homebrewFormData.hit_points_dice || ""} onChange={handleHomebrewFormChange} placeholder="e.g., 6d10+12"/></div>
                        </div>
                        <div><Label htmlFor="hb-speed">Speed</Label><Input id="hb-speed" name="speed" value={homebrewFormData.speed} onChange={handleHomebrewFormChange} placeholder="e.g., 30 ft., fly 60 ft."/></div>
                        
                        <div className="grid grid-cols-3 gap-2">
                            <div><Label htmlFor="hb-str">STR</Label><Input id="hb-str" name="str" value={homebrewFormData.str} onChange={handleHomebrewFormChange}/></div>
                            <div><Label htmlFor="hb-dex">DEX</Label><Input id="hb-dex" name="dex" value={homebrewFormData.dex} onChange={handleHomebrewFormChange}/></div>
                            <div><Label htmlFor="hb-con">CON</Label><Input id="hb-con" name="con" value={homebrewFormData.con} onChange={handleHomebrewFormChange}/></div>
                            <div><Label htmlFor="hb-int">INT</Label><Input id="hb-int" name="int" value={homebrewFormData.int} onChange={handleHomebrewFormChange}/></div>
                            <div><Label htmlFor="hb-wis">WIS</Label><Input id="hb-wis" name="wis" value={homebrewFormData.wis} onChange={handleHomebrewFormChange}/></div>
                            <div><Label htmlFor="hb-cha">CHA</Label><Input id="hb-cha" name="cha" value={homebrewFormData.cha} onChange={handleHomebrewFormChange}/></div>
                        </div>

                        <div><Label htmlFor="hb-senses">Senses</Label><Input id="hb-senses" name="senses_text" value={homebrewFormData.senses_text || ""} onChange={handleHomebrewFormChange} placeholder="e.g., Darkvision 60 ft., Passive Perception 10"/></div>
                        <div><Label htmlFor="hb-languages">Languages</Label><Input id="hb-languages" name="languages" value={homebrewFormData.languages || ""} onChange={handleHomebrewFormChange} placeholder="e.g., Common, Draconic"/></div>
                        <div> <Label htmlFor="hb-alignment">Alignment</Label> <Select name="alignment" value={homebrewFormData.alignment} onValueChange={(value) => handleHomebrewSelectChange("alignment", value || "")}> <SelectTrigger id="hb-alignment"><SelectValue placeholder="Select Alignment..." /></SelectTrigger> <SelectContent>{MONSTER_ALIGNMENTS.map(align => <SelectItem key={align} value={align}>{align}</SelectItem>)}</SelectContent> </Select> </div>
                        
                        <div><Label htmlFor="hb-vuln">Vulnerabilities (comma-sep)</Label><Input id="hb-vuln" name="damage_vulnerabilities_text" value={homebrewFormData.damage_vulnerabilities_text || ""} onChange={handleHomebrewFormChange}/></div>
                        <div><Label htmlFor="hb-resist">Resistances (comma-sep)</Label><Input id="hb-resist" name="damage_resistances_text" value={homebrewFormData.damage_resistances_text || ""} onChange={handleHomebrewFormChange}/></div>
                        <div><Label htmlFor="hb-immune">Immunities (comma-sep)</Label><Input id="hb-immune" name="damage_immunities_text" value={homebrewFormData.damage_immunities_text || ""} onChange={handleHomebrewFormChange}/></div>
                        <div><Label htmlFor="hb-cond-immune">Condition Immunities (comma-sep)</Label><Input id="hb-cond-immune" name="condition_immunities_text" value={homebrewFormData.condition_immunities_text || ""} onChange={handleHomebrewFormChange}/></div>
                        
                        <div><Label htmlFor="hb-abilities">Special Abilities</Label><Textarea id="hb-abilities" name="special_abilities_text" value={homebrewFormData.special_abilities_text || ""} onChange={handleHomebrewFormChange} rows={3} placeholder="One ability per paragraph. Start with name in bold (e.g. **Keen Smell**. The monster has...)."/></div>
                        <div><Label htmlFor="hb-actions">Actions</Label><Textarea id="hb-actions" name="actions_text" value={homebrewFormData.actions_text || ""} onChange={handleHomebrewFormChange} rows={3} placeholder="One action per paragraph. Start with name in bold (e.g. **Bite**. Melee Weapon Attack: ...)."/></div>
                        <div><Label htmlFor="hb-legendary">Legendary Actions</Label><Textarea id="hb-legendary" name="legendary_actions_text" value={homebrewFormData.legendary_actions_text || ""} onChange={handleHomebrewFormChange} rows={2} placeholder="Optional. One action per paragraph."/></div>
                        <div><Label htmlFor="hb-image">Image URL (Optional)</Label><Input id="hb-image" name="image_url" value={homebrewFormData.image_url || ""} onChange={handleHomebrewFormChange} /></div>
                        
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        
                        <div className="flex gap-2 mt-4">
                            {!editingHomebrewIndex && ( // Only show "Save New Monster" when creating
                                <Button onClick={handleSaveHomebrewMonster}>
                                    <Save className="mr-2 h-4 w-4"/>Save New Monster
                                </Button>
                            )}
                             <Button variant="outline" onClick={handleCancelHomebrewForm}>
                                {editingHomebrewIndex ? "Cancel Editing" : "Cancel Creation"}
                            </Button>
                            {editingHomebrewIndex && (
                                <Button variant="destructive" onClick={() => handleOpenDeleteHomebrewConfirm(editingHomebrewIndex)} className="ml-auto">
                                    <Trash2 className="mr-2 h-4 w-4"/> Delete Monster
                                </Button>
                            )}
                        </div>
                    </div>
                ) : isLoadingDetail ? (
                  <div className="flex-1 flex items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : selectedMonster ? (
                  <div className="space-y-3 text-sm">
                      <p className="text-sm text-muted-foreground">{selectedMonster.size} {selectedMonster.type} {selectedMonster.subtype ? `(${selectedMonster.subtype})` : ''}, {selectedMonster.alignment}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs border p-2 rounded-md bg-background">
                        <div><strong>AC:</strong> {formatArmorClass(selectedMonster.armor_class)}</div>
                        <div><strong>HP:</strong> {selectedMonster.hit_points} {selectedMonster.hit_dice ? `(${selectedMonster.hit_dice})` : ''}</div>
                        <div><strong>CR:</strong> {formatCRDisplay(selectedMonster.challenge_rating)} {selectedMonster.xp ? `(${selectedMonster.xp} XP)` : ''}</div>
                      </div>
                      <div><strong>Speed:</strong> {typeof selectedMonster.speed === 'string' ? selectedMonster.speed : selectedMonster.speed ? Object.entries(selectedMonster.speed).map(([key, val]) => `${key} ${val}`).join(', ') : 'N/A'}</div>
                      <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-xs border p-2 rounded-md bg-background">
                        <div className="text-center"><strong>STR</strong><br/>{selectedMonster.strength ?? 'N/A'} ({selectedMonster.strength ? Math.floor((selectedMonster.strength - 10) / 2) : 'N/A'})</div>
                        <div className="text-center"><strong>DEX</strong><br/>{selectedMonster.dexterity ?? 'N/A'} ({selectedMonster.dexterity ? Math.floor((selectedMonster.dexterity - 10) / 2) : 'N/A'})</div>
                        <div className="text-center"><strong>CON</strong><br/>{selectedMonster.constitution ?? 'N/A'} ({selectedMonster.constitution ? Math.floor((selectedMonster.constitution - 10) / 2) : 'N/A'})</div>
                        <div className="text-center"><strong>INT</strong><br/>{selectedMonster.intelligence ?? 'N/A'} ({selectedMonster.intelligence ? Math.floor((selectedMonster.intelligence - 10) / 2) : 'N/A'})</div>
                        <div className="text-center"><strong>WIS</strong><br/>{selectedMonster.wisdom ?? 'N/A'} ({selectedMonster.wisdom ? Math.floor((selectedMonster.wisdom - 10) / 2) : 'N/A'})</div>
                        <div className="text-center"><strong>CHA</strong><br/>{selectedMonster.charisma ?? 'N/A'} ({selectedMonster.charisma ? Math.floor((selectedMonster.charisma - 10) / 2) : 'N/A'})</div>
                      </div>
                      {selectedMonster.proficiencies?.length > 0 && (<div><strong>Saving Throws & Skills:</strong> {selectedMonster.proficiencies.map(p => `${p.proficiency.name.replace("Saving Throw: ", "").replace("Skill: ", "")} +${p.value}`).join(', ')}</div>)}
                      {selectedMonster.damage_vulnerabilities?.length > 0 && <div><strong>Vulnerabilities:</strong> {selectedMonster.damage_vulnerabilities.join(', ')}</div>}
                      {selectedMonster.damage_resistances?.length > 0 && <div><strong>Resistances:</strong> {selectedMonster.damage_resistances.join(', ')}</div>}
                      {selectedMonster.damage_immunities?.length > 0 && <div><strong>Immunities:</strong> {selectedMonster.damage_immunities.join(', ')}</div>}
                      {selectedMonster.condition_immunities?.length > 0 && <div><strong>Condition Immunities:</strong> {(Array.isArray(selectedMonster.condition_immunities) && typeof selectedMonster.condition_immunities[0] !== 'string') ? (selectedMonster.condition_immunities as { index: string; name: string; url: string }[]).map(ci => ci.name).join(', ') : (selectedMonster.condition_immunities as string[]).join(', ') }</div>}
                      <div><strong>Senses:</strong> {typeof selectedMonster.senses === 'string' ? selectedMonster.senses : selectedMonster.senses ? Object.entries(selectedMonster.senses).map(([key, val]) => `${key.replace("_", " ")} ${val}`).join(', ') : 'N/A'}</div>
                      <div><strong>Languages:</strong> {selectedMonster.languages || "None"}</div>
                      {renderMonsterTextField("Special Abilities", typeof selectedMonster.special_abilities === 'string' ? selectedMonster.special_abilities : undefined)}
                      {typeof selectedMonster.special_abilities !== 'string' && renderMonsterActions(selectedMonster.special_abilities)}
                      {renderMonsterTextField("Actions", typeof selectedMonster.actions === 'string' ? selectedMonster.actions : undefined)}
                      {typeof selectedMonster.actions !== 'string' && renderMonsterActions(selectedMonster.actions)}
                      {renderMonsterTextField("Legendary Actions", typeof selectedMonster.legendary_actions === 'string' ? selectedMonster.legendary_actions : undefined)}
                      {typeof selectedMonster.legendary_actions !== 'string' && renderMonsterActions(selectedMonster.legendary_actions)}
                      {selectedMonster.image && (<div className="mt-2"><Image src={selectedMonster.source === 'api' ? `${DND5E_API_BASE_URL}${selectedMonster.image}` : selectedMonster.image} alt={selectedMonster.name} width={300} height={300} className="rounded-md border object-contain mx-auto" data-ai-hint={`${selectedMonster.type || 'monster'} image`}/></div>)}
                  </div>
                ) : error && !isBuildingIndex && !isLoadingList ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-4 text-center"> <AlertTriangle className="h-12 w-12 text-destructive mb-2"/><p className="text-destructive text-center">{error}</p> </div>
                ) : !isBuildingIndex && !isLoadingList && (
                  <div className="flex-1 flex flex-col items-center justify-center p-4 text-center"> <BookOpen className="h-12 w-12 text-muted-foreground mb-2"/><p className="text-sm text-muted-foreground">Select a monster or create homebrew.</p> </div>
                )}
                </div>
            </ScrollArea>
          </div>
        </div> {/* End Main 3-column container */}

        {/* Vertical Close Bar */}
        <button onClick={() => {
          if (isCreatingHomebrew && isHomebrewFormDirty) { 
            setIsUnsavedChangesDialogOpen(true); 
             setPendingActionAfterUnsavedDialog(() => () => onOpenChange(false));
          } else { onOpenChange(false); }
        }}
          className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]"
          aria-label="Close Monster Mash">
          <ChevronRight className="h-6 w-6" />
        </button>

        <AlertDialog open={isUnsavedChangesDialogOpen} onOpenChange={setIsUnsavedChangesDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes in the homebrew monster form. What would you like to do?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => handleUnsavedChangesDialogChoice('cancel')}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleUnsavedChangesDialogChoice('discard')}>Discard Changes</Button>
              <Button onClick={() => handleUnsavedChangesDialogChoice('save')}>{editingHomebrewIndex ? "Save Changes & Continue" : "Save New Monster & Continue"}</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isDeleteHomebrewConfirmOpen} onOpenChange={setIsDeleteHomebrewConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the homebrew monster "{homebrewMonsters.find(m => m.index === monsterToDeleteIndex)?.name || 'this monster'}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteHomebrewConfirmOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDeleteHomebrew} className={cn(buttonVariants({variant: 'destructive'}))}>Delete Monster</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}

// Helper for buttonVariants
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
type VariantProps<T extends (...args: any) => any> = Parameters<T>[0] extends undefined | null ? {} : Parameters<T>[0];


export { buttonVariants };
export type ButtonVariants = VariantProps<typeof buttonVariants>;
