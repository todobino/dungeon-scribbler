
"use client";

import { useState, useEffect, useCallback } from "react";
import type { MonsterSummary, MonsterDetail, FavoriteMonster, ArmorClass, MonsterAction, SpecialAbility, LegendaryAction, MonsterSummaryWithCR } from "@/lib/types";
import { MONSTER_MASH_FAVORITES_STORAGE_KEY, MONSTER_MASH_FULL_INDEX_STORAGE_KEY } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
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
import { Search, X, Star, ShieldAlert, MapPin, Loader2, AlertTriangle, Info, ShieldCheck, BookOpen, ArrowUpDown, HelpCircle, ChevronRight, VenetianMask } from "lucide-react";
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
    if (cr.includes('/')) {
      const parts = cr.split('/');
      return parseFloat(parts[0]) / parseFloat(parts[1]);
    }
    return parseFloat(cr);
  }
  return -1; 
};

const formatCRDisplay = (crValue: string | number | undefined): string => {
    if (crValue === undefined) return "N/A";
    const numCR = typeof crValue === 'string' ? crToNumber(crValue) : crValue;

    if (numCR === -1) return "N/A";
    if (numCR === 0) return "0";
    if (numCR === 0.125) return "1/8";
    if (numCR === 0.25) return "1/4";
    if (numCR === 0.5) return "1/2";
    if (numCR === 0.75) return "3/4";
    if (Number.isInteger(numCR)) return numCR.toString();
    return numCR.toFixed(2); // For any other fractions like 0.33 if they ever occur
};


const CR_SLIDER_MIN = 0;
const CR_SLIDER_MAX = 30;
const CR_SLIDER_STEP = 0.125; 

// Snapping function for CR slider
const snapCRValue = (rawValue: number): number => {
  if (rawValue < 0) return 0;
  if (rawValue >= 1) {
    return Math.round(rawValue); // Round to nearest integer for 1 and above
  } else { // rawValue is between 0 and < 1. User wants 0, 0.25, 0.5, 0.75
    if (rawValue < (0 + 0.25) / 2) return 0;       // Closest to 0
    if (rawValue < (0.25 + 0.5) / 2) return 0.25;  // Closest to 0.25
    if (rawValue < (0.5 + 0.75) / 2) return 0.5;   // Closest to 0.5
    return 0.75;                                 // Closest to 0.75
  }
};


