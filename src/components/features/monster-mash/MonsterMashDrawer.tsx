
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
  MONSTER_ALIGNMENTS,
  ENCOUNTER_STORAGE_KEY_PREFIX
} from "@/lib/constants";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { useCampaign } from "@/contexts/campaign-context";
import type { EncounterMonster } from "@/lib/types";
import { cva } from "class-variance-authority";


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

export const formatCRDisplay = (crValue: string | number | undefined): string => {
    if (crValue === undefined || crValue === null || crValue === -1) return "N/A";
    const numCR = typeof crValue === 'string' ? crToNumber(crValue) : crValue;

    if (numCR === -1) return "N/A";
    if (numCR === 0) return "0";
    if (numCR === 0.125) return "1/8";
    if (numCR === 0.25) return "1/4";
    if (numCR === 0.5) return "1/2";
    if (numCR === 0.75) return "3/4"; 
    if (Number.isInteger(numCR)) return numCR.toString();
    if (numCR > 0 && numCR < 1) {
        for (let i = 8; i >= 2; i /= 2) {
            if (Math.abs(numCR - 1/i) < 0.001) return `1/${i}`;
        }
    }
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
  image_url: "", alignment: "", languages: "", senses_text: "",
  damage_vulnerabilities_text: "", damage_resistances_text: "", damage_immunities_text: "",
  condition_immunities_text: ""
};

const monsterDetailToFormData = (monster: MonsterDetail): HomebrewMonsterFormData => {
  let acValue = "10";
  let acType = "Natural Armor";
  if (monster.armor_class && monster.armor_class.length > 0) {
    const firstAc = monster.armor_class[0];
    acValue = firstAc.value.toString();
    acType = firstAc.type;
  }

  return {
    name: monster.name || "",
    challenge_rating: monster.challenge_rating !== undefined ? formatCRDisplay(monster.challenge_rating) : "",
    type: monster.type || "",
    size: monster.size || "",
    armor_class_value: acValue,
    armor_class_type: acType,
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
    alignment: monster.alignment || "",
    languages: monster.languages || "",
    senses_text: typeof monster.senses === 'string' ? monster.senses : (monster.senses ? Object.entries(monster.senses).map(([k, v]) => `${k.replace(/_/g, ' ')} ${v}`).join(', ') : ""),
    damage_vulnerabilities_text: Array.isArray(monster.damage_vulnerabilities) ? monster.damage_vulnerabilities.join(', ') : "",
    damage_resistances_text: Array.isArray(monster.damage_resistances) ? monster.damage_resistances.join(', ') : "",
    damage_immunities_text: Array.isArray(monster.damage_immunities) ? monster.damage_immunities.join(', ') : "",
    condition_immunities_text: Array.isArray(monster.condition_immunities) ? monster.condition_immunities.map(ci => typeof ci === 'string' ? ci : ci.name).join(', ') : (typeof monster.condition_immunities === 'string' ? monster.condition_immunities : ""),
  };
};


