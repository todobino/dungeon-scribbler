
"use client";

import { useState, useEffect, useCallback } from "react";
import type { MonsterSummary, MonsterDetail, FavoriteMonster, ArmorClass, MonsterAction, SpecialAbility, LegendaryAction } from "@/lib/types";
import { MONSTER_MASH_FAVORITES_STORAGE_KEY } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Removed CardFooter
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
import { Swords, Search, X, Star, ShieldAlert, MapPin, Loader2, AlertTriangle, Info, ShieldCheck, BookOpen, ArrowUpDown } from "lucide-react";
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

export function MonsterMashDrawer({ open, onOpenChange }: MonsterMashDrawerProps) {
  const [allMonstersData, setAllMonstersData] = useState<MonsterSummary[]>([]);
  const [filteredMonsters, setFilteredMonsters] = useState<MonsterSummary[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<MonsterDetail | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [minCR, setMinCR] = useState<string>("");
  const [maxCR, setMaxCR] = useState<string>("");

  const [favorites, setFavorites] = useState<FavoriteMonster[]>([]);
  
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resultsSortConfig, setResultsSortConfig] = useState<SortConfig>({ key: 'name', order: 'asc' });
  const [favoritesSortConfig, setFavoritesSortConfig] = useState<SortConfig>({ key: 'name', order: 'asc' });


  useEffect(() => {
    if (open && allMonstersData.length === 0) {
      setIsLoadingList(true);
      setError(null);
      fetch(`${DND5E_API_BASE_URL}/api/monsters`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch monster list: ${res.status}`);
          return res.json();
        })
        .then(data => {
          const monstersWithCR: MonsterSummary[] = (data.results || []).map((m: any) => ({
            ...m,
            // API list doesn't have CR, so we set it to a default or fetch details.
            // For now, it's not directly available on summary.
          }));
          setAllMonstersData(monstersWithCR);
        })
        .catch(err => {
          console.error("Error fetching monster list:", err);
          setError("Could not load monster list. Please try again later.");
        })
        .finally(() => setIsLoadingList(false));
    }
  }, [open, allMonstersData.length]);

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

  const handleFilterAndSortMonsters = useCallback(async () => {
    let filtered = [...allMonstersData]; // Create a copy to sort

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(monster =>
        monster.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // For CR filtering on the main list, we must fetch details for ALL monsters first,
    // or filter after they are displayed, which is not ideal for large lists.
    // The D&D 5e API's /api/monsters endpoint doesn't support CR range filtering.
    // So, CR filtering from minCR/maxCR state is effectively client-side AFTER fetching details if we were to implement it thoroughly.
    // Given the performance implications, this step will be skipped for now for the main list.
    // CR filtering will be truly effective when viewing details or managing favorites where CR is known.

    if (resultsSortConfig.key === 'name') {
        filtered.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            let comparison = 0;
            if (nameA > nameB) comparison = 1;
            else if (nameA < nameB) comparison = -1;
            return resultsSortConfig.order === 'asc' ? comparison : comparison * -1;
        });
    }
    // CR Sorting on main list not directly feasible without fetching all details.

    setFilteredMonsters(filtered);
    setError(null); // Clear previous errors if filtering is successful
  }, [searchTerm, allMonstersData, resultsSortConfig]);


  useEffect(() => {
    const debounceTimer = setTimeout(() => {
        handleFilterAndSortMonsters();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, resultsSortConfig, handleFilterAndSortMonsters]);


  const fetchMonsterDetail = async (monsterIndex: string) => {
    setIsLoadingDetail(true);
    setError(null);
    setSelectedMonster(null); // Clear previous selection
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
      // Ensure we have CR for the favorite. If current monster is summary, fetch details.
      let monsterDetailToSave: MonsterDetail;
      if ('challenge_rating' in monsterToIndex) { // It's already a MonsterDetail
        monsterDetailToSave = monsterToIndex;
      } else { // It's a MonsterSummary, need to fetch details
        setIsLoadingDetail(true); // Indicate loading for this specific action
        try {
          const response = await fetch(`${DND5E_API_BASE_URL}/api/monsters/${monsterToIndex.index}`);
          if (!response.ok) throw new Error(`Failed to fetch details for ${monsterToIndex.name} to favorite.`);
          monsterDetailToSave = await response.json();
        } catch (err) {
          console.error("Error fetching details to favorite:", err);
          setError(`Could not fetch details for ${monsterToIndex.name} to add to favorites.`);
          setIsLoadingDetail(false);
          return; // Abort if fetch fails
        } finally {
          setIsLoadingDetail(false); // Reset loading state
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
    const valA = favoritesSortConfig.key === 'name' ? a.name.toLowerCase() : a.cr;
    const valB = favoritesSortConfig.key === 'name' ? b.name.toLowerCase() : b.cr;
    let comparison = 0;
    if (valA > valB) comparison = 1;
    else if (valA < valB) comparison = -1;
    return favoritesSortConfig.order === 'asc' ? comparison : comparison * -1;
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full h-full max-w-full sm:max-w-full flex flex-col p-0 overflow-hidden">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center text-2xl"><Swords className="mr-3 h-7 w-7 text-primary"/>Monster Mash</SheetTitle>
          <SheetDescription>Search the D&D 5e bestiary and manage your favorite creatures.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 min-h-0">
          {/* Favorites Sidebar */}
          <div className="w-1/4 min-w-[220px] max-w-[300px] border-r bg-background p-3 flex flex-col">
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
                        selectedMonster?.index === fav.index && "bg-primary/10"
                      )}
                    >
                      <span>{fav.name} <span className="text-xs text-muted-foreground">(CR {fav.cr})</span></span>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </div>

          {/* Main Content Area */}
          <TooltipProvider>
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-2 pb-3 border-b items-end">
              <div className="flex-grow">
                <Label htmlFor="monster-search">Search by Name</Label>
                <div className="relative">
                  <Input 
                    id="monster-search" 
                    placeholder="e.g., Goblin, Dragon, Aboleth..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-8"
                  />
                  {searchTerm && <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm("")}><X className="h-4 w-4"/></Button>}
                </div>
              </div>
              {/* Min/Max CR inputs removed as per previous iteration */}
            </div>
            
            {error && <p className="text-destructive text-center mb-2 p-2 bg-destructive/10 rounded-md">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
              {/* Results List */}
              <div className="flex flex-col border rounded-lg overflow-hidden">
                <div className="p-3 bg-muted border-b flex justify-between items-center">
                  <h3 className="text-md font-semibold">
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
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuRadioItem value="cr" disabled className="text-muted-foreground/70">Challenge Rating</DropdownMenuRadioItem>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p className="text-xs">CR sorting on this list is not available.<br/>View monster details to see CR.<br/>Favorites can be CR sorted.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
                ) : filteredMonsters.length === 0 && !isLoadingList ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    {allMonstersData.length > 0 ? "No monsters match your search." : "Loading initial monster list or API error."}
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

              {/* Monster Detail View */}
              <div className="flex flex-col border rounded-lg overflow-hidden bg-card">
                 <div className="p-3 bg-muted border-b flex justify-between items-center">
                    <h3 className="text-md font-semibold">Monster Details</h3>
                    {selectedMonster && (
                        <div className="flex gap-1">
                           <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => toggleFavorite(selectedMonster)} className="h-8 w-8" aria-label={isFavorite(selectedMonster.index) ? "Unfavorite" : "Favorite"}>
                                    <Star className={cn("h-5 w-5", isFavorite(selectedMonster.index) && "text-yellow-400 fill-yellow-400")}/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{isFavorite(selectedMonster.index) ? "Unfavorite" : "Favorite"}</TooltipContent>
                           </Tooltip>
                           <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled className="h-8 w-8"><ShieldCheck className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent>Add to Initiative (TBD)</TooltipContent></Tooltip>
                           <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled className="h-8 w-8"><MapPin className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent>Add to Location (TBD)</TooltipContent></Tooltip>
                        </div>
                    )}
                 </div>
                {isLoadingDetail ? (
                  <div className="flex-1 flex items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : selectedMonster ? (
                  <ScrollArea className="flex-1 p-4">
                    <Card className="shadow-none border-none bg-transparent">
                      <CardHeader className="p-0 pb-3">
                          <CardTitle className="text-xl">{selectedMonster.name}</CardTitle>
                          <CardDescription>{selectedMonster.size} {selectedMonster.type} ({selectedMonster.subtype || 'no subtype'}), {selectedMonster.alignment}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 space-y-3 text-sm bg-transparent">
                        <div className="grid grid-cols-3 gap-2 text-xs border p-2 rounded-md bg-card">
                          <div><strong>AC:</strong> {formatArmorClass(selectedMonster.armor_class)}</div>
                          <div><strong>HP:</strong> {selectedMonster.hit_points} ({selectedMonster.hit_points_roll})</div>
                          <div><strong>CR:</strong> {selectedMonster.challenge_rating} ({selectedMonster.xp} XP)</div>
                        </div>
                        <div><strong>Speed:</strong> {Object.entries(selectedMonster.speed).map(([key, val]) => `${key} ${val}`).join(', ')}</div>
                        <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-xs border p-2 rounded-md bg-card">
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
                      </CardContent>
                    </Card>
                  </ScrollArea>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                     <BookOpen className="h-12 w-12 text-muted-foreground mb-2"/>
                    <p className="text-sm text-muted-foreground">Select a monster from the list to view its details, or use search.</p>
                     <p className="text-xs text-muted-foreground mt-2">Note: CR filtering for the main search list is not available due to API limitations. Favorites can be sorted by CR.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          </TooltipProvider>
        </div>
      </SheetContent>
    </Sheet>
  );
}