export function MonsterMashDrawer({ open, onOpenChange }: MonsterMashDrawerProps) {
  const [allMonstersData, setAllMonstersData] = useState<MonsterSummaryWithCR[]>([]);
  const [filteredMonsters, setFilteredMonsters] = useState<MonsterSummaryWithCR[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<MonsterDetail | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [crRange, setCrRange] = useState<[number, number]>([CR_SLIDER_MIN, CR_SLIDER_MAX]);

  const [favorites, setFavorites] = useState<FavoriteMonster[]>([]);

  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isBuildingIndex, setIsBuildingIndex] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resultsSortConfig, setResultsSortConfig] = useState<SortConfig>({ key: 'name', order: 'asc' });
  const [favoritesSortConfig, setFavoritesSortConfig] = useState<SortConfig>({ key: 'name', order: 'asc' });

  const applyFiltersAndSort = useCallback(() => {
    let tempFiltered = [...allMonstersData];

    if (searchTerm.trim() !== "") {
      tempFiltered = tempFiltered.filter(monster =>
        monster.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const [minCR, maxCR] = crRange;
     // Only filter by CR if the range is not the default full range
    if (minCR !== CR_SLIDER_MIN || maxCR !== CR_SLIDER_MAX) {
        tempFiltered = tempFiltered.filter(monster => {
            if (monster.cr === undefined) return false; // Exclude if CR is unknown when filter is active
            const monsterCRNum = monster.cr; // CR is already a number in MonsterSummaryWithCR
            return monsterCRNum >= minCR && monsterCRNum <= maxCR;
        });
    }


    if (resultsSortConfig.key === 'name') {
      tempFiltered.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        let comparison = 0;
        if (nameA > nameB) comparison = 1;
        else if (nameA < nameB) comparison = -1;
        return resultsSortConfig.order === 'asc' ? comparison : comparison * -1;
      });
    } else if (resultsSortConfig.key === 'cr') {
        tempFiltered.sort((a, b) => {
            const crA = a.cr === undefined ? -1 : a.cr;
            const crB = b.cr === undefined ? -1 : b.cr;
            if (crA === -1 && crB === -1) return 0;
            if (crA === -1) return resultsSortConfig.order === 'asc' ? 1 : -1; 
            if (crB === -1) return resultsSortConfig.order === 'asc' ? -1 : 1; 
            return resultsSortConfig.order === 'asc' ? crA - crB : crB - crA;
        });
    }
    setFilteredMonsters(tempFiltered);
  }, [allMonstersData, searchTerm, crRange, resultsSortConfig]);


  const fetchAndCacheFullMonsterIndex = useCallback(async () => {
    setIsBuildingIndex(true);
    setError(null);
    try {
      const summaryResponse = await fetch(`${DND5E_API_BASE_URL}/api/monsters`);
      if (!summaryResponse.ok) throw new Error(`Failed to fetch monster summary list: ${summaryResponse.statusText}`);
      const summaryData = await summaryResponse.json();
      const summaries: MonsterSummary[] = summaryData.results || [];

      const enrichedMonsters: MonsterSummaryWithCR[] = [];
      for (const summary of summaries) {
        try {
          const detailResponse = await fetch(`${DND5E_API_BASE_URL}${summary.url}`);
          if (detailResponse.ok) {
            const detailData: MonsterDetail = await detailResponse.json();
            enrichedMonsters.push({
              index: detailData.index,
              name: detailData.name,
              cr: detailData.challenge_rating, 
              type: detailData.type,
              url: summary.url 
            });
          } else {
            console.warn(`Failed to fetch details for ${summary.name}: ${detailResponse.statusText}`);
            enrichedMonsters.push({ index: summary.index, name: summary.name, url: summary.url }); 
          }
        } catch (detailError) {
            console.warn(`Error fetching details for ${summary.name}:`, detailError);
            enrichedMonsters.push({ index: summary.index, name: summary.name, url: summary.url }); 
        }
      }
      
      localStorage.setItem(MONSTER_MASH_FULL_INDEX_STORAGE_KEY, JSON.stringify(enrichedMonsters));
      setAllMonstersData(enrichedMonsters);
      applyFiltersAndSort();

    } catch (err: any) {
      console.error("Error building full monster index:", err);
      setError(err.message || "Could not build local monster index. Some features might be limited.");
      if (allMonstersData.length === 0) {
         const summaryResponseFallback = await fetch(`${DND5E_API_BASE_URL}/api/monsters`);
         if (summaryResponseFallback.ok) {
            const summaryDataFallback = await summaryResponseFallback.json();
            setAllMonstersData((summaryDataFallback.results || []).map(m => ({index: m.index, name: m.name, url: m.url})));
         } else {
            setError("Failed to load even basic monster list. Please try again later.");
         }
      }
    } finally {
      setIsBuildingIndex(false);
      setIsLoadingList(false); 
    }
  }, [applyFiltersAndSort, allMonstersData.length]);


  useEffect(() => {
    if (open && allMonstersData.length === 0 && !isLoadingList && !isBuildingIndex) {
        setIsLoadingList(true); 
        try {
            const cachedIndex = localStorage.getItem(MONSTER_MASH_FULL_INDEX_STORAGE_KEY);
            if (cachedIndex) {
                const parsedIndex: MonsterSummaryWithCR[] = JSON.parse(cachedIndex);
                setAllMonstersData(parsedIndex);
                applyFiltersAndSort();
                setIsLoadingList(false);
            } else {
                fetchAndCacheFullMonsterIndex();
            }
        } catch (e) {
            console.error("Error loading cached monster index:", e);
            fetchAndCacheFullMonsterIndex();
        }
    }
  }, [open, allMonstersData.length, isLoadingList, isBuildingIndex, fetchAndCacheFullMonsterIndex, applyFiltersAndSort]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (open && allMonstersData.length > 0) {
        applyFiltersAndSort();
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, crRange, resultsSortConfig, open, allMonstersData, applyFiltersAndSort]);


  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(MONSTER_MASH_FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (e) {
      console.error("Error loading favorites from localStorage", e);
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    if (favorites.length > 0 || localStorage.getItem(MONSTER_MASH_FAVORITES_STORAGE_KEY)) { 
      try {
        localStorage.setItem(MONSTER_MASH_FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      } catch (e) {
        console.error("Error saving favorites to localStorage", e);
      }
    }
  }, [favorites]);

  const fetchMonsterDetail = async (monsterIndex: string) => {
    if (!monsterIndex) return;
    setIsLoadingDetail(true);
    setError(null);
    setSelectedMonster(null);
    try {
      const response = await fetch(`${DND5E_API_BASE_URL}/api/monsters/${monsterIndex}`);
      if (!response.ok) throw new Error(`Failed to fetch details for ${monsterIndex}: ${response.statusText}`);
      const data: MonsterDetail = await response.json();
      setSelectedMonster(data);
    } catch (err: any) {
      console.error("Error fetching monster detail:", err);
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
      let crValue: number | undefined;
      let typeValue: string | undefined;

      if ('challenge_rating' in monsterToToggle) { 
        crValue = monsterToToggle.challenge_rating;
        typeValue = monsterToToggle.type;
      } else if ('cr' in monsterToToggle) { 
        crValue = monsterToToggle.cr;
        typeValue = monsterToToggle.type;
      }
      
      if (crValue === undefined) {
        setIsLoadingDetail(true);
        try {
          const monsterUrl = (monsterToToggle as MonsterSummaryWithCR).url || `/api/monsters/${monsterToToggle.index}`;
          const response = await fetch(`${DND5E_API_BASE_URL}${monsterUrl}`);
          if (!response.ok) {
            setError(`Could not fetch details for ${monsterToToggle.name} to add to favorites.`);
            setIsLoadingDetail(false);
            return;
          }
          const monsterDetailData: MonsterDetail = await response.json();
          crValue = monsterDetailData.challenge_rating;
          typeValue = monsterDetailData.type;
        } catch (err) {
          console.error("Error fetching details to favorite:", err);
          setError(`Could not fetch details for ${monsterToToggle.name} to add to favorites.`);
          setIsLoadingDetail(false);
          return;
        } finally {
          setIsLoadingDetail(false);
        }
      }
      
      if (crValue === undefined) {
          setError(`CR undefined for ${monsterToToggle.name}. Cannot add to favorites.`);
          return;
      }

      const newFavorite: FavoriteMonster = {
        index: monsterToToggle.index,
        name: monsterToToggle.name,
        cr: crValue,
        type: typeValue || "Unknown Type",
      };
      setFavorites(prevFavs => [...prevFavs, newFavorite]);
    }
  };

  const isFavorite = (monsterIndex: string) => favorites.some(f => f.index === monsterIndex);

  const formatArmorClass = (acArray: ArmorClass[] | undefined): string => {
    if (!acArray || acArray.length === 0) return "N/A";
    const mainAc = acArray[0];
    let str = `${mainAc.value} (${mainAc.type})`;
    if (mainAc.desc) str += ` - ${mainAc.desc}`;
    return str;
  };

  const renderMonsterActions = (actions: MonsterAction[] | SpecialAbility[] | LegendaryAction[] | undefined) => {
    if (!actions || actions.length === 0) return <p className="text-sm text-muted-foreground">None</p>;
    return (
      <ul className="list-disc pl-5 space-y-2">
        {actions.map(action => (
          <li key={action.name} className="text-sm">
            <strong className="font-medium">{action.name}{action.usage ? ` (${action.usage.type}${action.usage.times ? ` ${action.usage.times} times` : ''}${action.usage.dice ? `, recharges on ${action.usage.dice}` : ''})` : ''}.</strong> {action.desc}
            { (action as MonsterAction).attack_bonus !== undefined && <p className="text-xs pl-2">Attack Bonus: +{(action as MonsterAction).attack_bonus}</p> }
            { (action as MonsterAction).damage && (action as MonsterAction).damage?.map((dmg, i) => (
              <p key={i} className="text-xs pl-2">Damage: {dmg.damage_dice} {dmg.damage_type?.name}</p>
            ))}
             { (action as MonsterAction).dc && <p className="text-xs pl-2">DC { (action as MonsterAction).dc?.dc_value} { (action as MonsterAction).dc?.dc_type.name} ({ (action as MonsterAction).dc?.success_type})</p>}
          </li>
        ))}
      </ul>
    );
  };

  const sortedFavorites = [...favorites].sort((a, b) => {
    let valA, valB;
    if (favoritesSortConfig.key === 'name') {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    } else { 
      valA = crToNumber(a.cr);
      valB = crToNumber(b.cr);
    }
    let comparison = 0;
    if (valA > valB) comparison = 1;
    else if (valA < valB) comparison = -1;
    return favoritesSortConfig.order === 'asc' ? comparison : comparison * -1;
  });

  const formatCRSliderRangeLabel = (): string => {
    const minLabel = formatCRDisplay(crRange[0]);
    const maxLabel = formatCRDisplay(crRange[1]);
    if (crRange[0] === CR_SLIDER_MIN && crRange[1] === CR_SLIDER_MAX) return "CR Range: All";
    return `CR Range: ${minLabel} - ${maxLabel}`;
  }

  const handleCRSliderChange = (newSliderRange: [number, number]) => {
    const snappedMin = snapCRValue(newSliderRange[0]);
    const snappedMax = snapCRValue(newSliderRange[1]);
    setCrRange([snappedMin, Math.max(snappedMin, snappedMax)]);
  };


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
              <VenetianMask className="mr-3 h-7 w-7"/>Monster Mash
            </SheetTitle>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary/80">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>Search the D&D 5e bestiary. The first time opening this drawer may be slow as it builds a local index of monster CRs for filtering.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </SheetHeader>
        
        <div className="flex flex-1 min-h-0 border-t pr-8 relative">

          {/* Favorites Sidebar (Column 1) */}
          <div className="w-1/5 min-w-[200px] max-w-[280px] border-r bg-card p-3 flex flex-col">
            <div className="mb-2 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-primary">Favorites ({favorites.length})</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort Key</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={favoritesSortConfig.key} onValueChange={(value) => setFavoritesSortConfig(prev => ({ ...prev, key: value as SortKey }))}>
                    <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="cr">Challenge Rating</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Order</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={favoritesSortConfig.order} onValueChange={(value) => setFavoritesSortConfig(prev => ({ ...prev, order: value as SortOrder }))}>
                    <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <ScrollArea className="flex-1">
              {favorites.length === 0 ? (
                <p className="text-sm text-muted-foreground">No favorites yet.</p>
              ) : (
                <ul className="space-y-1">
                  {sortedFavorites.map(fav => (
                    <li
                      key={fav.index}
                      onClick={() => fetchMonsterDetail(fav.index)}
                      className={cn(
                        "p-2 rounded-md hover:bg-muted cursor-pointer text-sm flex justify-between items-center",
                        selectedMonster?.index === fav.index && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <span>{fav.name} <span className="text-xs text-muted-foreground">(CR {formatCRDisplay(fav.cr)})</span></span>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </div>

          {/* Middle Column: Search/Filters & Results (Column 2) */}
          <div className="w-2/5 flex flex-col p-4 border-r bg-background overflow-y-auto">
            <div className="sticky top-0 bg-background z-10 py-3 space-y-3">
                <div className="relative">
                    <Input
                      id="monster-search"
                      placeholder="Search by Name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-8"
                    />
                    {searchTerm && (
                      <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm("")}>
                        <X className="h-4 w-4"/>
                      </Button>
                    )}
                </div>
                 <div>
                    <Label htmlFor="cr-slider" className="text-sm mb-1 block">
                      {formatCRSliderRangeLabel()}
                    </Label>
                    <Slider
                        id="cr-slider"
                        min={CR_SLIDER_MIN}
                        max={CR_SLIDER_MAX}
                        step={CR_SLIDER_STEP} // Use fine step for raw values
                        value={crRange}
                        onValueChange={handleCRSliderChange} // Use handler for snapping
                        className="my-2"
                    />
                </div>
            </div>

            <div className="flex flex-col border rounded-lg overflow-hidden flex-1 bg-card mt-3">
              <div className="p-3 bg-muted border-b flex justify-between items-center">
                <h3 className="text-md font-semibold text-primary">
                  Results ({isLoadingList || isBuildingIndex ? "..." : filteredMonsters.length})
                </h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort Key</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={resultsSortConfig.key} onValueChange={(value) => setResultsSortConfig(prev => ({ ...prev, key: value as SortKey }))}>
                      <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="cr">Challenge Rating</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Order</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={resultsSortConfig.order} onValueChange={(value) => setResultsSortConfig(prev => ({ ...prev, order: value as SortOrder }))}>
                      <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {isBuildingIndex ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                   <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                   <p className="text-sm text-muted-foreground">Building local monster index... <br/>This may take a moment (first time only).</p>
                 </div>
              ) :isLoadingList ? (
                 <div className="flex-1 flex items-center justify-center p-4">
                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
              ) : error && !isLoadingList && allMonstersData.length === 0 ? ( 
                 <p className="p-4 text-destructive text-center">{error}</p>
              ) : filteredMonsters.length === 0 && !isLoadingList && !isBuildingIndex ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  {allMonstersData.length > 0 ? "No monsters match your search or CR filter." : "No monsters loaded or API error."}
                </p>
              ) : (
                <ScrollArea className="flex-1">
                  <ul className="divide-y">
                    {filteredMonsters.map(monster => (
                      <li
                        key={monster.index}
                        className={cn(
                          "p-3 hover:bg-muted/50 flex justify-between items-center",
                          selectedMonster?.index === monster.index && "bg-primary/10"
                        )}
                      >
                        <span className="font-medium text-sm cursor-pointer flex-1" onClick={() => fetchMonsterDetail(monster.index)}>
                          {monster.name} {monster.cr !== undefined ? <span className="text-xs text-muted-foreground">(CR {formatCRDisplay(monster.cr)})</span> : ""}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(monster)}
                          className="h-7 w-7"
                          aria-label={isFavorite(monster.index) ? "Unfavorite" : "Favorite"}
                        >
                          <Star className={cn("h-4 w-4", isFavorite(monster.index) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")}/>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </div>
          </div>

          {/* Right Column: Monster Details (Column 3) */}
            <div className="flex-1 flex flex-col bg-card border-l">
                <div className="p-3 border-b flex justify-between items-center sticky top-0 bg-card z-10">
                    <h3 className="text-md font-semibold truncate pr-2 text-foreground">{selectedMonster ? selectedMonster.name : "Monster Details"}</h3>
                    {selectedMonster && (
                        <div className="flex gap-1">
                            <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => toggleFavorite(selectedMonster)} className="h-8 w-8" aria-label={isFavorite(selectedMonster.index) ? "Unfavorite" : "Favorite"}>
                                <Star className={cn("h-5 w-5", isFavorite(selectedMonster.index) && "text-yellow-400 fill-yellow-400", !isFavorite(selectedMonster.index) && "text-muted-foreground/70")}/>
                                </Button>
                            </TooltipTrigger><TooltipContent>{isFavorite(selectedMonster.index) ? "Unfavorite" : "Favorite"}</TooltipContent></Tooltip></TooltipProvider>
                            <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled className="h-8 w-8"><ShieldAlert className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent>Add to Combat Tracker (TBD)</TooltipContent></Tooltip></TooltipProvider>
                            <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled className="h-8 w-8"><MapPin className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent>Add to Location (TBD)</TooltipContent></Tooltip></TooltipProvider>
                        </div>
                    )}
                </div>

            {isLoadingDetail ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : selectedMonster ? (
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3 text-sm">
                    <p className="text-sm text-muted-foreground">{selectedMonster.size} {selectedMonster.type} ({selectedMonster.subtype || 'no subtype'}), {selectedMonster.alignment}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs border p-2 rounded-md bg-background">
                      <div><strong>AC:</strong> {formatArmorClass(selectedMonster.armor_class)}</div>
                      <div><strong>HP:</strong> {selectedMonster.hit_points} ({selectedMonster.hit_points_roll})</div>
                      <div><strong>CR:</strong> {formatCRDisplay(selectedMonster.challenge_rating)} ({selectedMonster.xp} XP)</div>
                    </div>
                    <div><strong>Speed:</strong> {Object.entries(selectedMonster.speed).map(([key, val]) => `${key} ${val}`).join(', ')}</div>
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-xs border p-2 rounded-md bg-background">
                      <div className="text-center"><strong>STR</strong><br/>{selectedMonster.strength} ({Math.floor((selectedMonster.strength - 10) / 2)})</div>
                      <div className="text-center"><strong>DEX</strong><br/>{selectedMonster.dexterity} ({Math.floor((selectedMonster.dexterity - 10) / 2)})</div>
                      <div className="text-center"><strong>CON</strong><br/>{selectedMonster.constitution} ({Math.floor((selectedMonster.constitution - 10) / 2)})</div>
                      <div className="text-center"><strong>INT</strong><br/>{selectedMonster.intelligence} ({Math.floor((selectedMonster.intelligence - 10) / 2)})</div>
                      <div className="text-center"><strong>WIS</strong><br/>{selectedMonster.wisdom} ({Math.floor((selectedMonster.wisdom - 10) / 2)})</div>
                      <div className="text-center"><strong>CHA</strong><br/>{selectedMonster.charisma} ({Math.floor((selectedMonster.charisma - 10) / 2)})</div>
                    </div>

                    {selectedMonster.proficiencies?.length > 0 && (
                      <div><strong>Saving Throws & Skills:</strong> {selectedMonster.proficiencies.map(p => `${p.proficiency.name.replace("Saving Throw: ", "").replace("Skill: ", "")} +${p.value}`).join(', ')}</div>
                    )}
                    {selectedMonster.damage_vulnerabilities?.length > 0 && <div><strong>Vulnerabilities:</strong> {selectedMonster.damage_vulnerabilities.join(', ')}</div>}
                    {selectedMonster.damage_resistances?.length > 0 && <div><strong>Resistances:</strong> {selectedMonster.damage_resistances.join(', ')}</div>}
                    {selectedMonster.damage_immunities?.length > 0 && <div><strong>Immunities:</strong> {selectedMonster.damage_immunities.join(', ')}</div>}
                    {selectedMonster.condition_immunities?.length > 0 && <div><strong>Condition Immunities:</strong> {selectedMonster.condition_immunities.map(ci => ci.name).join(', ')}</div>}
                    {selectedMonster.senses && <div><strong>Senses:</strong> {Object.entries(selectedMonster.senses).map(([key, val]) => `${key.replace("_", " ")} ${val}`).join(', ')}</div>}
                    <div><strong>Languages:</strong> {selectedMonster.languages || "None"}</div>

                    {selectedMonster.special_abilities && selectedMonster.special_abilities.length > 0 && (
                      <div><h4 className="font-semibold mt-2 mb-1 text-primary">Special Abilities</h4>{renderMonsterActions(selectedMonster.special_abilities)}</div>
                    )}
                    {selectedMonster.actions && selectedMonster.actions.length > 0 && (
                      <div><h4 className="font-semibold mt-2 mb-1 text-primary">Actions</h4>{renderMonsterActions(selectedMonster.actions)}</div>
                    )}
                    {selectedMonster.legendary_actions && selectedMonster.legendary_actions.length > 0 && (
                        <div><h4 className="font-semibold mt-2 mb-1 text-primary">Legendary Actions</h4>{renderMonsterActions(selectedMonster.legendary_actions)}</div>
                    )}
                    {selectedMonster.image && (
                        <div className="mt-2">
                            <Image src={`${DND5E_API_BASE_URL}${selectedMonster.image}`} alt={selectedMonster.name} width={300} height={300} className="rounded-md border object-contain mx-auto" data-ai-hint={`${selectedMonster.type} monster`} />
                        </div>
                    )}
                </div>
              </ScrollArea>
            ) : error && !isBuildingIndex ? ( 
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mb-2"/>
                <p className="text-destructive text-center">{error}</p>
              </div>
            ) : !isBuildingIndex && (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-2"/>
                <p className="text-sm text-muted-foreground">Select a monster from the list to view its details, or use search and CR filters.</p>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]"
          aria-label="Close Monster Mash"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </SheetContent>
    </Sheet>
  );
}