export function MonsterMashDrawer({ open, onOpenChange }: MonsterMashDrawerProps) {
  const { activeCampaign } = useCampaign();
  const { toast } = useToast();
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
  const [pendingMonsterFetchArgs, setPendingMonsterFetchArgs] = useState<{ index: string; source?: 'api' | 'homebrew' } | null>(null);

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

  const applyFiltersAndSort = useCallback(() => {
    let combinedData: MonsterSummaryWithCR[] = [
        ...allMonstersData.filter(m => m.source !== 'homebrew'),
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
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
        } else { 
            valA = a.cr === undefined ? (sortOrder === 'asc' ? Infinity : -Infinity) : a.cr;
            valB = b.cr === undefined ? (sortOrder === 'asc' ? Infinity : -Infinity) : b.cr;
        }

        let comparison = 0;
        if (valA > valB) {
            comparison = 1;
        } else if (valA < valB) {
            comparison = -1;
        }
        return sortOrder === 'asc' ? comparison : comparison * -1;
    });

    setFilteredMonsters(tempFiltered);
  }, [allMonstersData, homebrewMonsters, searchTerm, crRange, resultsSortConfig]);

  const fetchAndCacheFullMonsterIndex = useCallback(async () => {
    setIsBuildingIndex(true); setIsLoadingList(true); setError(null);
    try {
      const summaryResponse = await fetch(`${DND5E_API_BASE_URL}/api/monsters`);
      if (!summaryResponse.ok) throw new Error(`Failed to fetch monster summary list: ${summaryResponse.statusText}`);
      const summaryData = await summaryResponse.json();
      const summaries: MonsterSummary[] = summaryData.results || [];

      const enrichedMonstersPromises = summaries.map(async (summary, index) => {
        await new Promise(resolve => setTimeout(resolve, index * 5)); 
        try {
          const detailResponse = await fetch(`${DND5E_API_BASE_URL}${summary.url}`);
          if (detailResponse.ok) {
            const detailData: MonsterDetail = await detailResponse.json();
            return {
              index: detailData.index,
              name: detailData.name,
              cr: crToNumber(detailData.challenge_rating),
              type: detailData.type,
              url: summary.url,
              source: 'api' as 'api'
            };
          }
          console.warn(`Failed to fetch detail for ${summary.name}, using summary only.`);
          return { index: summary.index, name: summary.name, url: summary.url, source: 'api' as 'api', cr: undefined, type: undefined };
        } catch (detailError) {
            console.error(`Detail fetch error for ${summary.name}:`, detailError);
            return { index: summary.index, name: summary.name, url: summary.url, source: 'api' as 'api', cr: undefined, type: undefined }; 
        }
      });

      const enrichedMonsters = await Promise.all(enrichedMonstersPromises);
      const validEnrichedMonsters = enrichedMonsters.filter(m => m !== null) as MonsterSummaryWithCR[];

      localStorage.setItem(MONSTER_MASH_FULL_INDEX_STORAGE_KEY, JSON.stringify(validEnrichedMonsters));
      setAllMonstersData(validEnrichedMonsters);
    } catch (err: any) {
      setError(err.message || "Could not build local monster index. Refresh to try again. Some features may be limited.");
      if (allMonstersData.length === 0) {
         try {
            const summaryResponseFallback = await fetch(`${DND5E_API_BASE_URL}/api/monsters`);
            if (summaryResponseFallback.ok) {
                const summaryDataFallback = await summaryResponseFallback.json();
                setAllMonstersData((summaryDataFallback.results || []).map((m: MonsterSummary) => ({...m, source: 'api', cr: undefined, type: undefined })));
            } else { setError("Failed to load monster list. Please try again later."); }
         } catch (fallbackErr) { setError("Failed to load monster list. Please try again later."); }
      }
    } finally {
      setIsBuildingIndex(false);
      setIsLoadingList(false);
    }
  }, [allMonstersData.length]);

  useEffect(() => {
    if (open && allMonstersData.length === 0 && !isLoadingList && !isBuildingIndex) {
        setIsLoadingList(true);
        try {
            const cachedIndex = localStorage.getItem(MONSTER_MASH_FULL_INDEX_STORAGE_KEY);
            if (cachedIndex) {
                const parsedIndex: MonsterSummaryWithCR[] = JSON.parse(cachedIndex);
                setAllMonstersData(parsedIndex.map(m => ({...m, source: m.source || 'api'}))); 
                setIsLoadingList(false);
            } else {
                fetchAndCacheFullMonsterIndex();
            }
        } catch (e) {
            console.error("Error loading cached index:", e);
            localStorage.removeItem(MONSTER_MASH_FULL_INDEX_STORAGE_KEY); // Clear potentially corrupted cache
            fetchAndCacheFullMonsterIndex(); 
        }
    }
  }, [open, allMonstersData.length, isLoadingList, isBuildingIndex, fetchAndCacheFullMonsterIndex]);

  useEffect(() => {
    if (allMonstersData.length > 0 || homebrewMonsters.length > 0) {
      applyFiltersAndSort();
    }
  }, [allMonstersData, homebrewMonsters, applyFiltersAndSort]); 

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (open && (allMonstersData.length > 0 || homebrewMonsters.length > 0)) {
        applyFiltersAndSort();
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, crRange, resultsSortConfig, open, allMonstersData, homebrewMonsters, applyFiltersAndSort]);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(MONSTER_MASH_FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (e) { console.error("Error loading favorites:", e); setFavorites([]); }

    try {
      const storedHomebrew = localStorage.getItem(MONSTER_MASH_HOMEBREW_STORAGE_KEY);
      if (storedHomebrew) {
        setHomebrewMonsters(JSON.parse(storedHomebrew));
      }
    } catch (e) { console.error("Error loading homebrew monsters:", e); setHomebrewMonsters([]); }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(MONSTER_MASH_FAVORITES_STORAGE_KEY, JSON.stringify(favorites)); }
    catch (e) { console.error("Error saving favorites to localStorage", e); }
  }, [favorites]);

  useEffect(() => {
    try { localStorage.setItem(MONSTER_MASH_HOMEBREW_STORAGE_KEY, JSON.stringify(homebrewMonsters)); }
    catch (e) { console.error("Error saving homebrew monsters to localStorage", e); }
  }, [homebrewMonsters]);


  const proceedWithPendingAction = useCallback(() => {
    if (pendingMonsterFetchArgs?.index) {
      fetchMonsterDetail(pendingMonsterFetchArgs.index, pendingMonsterFetchArgs.source || 'api');
    } else if (pendingMonsterFetchArgs?.type === 'create_new') {
       handleOpenCreateHomebrewForm(true); // Pass skipDirtyCheck = true
    }
    setPendingMonsterFetchArgs(null);
  }, [pendingMonsterFetchArgs]); // Removed fetchMonsterDetail from dependencies

  const handleUnsavedChangesDialogChoice = (choice: 'save' | 'discard' | 'cancel') => {
    setIsUnsavedChangesDialogOpen(false);
    if (choice === 'save') {
      handleSaveHomebrewMonster(); 
      setTimeout(() => { // Ensure save completes before proceeding
        proceedWithPendingAction();
      }, 100);
    } else if (choice === 'discard') {
      setIsCreatingHomebrew(false);
      setEditingHomebrewIndex(null);
      setHomebrewFormData(initialHomebrewFormData);
      setInitialEditFormData(null);
      setIsHomebrewFormDirty(false);
      proceedWithPendingAction();
    } else { 
      setPendingMonsterFetchArgs(null); 
    }
  };

  const handleOpenCreateHomebrewForm = (skipDirtyCheck = false) => {
    const action = () => {
        setSelectedMonster(null); 
        setEditingHomebrewIndex(null); 
        setHomebrewFormData(initialHomebrewFormData);
        setInitialEditFormData(null); 
        setIsCreatingHomebrew(true);
        setIsHomebrewFormDirty(false);
    };

    if (!skipDirtyCheck && isCreatingHomebrew && isHomebrewFormDirty) {
        setPendingMonsterFetchArgs({ type: 'create_new' } as any); // Type assertion if 'type' is needed
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
        setInitialEditFormData(formData); 
        setIsCreatingHomebrew(true); 
        setIsHomebrewFormDirty(false); 
    };
    if (isCreatingHomebrew && isHomebrewFormDirty && editingHomebrewIndex !== monster.index) {
      setPendingMonsterFetchArgs({ index: monster.index, source: 'homebrew' });
      setIsUnsavedChangesDialogOpen(true);
    } else {
      action();
    }
  };

  const fetchMonsterDetail = async (monsterIndex: string, source: 'api' | 'homebrew' = 'api') => {
    if (!monsterIndex) return;

    if (isCreatingHomebrew && isHomebrewFormDirty && editingHomebrewIndex !== monsterIndex) {
        setPendingMonsterFetchArgs({index: monsterIndex, source});
        setIsUnsavedChangesDialogOpen(true);
        return;
    }

    setIsCreatingHomebrew(false); 
    setEditingHomebrewIndex(null); 
    
    setIsLoadingDetail(true); setError(null); setSelectedMonster(null); 
    if (source === 'homebrew') {
        const homebrewDetail = homebrewMonsters.find(m => m.index === monsterIndex);
        if (homebrewDetail) {
            setSelectedMonster(homebrewDetail);
        } else {
            setError(`Could not find homebrew monster ${monsterIndex}.`);
        }
        setIsLoadingDetail(false);
        return;
    }

    try {
        const response = await fetch(`${DND5E_API_BASE_URL}/api/monsters/${monsterIndex}`);
        if (!response.ok) throw new Error(`Failed to fetch details for ${monsterIndex}: ${response.statusText}`);
        const data: MonsterDetail = await response.json();
        setSelectedMonster({...data, source: 'api'}); 
    } catch (err: any) {
        setError(err.message || `Could not load details for ${monsterIndex}.`);
        setSelectedMonster(null);
    } finally {
        setIsLoadingDetail(false);
    }
  };

  const toggleFavorite = async (monsterToToggle: MonsterSummaryWithCR | MonsterDetail) => {
    const existingFav = favorites.find(f => f.index === monsterToToggle.index);
    if (existingFav) {
      setFavorites(favorites.filter(f => f.index !== monsterToToggle.index));
    } else {
      let monsterDetailToSave: MonsterDetail;

      if (monsterToToggle.source === 'homebrew' && 'hit_points' in monsterToToggle) {
          monsterDetailToSave = monsterToToggle as MonsterDetail;
      } else if ('hit_points' in monsterToToggle && monsterToToggle.armor_class) {
          monsterDetailToSave = monsterToToggle as MonsterDetail;
      } else {
        try {
          setIsLoadingDetail(true);
          const detailResponse = await fetch(`${DND5E_API_BASE_URL}/api/monsters/${monsterToToggle.index}`);
          if (!detailResponse.ok) {
            setError(`Failed to fetch details for ${monsterToToggle.name} to favorite.`); setIsLoadingDetail(false); return;
          }
          monsterDetailToSave = await detailResponse.json();
          setIsLoadingDetail(false);
        } catch (e) { setError(`Error fetching details for ${monsterToToggle.name} to favorite.`); setIsLoadingDetail(false); return; }
      }

      const crNum = crToNumber(monsterDetailToSave.challenge_rating);
      if (crNum === undefined || crNum === -1) { 
         setError(`CR value invalid for ${monsterDetailToSave.name}. Cannot add to favorites.`); return;
      }

      let acValue, acType;
      if (monsterDetailToSave.armor_class && monsterDetailToSave.armor_class.length > 0) {
          acValue = monsterDetailToSave.armor_class[0].value;
          acType = monsterDetailToSave.armor_class[0].type;
      }

      const newFavorite: FavoriteMonster = {
        index: monsterDetailToSave.index,
        name: monsterDetailToSave.name,
        cr: crNum,
        type: monsterDetailToSave.type || "Unknown Type",
        source: monsterDetailToSave.source || (monsterDetailToSave.isHomebrew ? 'homebrew' : 'api'),
        acValue: acValue,
        acType: acType,
        hpValue: monsterDetailToSave.hit_points
      };
      setFavorites(prevFavs => [...prevFavs, newFavorite]);
    }
  };

  const isFavorite = (monsterIndex: string) => favorites.some(f => f.index === monsterIndex);

 useEffect(() => {
    if (!isCreatingHomebrew) {
      setIsHomebrewFormDirty(false);
      return;
    }
    
    const currentFormDataString = JSON.stringify(homebrewFormData);
    const initialDataString = editingHomebrewIndex 
      ? JSON.stringify(initialEditFormData) 
      : JSON.stringify(initialHomebrewFormData);

    if (currentFormDataString !== initialDataString) {
      if (!isHomebrewFormDirty) setIsHomebrewFormDirty(true);
    } else {
      if (isHomebrewFormDirty) setIsHomebrewFormDirty(false);
    }
  }, [homebrewFormData, initialEditFormData, initialHomebrewFormData, isCreatingHomebrew, editingHomebrewIndex, isHomebrewFormDirty]);


  const handleHomebrewFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHomebrewFormData(prev => ({ ...prev, [name]: value }));
    if(!isHomebrewFormDirty && isCreatingHomebrew) setIsHomebrewFormDirty(true);
  };
  const handleHomebrewSelectChange = (name: keyof HomebrewMonsterFormData, value: string) => {
    setHomebrewFormData(prev => ({ ...prev, [name]: value }));
     if(!isHomebrewFormDirty && isCreatingHomebrew) setIsHomebrewFormDirty(true);
  };

  const handleSaveHomebrewMonster = () => {
    if (!homebrewFormData.name.trim()) { setError("Homebrew monster name is required."); return; }
    const crNum = homebrewFormData.challenge_rating ? crToNumber(homebrewFormData.challenge_rating) : 0;
    const acVal = parseInt(homebrewFormData.armor_class_value || "10") || 10;
    const hpVal = parseInt(homebrewFormData.hit_points_value || "10") || 10;

    const monsterType = homebrewFormData.type?.trim() || "Unknown Type";
    const monsterSize = homebrewFormData.size?.trim() || "Medium";
    const monsterAcType = homebrewFormData.armor_class_type?.trim() || "Natural Armor";
    const monsterSpeed = homebrewFormData.speed?.trim() || "30 ft.";
    const monsterAlignment = homebrewFormData.alignment?.trim() || "Unaligned";

    const monsterData: Omit<MonsterDetail, 'index' | 'url'> = {
        name: homebrewFormData.name.trim(),
        challenge_rating: crNum,
        type: monsterType,
        size: monsterSize,
        armor_class: [{ type: monsterAcType, value: acVal }],
        hit_points: hpVal,
        hit_dice: homebrewFormData.hit_points_dice?.trim(),
        speed: monsterSpeed,
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
        condition_immunities: homebrewFormData.condition_immunities_text?.split(',').map(ci => ci.trim()).filter(Boolean).map(name => ({name, index: name.toLowerCase().replace(/\s+/g, '-')})) || [],
        senses: homebrewFormData.senses_text?.trim() || "Passive Perception 10",
        languages: homebrewFormData.languages?.trim() || "None",
        alignment: monsterAlignment,
        special_abilities: homebrewFormData.special_abilities_text?.trim(), 
        actions: homebrewFormData.actions_text?.trim(), 
        legendary_actions: homebrewFormData.legendary_actions_text?.trim(), 
        image: homebrewFormData.image_url?.trim(),
        source: 'homebrew',
        isHomebrew: true,
    };

    let newSelectedMonster: MonsterDetail | null = null;
    if (editingHomebrewIndex) {
        const updatedMonster = { ...monsterData, index: editingHomebrewIndex, url: '' };
        setHomebrewMonsters(prev => prev.map(m => m.index === editingHomebrewIndex ? updatedMonster : m));
        newSelectedMonster = updatedMonster;
        toast({ title: "Homebrew Monster Updated", description: `"${updatedMonster.name}" has been updated.` });
    } else {
        const newIndex = `homebrew-${Date.now()}-${homebrewFormData.name.toLowerCase().replace(/\s+/g, '-')}`;
        const newMonster = { ...monsterData, index: newIndex, url: '' };
        setHomebrewMonsters(prev => [...prev, newMonster]);
        newSelectedMonster = newMonster;
        toast({ title: "Homebrew Monster Created", description: `"${newMonster.name}" has been added.` });
    }

    setIsCreatingHomebrew(false);
    setEditingHomebrewIndex(null);
    setHomebrewFormData(initialHomebrewFormData);
    setInitialEditFormData(null); 
    setError(null);
    setIsHomebrewFormDirty(false);
    setSelectedMonster(newSelectedMonster); 
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
    toast({ title: "Homebrew Monster Deleted" });
  };

  const handleCancelHomebrewForm = () => {
     if (isHomebrewFormDirty) {
        setPendingMonsterFetchArgs(null);
        setIsUnsavedChangesDialogOpen(true);
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
    if (mainAc.desc) {
      str += ` - ${mainAc.desc}`;
    }
    return str;
  };

  const renderMonsterTextField = (label: string, textContent: string | undefined | null) => {
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

  type ActionType = MonsterAction | SpecialAbility | LegendaryAction; 
  const renderMonsterActions = (actions: ActionType[] | undefined) => { 
    if (!actions || actions.length === 0) return <p className="text-sm text-muted-foreground">None</p>;
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
    const minLabel = formatCRDisplay(crRange[0]);
    const maxLabel = formatCRDisplay(crRange[1]);
    if (crRange[0] === CR_SLIDER_MIN && crRange[1] === CR_SLIDER_MAX) return "CR Range: All";
    return `CR Range: ${minLabel} - ${maxLabel}`;
  };

  const handleCRSliderChange = (newSliderValues: number[]) => {
    if (newSliderValues.length === 2) {
      const [rawMin, rawMax] = newSliderValues;
      const snappedMin = snapCRValue(rawMin);
      const snappedMax = snapCRValue(rawMax);
      setCrRange([snappedMin, Math.max(snappedMin, snappedMax)]); 
    }
  };

  const sortedFavorites = React.useMemo(() =>
    [...favorites].sort((a, b) => {
      let valA, valB;
      if (favoritesSortConfig.key === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else { 
        valA = a.cr; 
        valB = b.cr;
      }
      let comparison = 0;
      if (valA > valB) {comparison = 1;}
      else if (valA < valB) {comparison = -1;}
      return favoritesSortConfig.order === 'asc' ? comparison : comparison * -1;
    })
  , [favorites, favoritesSortConfig]);

  const sortedHomebrew = React.useMemo(() =>
    [...homebrewMonsters].sort((a, b) => {
      let valA, valB;
      if (homebrewSortConfig.key === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else { 
        valA = crToNumber(a.challenge_rating); 
        valB = crToNumber(b.challenge_rating);
      }
      let comparison = 0;
      if (valA > valB) {comparison = 1;}
      else if (valA < valB) {comparison = -1;}
      return homebrewSortConfig.order === 'asc' ? comparison : comparison * -1;
    })
  , [homebrewMonsters, homebrewSortConfig]);

  const handleSendToEncounter = () => {
    if (!selectedMonster) {
      toast({ title: "Error", description: "No monster selected.", variant: "destructive" });
      return;
    }
    if (!activeCampaign) {
      toast({ title: "Error", description: "No active campaign selected.", variant: "destructive" });
      return;
    }

    const encounterKey = `${ENCOUNTER_STORAGE_KEY_PREFIX}${activeCampaign.id}`;
    
    try {
      const storedEncounter = localStorage.getItem(encounterKey);
      let currentEncounter: { title: string; monsters: EncounterMonster[] };

      if (storedEncounter) {
        try {
          currentEncounter = JSON.parse(storedEncounter);
          if (!currentEncounter.monsters || !Array.isArray(currentEncounter.monsters)) {
            currentEncounter.monsters = [];
          }
          if (typeof currentEncounter.title !== 'string') {
            currentEncounter.title = "New Encounter";
          }
        } catch (parseError) {
          currentEncounter = { title: "New Encounter", monsters: [] };
        }
      } else {
        currentEncounter = { title: "New Encounter", monsters: [] };
      }

      const monsterToAdd: EncounterMonster = {
        id: `${selectedMonster.index}-${Date.now()}`,
        name: selectedMonster.name,
        quantity: 1,
        cr: formatCRDisplay(selectedMonster.challenge_rating),
        ac: selectedMonster.armor_class && selectedMonster.armor_class.length > 0 ? selectedMonster.armor_class[0].value.toString() : undefined,
        hp: selectedMonster.hit_points?.toString(),
      };
      
      currentEncounter.monsters.push(monsterToAdd);
      localStorage.setItem(encounterKey, JSON.stringify(currentEncounter));
      toast({ title: "Monster Sent!", description: `${selectedMonster.name} added to current encounter draft for campaign "${activeCampaign.name}".` });
    } catch (e) {
      console.error("Error sending monster to encounter:", e);
      toast({ title: "Error", description: "Could not send monster to encounter. Check console.", variant: "destructive" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full h-full max-w-full sm:max-w-full flex flex-col p-0 overflow-hidden"
        hideCloseButton={true}
      >
        <div className="flex flex-col h-full pr-8"> 
            <SheetHeader className="p-4 border-b bg-primary text-primary-foreground flex flex-row items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <Skull className="mr-3 h-7 w-7"/>
                    <SheetTitle className="flex items-center text-2xl text-primary-foreground">
                     Monster Mash
                    </SheetTitle>
                </div>
                 <TooltipProvider delayDuration={100}>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary/80" tabIndex={-1}>
                        <HelpCircle className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                        <p>Search the D&D 5e bestiary or your homebrew creations. Building the local monster index may be slow on first open.</p>
                    </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </SheetHeader>

            <div className="flex flex-1 min-h-0 border-t relative"> 
                <div className="w-1/5 min-w-[200px] max-w-[280px] bg-card border-r flex flex-col overflow-y-auto">
                    <Accordion type="multiple" defaultValue={["favorites-section", "homebrew-section"]} className="w-full">
                    <AccordionItem value="favorites-section">
                        <div className="flex justify-between items-center w-full px-3 py-2 bg-muted rounded-t-md">
                            <AccordionTrigger className="py-0 hover:no-underline text-left flex-grow text-lg font-semibold text-foreground">
                                Favorites ({favorites.length})
                            </AccordionTrigger>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                        <ArrowUpDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Sort Key</DropdownMenuLabel>
                                <DropdownMenuRadioGroup value={favoritesSortConfig.key} onValueChange={(value) => setFavoritesSortConfig(prev => ({ ...prev, key: value as SortKey }))}>
                                    <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="cr">CR</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Order</DropdownMenuLabel>
                                <DropdownMenuRadioGroup value={favoritesSortConfig.order} onValueChange={(value) => setFavoritesSortConfig(prev => ({ ...prev, order: value as SortOrder }))}>
                                    <DropdownMenuRadioItem value="asc">Asc</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="desc">Desc</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <AccordionContent className="pt-1 pb-0 px-1">
                        <Separator className="mb-2" />
                        <ScrollArea className="h-60">
                            {favorites.length === 0 ? <p className="text-sm text-muted-foreground p-2 text-center">No favorites yet.</p> : (
                            <ul className="space-y-1">
                                {sortedFavorites.map(fav => (
                                <li key={fav.index} onClick={() => fetchMonsterDetail(fav.index, fav.source)}
                                    className={cn("p-2 rounded-md hover:bg-accent cursor-pointer text-sm flex justify-between items-center", selectedMonster?.index === fav.index && "bg-primary/10 text-primary font-medium")}>
                                    <span className="truncate">{fav.name} <span className="text-xs text-muted-foreground">(CR {formatCRDisplay(fav.cr)})</span></span>
                                    {fav.source === 'homebrew' && (
                                    <TooltipProvider delayDuration={50}>
                                        <Tooltip><TooltipTrigger asChild><Dna className="h-4 w-4 text-muted-foreground ml-1 shrink-0"/></TooltipTrigger><TooltipContent><p>Homebrew</p></TooltipContent></Tooltip>
                                    </TooltipProvider>
                                    )}
                                </li>))}
                            </ul>
                            )}
                        </ScrollArea>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="homebrew-section">
                        <div className="flex justify-between items-center w-full px-3 py-2 bg-muted">
                            <AccordionTrigger className="py-0 hover:no-underline text-left flex-grow text-lg font-semibold text-foreground">
                                Homebrew ({homebrewMonsters.length})
                            </AccordionTrigger>
                            <div className="flex items-center">
                                <TooltipProvider delayDuration={100}><Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 mr-1" onClick={(e) => {e.stopPropagation(); handleOpenCreateHomebrewForm();}}>
                                            <PlusCircle className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Create New Homebrew Monster</p></TooltipContent>
                                </Tooltip></TooltipProvider>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                        <ArrowUpDown className="h-4 w-4" />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Sort Key</DropdownMenuLabel>
                                    <DropdownMenuRadioGroup value={homebrewSortConfig.key} onValueChange={(value) => setHomebrewSortConfig(prev => ({ ...prev, key: value as SortKey }))}>
                                        <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="cr">CR</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Order</DropdownMenuLabel>
                                    <DropdownMenuRadioGroup value={homebrewSortConfig.order} onValueChange={(value) => setHomebrewSortConfig(prev => ({ ...prev, order: value as SortOrder }))}>
                                        <DropdownMenuRadioItem value="asc">Asc</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="desc">Desc</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <AccordionContent className="pt-1 pb-0 px-1 space-y-2">
                            <Separator />
                            <ScrollArea className="h-60">
                                {homebrewMonsters.length === 0 && !isCreatingHomebrew ? (
                                    <p className="text-sm text-muted-foreground p-2 text-center">No homebrew monsters yet.</p>
                                ) : (
                                    <ul className="space-y-1">
                                        {sortedHomebrew.map(hb => (
                                        <li key={hb.index} onClick={() => fetchMonsterDetail(hb.index, 'homebrew')}
                                            className={cn("p-2 rounded-md hover:bg-accent cursor-pointer text-sm flex justify-between items-center", selectedMonster?.index === hb.index && "bg-primary/10 text-primary font-medium")}>
                                            <span>{hb.name} <span className="text-xs text-muted-foreground">(CR {formatCRDisplay(hb.challenge_rating)})</span></span>
                                        </li>))}
                                    </ul>
                                )}
                            </ScrollArea>
                        </AccordionContent>
                    </AccordionItem>
                    </Accordion>
                </div>

                <div className="w-2/5 flex flex-col border-r bg-background overflow-y-auto p-4">
                    <div className="sticky top-0 bg-background z-10 py-3 space-y-3">
                        <div className="relative">
                            <Input
                            id="monster-search"
                            placeholder="Search by Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10 h-9 border-primary focus-visible:ring-primary"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            {searchTerm && <Button variant="ghost" size="icon" className="absolute right-8 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm("")}><X className="h-4 w-4"/></Button>}
                        </div>
                        <div>
                            <Label htmlFor="cr-slider" className="text-sm mb-1 block">{formatCRSliderRangeLabel()}</Label>
                            <Slider
                            id="cr-slider"
                            min={CR_SLIDER_MIN}
                            max={CR_SLIDER_MAX}
                            step={0.125} 
                            value={crRange}
                            onValueChange={handleCRSliderChange}
                            className="my-2"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col border rounded-lg overflow-hidden flex-1 bg-card mt-0">
                    <div className="p-3 bg-muted border-b flex justify-between items-center">
                        <h3 className="text-md font-semibold text-primary">Results ({isLoadingList || isBuildingIndex ? "..." : filteredMonsters.length})</h3>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Sort Key</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={resultsSortConfig.key} onValueChange={(value) => setResultsSortConfig(prev => ({ ...prev, key: value as SortKey }))}>
                            <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="cr" disabled={isBuildingIndex && allMonstersData.every(m => m.cr === undefined)}>CR</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Order</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={resultsSortConfig.order} onValueChange={(value) => setResultsSortConfig(prev => ({ ...prev, order: value as SortOrder }))}>
                            <DropdownMenuRadioItem value="asc">Asc</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="desc">Desc</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    {isBuildingIndex ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Building local monster index... <br/>This may take a moment.</p>
                        </div>
                    ) : isLoadingList ? (
                        <div className="flex-1 flex items-center justify-center p-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : error && !isLoadingList && allMonstersData.length === 0 && homebrewMonsters.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center"> <AlertTriangle className="h-12 w-12 text-destructive mb-2"/><p className="text-destructive text-center">{error}</p> </div>
                    ) : filteredMonsters.length === 0 && !isLoadingList && !isBuildingIndex ? (
                        <p className="p-4 text-sm text-muted-foreground text-center">
                        {allMonstersData.length > 0 || homebrewMonsters.length > 0 ? "No monsters match search/filter." : "No monsters loaded."}
                        </p>
                    ) : (
                        <ScrollArea className="flex-1">
                        <ul className="divide-y">
                            {filteredMonsters.map(monster => (
                            <li key={monster.index} className={cn("p-2 hover:bg-accent/50 flex justify-between items-center", selectedMonster?.index === monster.index && "bg-primary/10")}>
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

                <div className="flex-1 flex flex-col bg-card border-l overflow-y-auto">
                    <div className="p-3 py-2 border-b flex justify-between items-center sticky top-0 bg-muted z-10">
                        <h3 className="text-lg font-semibold truncate pr-2 text-foreground flex items-center">
                            {isCreatingHomebrew
                                ? (editingHomebrewIndex ? "Edit Homebrew Monster" : "Create Homebrew Monster")
                                : (selectedMonster
                                    ? <> {selectedMonster.name} {selectedMonster.isHomebrew && <Badge variant="outline" className="ml-2 align-middle text-xs">Homebrew</Badge>} </>
                                    : "Monster Details")
                            }
                        </h3>
                         <div className="flex gap-1 items-center">
                            {isCreatingHomebrew && editingHomebrewIndex && (
                                <Button onClick={handleSaveHomebrewMonster} disabled={!isHomebrewFormDirty} size="sm">
                                    <Save className="mr-2 h-4 w-4" /> Update Changes
                                </Button>
                            )}
                            {!isCreatingHomebrew && selectedMonster && (
                                <>
                                    {selectedMonster.isHomebrew && (
                                        <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEditHomebrewForm(selectedMonster)} className="h-8 w-8">
                                                <Edit3 className="h-5 w-5 text-muted-foreground/70 hover:text-muted-foreground"/>
                                            </Button>
                                        </TooltipTrigger><TooltipContent><p>Edit Homebrew</p></TooltipContent></Tooltip></TooltipProvider>
                                    )}
                                    <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => toggleFavorite(selectedMonster)} className="h-8 w-8" aria-label={isFavorite(selectedMonster.index) ? "Unfavorite" : "Favorite"}>
                                        <Star className={cn("h-5 w-5", isFavorite(selectedMonster.index) && "text-yellow-400 fill-yellow-400", !isFavorite(selectedMonster.index) && "text-muted-foreground/70")}/>
                                        </Button>
                                    </TooltipTrigger><TooltipContent>{isFavorite(selectedMonster.index) ? "Unfavorite" : "Favorite"}</TooltipContent></Tooltip></TooltipProvider>
                                    <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={handleSendToEncounter} className="h-8 w-8" disabled={!activeCampaign}><ShieldAlert className="h-5 w-5"/></Button>
                                    </TooltipTrigger><TooltipContent>Send to Current Encounter</TooltipContent></Tooltip></TooltipProvider>
                                    <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled className="h-8 w-8"><MapPin className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent>Add to Location (TBD)</TooltipContent></Tooltip></TooltipProvider>
                                </>
                            )}
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-4">
                        {isCreatingHomebrew ? (
                            <div className="space-y-3 text-sm">
                                {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">{error}</p>}
                                <div><Label htmlFor="hb-name">Name*</Label><Input id="hb-name" name="name" value={homebrewFormData.name} onChange={handleHomebrewFormChange} /></div>
                                <div><Label htmlFor="hb-cr">CR</Label><Input id="hb-cr" name="challenge_rating" value={homebrewFormData.challenge_rating || ""} onChange={handleHomebrewFormChange} placeholder="e.g., 5 or 1/2"/></div>

                                <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="hb-type">Type</Label>
                                    <Select name="type" value={homebrewFormData.type || ""} onValueChange={(value) => handleHomebrewSelectChange("type", value || "")}>
                                    <SelectTrigger id="hb-type"><SelectValue placeholder="Select Type..." /></SelectTrigger>
                                    <SelectContent>{MONSTER_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="hb-size">Size</Label>
                                    <Select name="size" value={homebrewFormData.size || ""} onValueChange={(value) => handleHomebrewSelectChange("size", value || "")}>
                                    <SelectTrigger id="hb-size"><SelectValue placeholder="Select Size..." /></SelectTrigger>
                                    <SelectContent>{MONSTER_SIZES.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div><Label htmlFor="hb-ac-value">AC Value</Label><Input id="hb-ac-value" name="armor_class_value" value={homebrewFormData.armor_class_value} onChange={handleHomebrewFormChange} /></div>
                                    <div>
                                    <Label htmlFor="hb-ac-type">AC Type</Label>
                                    <Select name="armor_class_type" value={homebrewFormData.armor_class_type || ""} onValueChange={(value) => handleHomebrewSelectChange("armor_class_type", value || "")}>
                                        <SelectTrigger id="hb-ac-type"><SelectValue placeholder="Select AC Type..." /></SelectTrigger>
                                        <SelectContent>{MONSTER_AC_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                                    </Select>
                                    </div>
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
                                <div>
                                <Label htmlFor="hb-alignment">Alignment</Label>
                                <Select name="alignment" value={homebrewFormData.alignment || ""} onValueChange={(value) => handleHomebrewSelectChange("alignment", value || "")}>
                                    <SelectTrigger id="hb-alignment"><SelectValue placeholder="Select Alignment..." /></SelectTrigger>
                                    <SelectContent>{MONSTER_ALIGNMENTS.map(align => <SelectItem key={align} value={align}>{align}</SelectItem>)}</SelectContent>
                                </Select>
                                </div>

                                <div><Label htmlFor="hb-vuln">Vulnerabilities (comma-sep)</Label><Input id="hb-vuln" name="damage_vulnerabilities_text" value={homebrewFormData.damage_vulnerabilities_text || ""} onChange={handleHomebrewFormChange}/></div>
                                <div><Label htmlFor="hb-resist">Resistances (comma-sep)</Label><Input id="hb-resist" name="damage_resistances_text" value={homebrewFormData.damage_resistances_text || ""} onChange={handleHomebrewFormChange}/></div>
                                <div><Label htmlFor="hb-immune">Immunities (comma-sep)</Label><Input id="hb-immune" name="damage_immunities_text" value={homebrewFormData.damage_immunities_text || ""} onChange={handleHomebrewFormChange}/></div>
                                <div><Label htmlFor="hb-cond-immune">Condition Immunities (comma-sep)</Label><Input id="hb-cond-immune" name="condition_immunities_text" value={homebrewFormData.condition_immunities_text || ""} onChange={handleHomebrewFormChange}/></div>

                                <div><Label htmlFor="hb-abilities">Special Abilities</Label><Textarea id="hb-abilities" name="special_abilities_text" value={homebrewFormData.special_abilities_text || ""} onChange={handleHomebrewFormChange} rows={3} placeholder="One ability per paragraph. Start with name in bold (e.g. **Keen Smell**. The monster has...)."/></div>
                                <div><Label htmlFor="hb-actions">Actions</Label><Textarea id="hb-actions" name="actions_text" value={homebrewFormData.actions_text || ""} onChange={handleHomebrewFormChange} rows={3} placeholder="One action per paragraph. Start with name in bold (e.g. **Bite**. Melee Weapon Attack: ...)."/></div>
                                <div><Label htmlFor="hb-legendary">Legendary Actions</Label><Textarea id="hb-legendary" name="legendary_actions_text" value={homebrewFormData.legendary_actions_text || ""} onChange={handleHomebrewFormChange} rows={2} placeholder="Optional. One action per paragraph."/></div>
                                <div><Label htmlFor="hb-image">Image URL (Optional)</Label><Input id="hb-image" name="image_url" value={homebrewFormData.image_url || ""} onChange={handleHomebrewFormChange} /></div>

                            <div className="flex gap-2 mt-4 items-center">
                                    {(!editingHomebrewIndex) && ( 
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
                            {selectedMonster.condition_immunities && (typeof selectedMonster.condition_immunities === 'string' ? selectedMonster.condition_immunities.length > 0 : selectedMonster.condition_immunities.length > 0) && <div><strong>Condition Immunities:</strong> {(Array.isArray(selectedMonster.condition_immunities) && selectedMonster.condition_immunities.length > 0 && typeof selectedMonster.condition_immunities[0] !== 'string') ? (selectedMonster.condition_immunities as { index: string; name: string; url: string }[]).map(ci => ci.name).join(', ') : (Array.isArray(selectedMonster.condition_immunities) ? selectedMonster.condition_immunities.join(', ') : selectedMonster.condition_immunities) }</div>}
                            <div><strong>Senses:</strong> {typeof selectedMonster.senses === 'string' ? selectedMonster.senses : selectedMonster.senses ? Object.entries(selectedMonster.senses).map(([key, val]) => `${key.replace("_", " ")} ${val}`).join(', ') : 'N/A'}</div>
                            <div><strong>Languages:</strong> {selectedMonster.languages || "None"}</div>
                            
                            {selectedMonster.isHomebrew ? renderMonsterTextField("Special Abilities", selectedMonster.special_abilities as string | undefined) : renderMonsterActions(selectedMonster.special_abilities as SpecialAbility[] | undefined)}
                            {selectedMonster.isHomebrew ? renderMonsterTextField("Actions", selectedMonster.actions as string | undefined) : renderMonsterActions(selectedMonster.actions as MonsterAction[] | undefined)}
                            {selectedMonster.isHomebrew ? renderMonsterTextField("Legendary Actions", selectedMonster.legendary_actions as string | undefined) : renderMonsterActions(selectedMonster.legendary_actions as LegendaryAction[] | undefined)}

                            {selectedMonster.image && (<div className="mt-2"><Image src={selectedMonster.source === 'api' ? `${DND5E_API_BASE_URL}${selectedMonster.image}` : selectedMonster.image} alt={selectedMonster.name} width={300} height={300} className="rounded-md border object-contain mx-auto" data-ai-hint={`${selectedMonster.type} monster`} /></div>)}
                        </div>
                        ) : error && !isBuildingIndex && !isLoadingList ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center"> <AlertTriangle className="h-12 w-12 text-destructive mb-2"/><p className="text-destructive text-center">{error}</p> 
                            {error.includes("Failed to fetch monster summary list") && <Button onClick={() => fetchAndCacheFullMonsterIndex()} variant="outline" size="sm" className="mt-2">Retry Fetch</Button>}
                        </div>
                        ) : !isBuildingIndex && !isLoadingList && (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center"> <BookOpen className="h-12 w-12 text-muted-foreground mb-2"/><p className="text-sm text-muted-foreground">Select a monster or create homebrew.</p> </div>
                        )}
                        </div>
                    </ScrollArea>
                </div>
                
                <button
                    onClick={() => {
                        if (isCreatingHomebrew && isHomebrewFormDirty) {
                            setIsUnsavedChangesDialogOpen(true);
                            setPendingMonsterFetchArgs(null); 
                        } else {
                            onOpenChange(false);
                        }
                    }}
                    className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]"
                    aria-label="Close Monster Mash"
                    >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div> 
        </div> 

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
              <AlertDialogCancel onClick={() => {setMonsterToDeleteIndex(null); setIsDeleteHomebrewConfirmOpen(false);}}>Cancel</AlertDialogCancel>
              <Button onClick={handleConfirmDeleteHomebrew} className={cn(buttonVariants({variant: 'destructive'}))}>Delete Monster</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}
