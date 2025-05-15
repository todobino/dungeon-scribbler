
"use client";

import { useState, useEffect, useCallback } from "react";
import type { MonsterSummary, MonsterDetail, FavoriteMonster, ArmorClass, MonsterAction, SpecialAbility, LegendaryAction } from "@/lib/types";
import { MONSTER_MASH_FAVORITES_STORAGE_KEY } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
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
import { Swords, Search, X, Star, ShieldAlert, MapPin, Loader2, AlertTriangle, Info, ShieldCheck, BookOpen, ArrowUpDown, HelpCircle } from "lucide-react";
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

const crToNumber = (cr: string | number): number => {
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


export function MonsterMashDrawer({ open, onOpenChange }: MonsterMashDrawerProps) {
  const [allMonstersData, setAllMonstersData] = useState<MonsterSummary[]>([]);
  const [filteredMonsters, setFilteredMonsters] = useState<MonsterSummary[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<MonsterDetail | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [minCRInput, setMinCRInput] = useState("");
  const [maxCRInput, setMaxCRInput] = useState("");

  const [favorites, setFavorites] = useState<FavoriteMonster[]>([]);
  
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resultsSortConfig, setResultsSortConfig] = useState<SortConfig>({ key: 'name', order: 'asc' });
  const [favoritesSortConfig, setFavoritesSortConfig] = useState<SortConfig>({ key: 'name', order: 'asc' });

  const fetchAllMonsters = useCallback(async () => {
    if (allMonstersData.length > 0 && searchTerm === "" && minCRInput === "" && maxCRInput === "") {
      // If we have all monsters and no filters, just use existing data
      setFilteredMonsters(allMonstersData);
      return;
    }
    setIsLoadingList(true);
    setError(null);
    try {
      // Always fetch the full list initially if not present, then filter client-side for name/CR
      const response = await fetch(`${DND5E_API_BASE_URL}/api/monsters`);
      if (!response.ok) throw new Error(`Failed to fetch monster list: ${response.status}`);
      const data = await response.json();
      const monstersWithCR: MonsterSummary[] = data.results || []; // Assume CR is not in summary, will handle later
      
      // Fetch details to get CR for all monsters if not already fetched (costly, but needed for client-side CR filter)
      // For now, we'll assume CR is part of the summary to avoid fetching all details initially.
      // The API does NOT provide CR in the summary list. This part is tricky for efficient CR filtering.
      // A more robust solution would involve a backend or pre-processing the monster list.
      // For now, CR filtering will be done client-side IF CR data were available on MonsterSummary.
      // Let's assume for this iteration we can't filter by CR on the initial list effectively
      // without fetching all details, which is too slow.
      // So, CR filter will apply if details were fetched for all.
      // Simplified: just filter by name if allMonstersData is populated. CR filtering will be more involved.

      setAllMonstersData(monstersWithCR); // Store all monsters
      applyFiltersAndSort(monstersWithCR, searchTerm, minCRInput, maxCRInput, resultsSortConfig);

    } catch (err) {
      console.error("Error fetching monster list:", err);
      setError("Could not load monster list. Please try again later.");
      setAllMonstersData([]);
      setFilteredMonsters([]);
    } finally {
      setIsLoadingList(false);
    }
  }, [allMonstersData, searchTerm, minCRInput, maxCRInput, resultsSortConfig]);


  const applyFiltersAndSort = useCallback((
    monsters: MonsterSummary[], 
    currentSearchTerm: string,
    currentMinCR: string,
    currentMaxCR: string,
    currentSortConfig: SortConfig
  ) => {
    let tempFiltered = [...monsters];

    // Name filter
    if (currentSearchTerm.trim() !== "") {
      tempFiltered = tempFiltered.filter(monster =>
        monster.name.toLowerCase().includes(currentSearchTerm.toLowerCase())
      );
    }
    
    // CR Filter - This requires CR data on MonsterSummary or fetching all details
    // As D&D 5e API monster summaries don't include CR, true CR range filtering on the summary list
    // isn't feasible without fetching details for all monsters, which is slow.
    // We will proceed assuming we filter AFTER fetching, or this is a placeholder for now.
    // For now, we'll mock a CR property if it doesn't exist for demonstration.
    const minCR = parseFloat(currentMinCR);
    const maxCR = parseFloat(currentMaxCR);

    if (!isNaN(minCR) || !isNaN(maxCR)) {
      tempFiltered = tempFiltered.filter(monster => {
        // Assuming monster.cr exists or is fetched. Placeholder:
        const monsterCRString = (monster as any).challenge_rating || (monster as any).cr || "0"; 
        const monsterCR = crToNumber(monsterCRString);
        if (monsterCR === -1) return true; // If CR can't be determined, include it

        const checkMin = isNaN(minCR) || monsterCR >= minCR;
        const checkMax = isNaN(maxCR) || monsterCR <= maxCR;
        return checkMin && checkMax;
      });
    }

    // Sort
    if (currentSortConfig.key === 'name') {
      tempFiltered.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        let comparison = 0;
        if (nameA > nameB) comparison = 1;
        else if (nameA < nameB) comparison = -1;
        return currentSortConfig.order === 'asc' ? comparison : comparison * -1;
      });
    } 
    // CR sort on results list is disabled due to API not providing CR in summary.

    setFilteredMonsters(tempFiltered);
  }, []);


  useEffect(() => {
    if (open && allMonstersData.length === 0) {
      fetchAllMonsters(); // Fetch all monsters on first open
    }
  }, [open, allMonstersData.length, fetchAllMonsters]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (open) {
        // If allMonstersData is already populated, just apply filters
        // Otherwise, fetchAllMonsters will handle initial load and filtering
        if (allMonstersData.length > 0) {
          applyFiltersAndSort(allMonstersData, searchTerm, minCRInput, maxCRInput, resultsSortConfig);
        } else if (!isLoadingList) { // Avoid redundant fetch if already loading
           fetchAllMonsters();
        }
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, minCRInput, maxCRInput, resultsSortConfig, open, allMonstersData, applyFiltersAndSort, isLoadingList, fetchAllMonsters]);


  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(MONSTER_MASH_FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (e) {
      console.error("Error loading favorites from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MONSTER_MASH_FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error("Error saving favorites to localStorage", e);
    }
  }, [favorites]);

  const fetchMonsterDetail = async (monsterIndex: string) => {
    setIsLoadingDetail(true);
    setError(null);
    setSelectedMonster(null); 
    try {
      const response = await fetch(`${DND5E_API_BASE_URL}/api/monsters/${monsterIndex}`);
      if (!response.ok) throw new Error(`Failed to fetch details for ${monsterIndex}: ${response.status}`);
      const data = await response.json();
      setSelectedMonster(data);
    } catch (err) {
      console.error("Error fetching monster detail:", err);
      setError(`Could not load details for ${monsterIndex}.`);
      setSelectedMonster(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };
  
  const toggleFavorite = async (monsterToIndex: MonsterSummary | MonsterDetail) => {
    const existingFav = favorites.find(f => f.index === monsterToIndex.index);
    if (existingFav) {
      setFavorites(favorites.filter(f => f.index !== monsterToIndex.index));
    } else {
      let monsterDetailToSave: MonsterDetail;
      if ('challenge_rating' in monsterToIndex) { 
        monsterDetailToSave = monsterToIndex;
      } else { 
        setIsLoadingDetail(true); 
        try {
          const response = await fetch(`${DND5E_API_BASE_URL}/api/monsters/${monsterToIndex.index}`);
          if (!response.ok) throw new Error(`Failed to fetch details for ${monsterToIndex.name} to favorite.`);
          monsterDetailToSave = await response.json();
        } catch (err) {
          console.error("Error fetching details to favorite:", err);
          setError(`Could not fetch details for ${monsterToIndex.name} to add to favorites.`);
          setIsLoadingDetail(false);
          return; 
        } finally {
          setIsLoadingDetail(false); 
        }
      }
      setFavorites(prevFavs => [...prevFavs, { 
        index: monsterDetailToSave.index, 
        name: monsterDetailToSave.name, 
        cr: monsterDetailToSave.challenge_rating, 
        type: monsterDetailToSave.type 
      }]);
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
            { (action as MonsterAction).attack_bonus && <p className="text-xs pl-2">Attack Bonus: +{(action as MonsterAction).attack_bonus}</p> }
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full h-full max-w-full sm:max-w-full flex flex-col p-0 overflow-hidden">
        <SheetHeader className="p-4 border-b bg-muted flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <SheetTitle className="flex items-center text-2xl text-foreground">
              <Swords className="mr-3 h-7 w-7 text-primary"/>Monster Mash
            </SheetTitle>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>Search the D&D 5e bestiary and manage your favorite creatures.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </SheetHeader>

        <div className="flex flex-1 min-h-0 border-t"> {/* Main container for columns */}
          
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
              {sortedFavorites.length === 0 ? (
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
                      <span>{fav.name} <span className="text-xs text-muted-foreground">(CR {fav.cr})</span></span>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </div>

          {/* Middle Column: Search/Filters & Results (Column 2) */}
          <div className="w-2/5 flex flex-col p-4 border-r bg-background overflow-y-auto">
            {/* Search Bar and CR Filters */}
            <div className="mb-4 space-y-3">
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
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label htmlFor="min-cr" className="text-xs">Min CR</Label>
                        <Input 
                          id="min-cr" 
                          type="text" 
                          placeholder="e.g., 0 or 1/4" 
                          value={minCRInput}
                          onChange={(e) => setMinCRInput(e.target.value)}
                          className="h-8 text-sm"
                        />
                    </div>
                    <div>
                        <Label htmlFor="max-cr" className="text-xs">Max CR</Label>
                        <Input 
                          id="max-cr" 
                          type="text" 
                          placeholder="e.g., 5 or 1/2" 
                          value={maxCRInput}
                          onChange={(e) => setMaxCRInput(e.target.value)}
                          className="h-8 text-sm"
                        />
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">Note: CR filtering is client-side. Type CR as a number (e.g., 0.25 for 1/4, 0.5 for 1/2).</p>
            </div>
            
            {/* Results List Panel */}
            <div className="flex flex-col border rounded-lg overflow-hidden flex-1 bg-card">
              <div className="p-3 bg-muted border-b flex justify-between items-center">
                <h3 className="text-md font-semibold text-primary">
                  Results ({isLoadingList ? "..." : filteredMonsters.length})
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
                       <TooltipProvider><Tooltip><TooltipTrigger asChild>
                            <DropdownMenuRadioItem value="cr" disabled className="text-muted-foreground/70">Challenge Rating</DropdownMenuRadioItem>
                       </TooltipTrigger><TooltipContent side="left"><p className="text-xs max-w-xs">CR sort on results requires CR data on all summaries, not provided by API.</p></TooltipContent></Tooltip></TooltipProvider>
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

              {isLoadingList ? (
                 <div className="flex-1 flex items-center justify-center p-4">
                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
              ) : error && !isLoadingList && filteredMonsters.length === 0 ? (
                 <p className="p-4 text-destructive text-center">{error}</p>
              ) : filteredMonsters.length === 0 && !isLoadingList ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  {allMonstersData.length > 0 ? "No monsters match your search and CR filters." : "Loading initial monster list or API error."}
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
                          {monster.name}
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
                        <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled className="h-8 w-8"><ShieldAlert className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent>Add to Initiative (TBD)</TooltipContent></Tooltip></TooltipProvider>
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
                      <div><strong>CR:</strong> {selectedMonster.challenge_rating} ({selectedMonster.xp} XP)</div>
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
                    
                    {selectedMonster.proficiencies.length > 0 && (
                      <div><strong>Saving Throws & Skills:</strong> {selectedMonster.proficiencies.map(p => `${p.proficiency.name.replace("Saving Throw: ", "").replace("Skill: ", "")} +${p.value}`).join(', ')}</div>
                    )}
                    {selectedMonster.damage_vulnerabilities.length > 0 && <div><strong>Vulnerabilities:</strong> {selectedMonster.damage_vulnerabilities.join(', ')}</div>}
                    {selectedMonster.damage_resistances.length > 0 && <div><strong>Resistances:</strong> {selectedMonster.damage_resistances.join(', ')}</div>}
                    {selectedMonster.damage_immunities.length > 0 && <div><strong>Immunities:</strong> {selectedMonster.damage_immunities.join(', ')}</div>}
                    {selectedMonster.condition_immunities.length > 0 && <div><strong>Condition Immunities:</strong> {selectedMonster.condition_immunities.map(ci => ci.name).join(', ')}</div>}
                    <div><strong>Senses:</strong> {Object.entries(selectedMonster.senses).map(([key, val]) => `${key.replace("_", " ")} ${val}`).join(', ')}</div>
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
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-2"/>
                <p className="text-sm text-muted-foreground">Select a monster from the list to view its details, or use search and CR filters.</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

