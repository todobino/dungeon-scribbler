
"use client";

import { useState, useEffect, useCallback } from "react";
import type { MonsterSummary, MonsterDetail, FavoriteMonster, ArmorClass, MonsterAction, SpecialAbility, LegendaryAction } from "@/lib/types";
import { MONSTER_MASH_FAVORITES_STORAGE_KEY } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Swords, Search, X, Star, ShieldAlert, MapPin, Loader2, AlertTriangle, Info, ArrowUpAZ, ArrowDownAZ, ShieldCheck, BookOpen } from "lucide-react";
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
  // CR Min/Max filters removed due to API limitations for effective summary filtering.
  // Sorting by CR will be available for Favorites.

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
          const monsters = data.results || [];
          setAllMonstersData(monsters);
          // Initial filter/sort call moved to searchTerm/allMonstersData useEffect
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

  const handleFilterAndSortMonsters = useCallback(() => {
    let filtered = allMonstersData;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(monster =>
        monster.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort results
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
    // CR sorting for summary list is not effective as summaries lack CR data.
    // This will be handled by user inspecting details.

    setFilteredMonsters(filtered);
    setError(null);
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
          <SheetDescription>Search the D&D 5e bestiary, filter creatures, and manage your favorites.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 min-h-0">
          {/* Favorites Sidebar */}
          <div className="w-1/4 min-w-[220px] max-w-[300px] border-r bg-background p-3 flex flex-col">
            <div className="mb-2">
              <h3 className="text-lg font-semibold mb-1 text-primary">Favorites ({favorites.length})</h3>
              <div className="flex gap-1 text-xs items-center">
                <span className="text-muted-foreground">Sort:</span>
                <Button variant={favoritesSortConfig.key === 'name' ? 'secondary' : 'ghost'} size="xs" className="px-1.5 py-0.5 h-auto" onClick={() => setFavoritesSortConfig(prev => ({...prev, key: 'name'}))}>Name</Button>
                <Button variant={favoritesSortConfig.key === 'cr' ? 'secondary' : 'ghost'} size="xs" className="px-1.5 py-0.5 h-auto" onClick={() => setFavoritesSortConfig(prev => ({...prev, key: 'cr'}))}>CR</Button>
                <Button variant="ghost" size="xs" className="px-1 py-0.5 h-auto" onClick={() => setFavoritesSortConfig(prev => ({...prev, order: prev.order === 'asc' ? 'desc' : 'asc'}))}>
                  {favoritesSortConfig.order === 'asc' ? <ArrowUpAZ className="h-3.5 w-3.5"/> : <ArrowDownAZ className="h-3.5 w-3.5"/>}
                </Button>
              </div>
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
                       {/* Favorite star here is redundant if we load details on click */}
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
               {/* CR Filter Inputs Removed */}
            </div>
            
            {error && <p className="text-destructive text-center mb-2 p-2 bg-destructive/10 rounded-md">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
              {/* Results List */}
              <div className="flex flex-col border rounded-lg overflow-hidden">
                <div className="p-3 bg-muted border-b">
                  <h3 className="text-md font-semibold">
                    Results ({isLoadingList ? "..." : filteredMonsters.length})
                  </h3>
                  <div className="flex gap-1 text-xs items-center mt-1">
                    <span className="text-muted-foreground">Sort:</span>
                    <Button variant={resultsSortConfig.key === 'name' ? 'secondary' : 'ghost'} size="xs" className="px-1.5 py-0.5 h-auto" onClick={() => setResultsSortConfig(prev => ({...prev, key: 'name'}))}>Name</Button>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button variant={resultsSortConfig.key === 'cr' ? 'secondary' : 'ghost'} size="xs" className="px-1.5 py-0.5 h-auto" onClick={() => { /* No-op for now, CR sort on summary list is not effective */ }}>CR</Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs p-1">
                        <p>CR sorting on this initial list is not effective.<br/>View monster details to see CR. Favorites can be CR sorted.</p>
                      </TooltipContent>
                    </Tooltip>
                    <Button variant="ghost" size="xs" className="px-1 py-0.5 h-auto" onClick={() => setResultsSortConfig(prev => ({...prev, order: prev.order === 'asc' ? 'desc' : 'asc'}))}>
                      {resultsSortConfig.order === 'asc' ? <ArrowUpAZ className="h-3.5 w-3.5"/> : <ArrowDownAZ className="h-3.5 w-3.5"/>}
                    </Button>
                  </div>
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
                 <h3 className="text-md font-semibold p-3 bg-muted border-b">Monster Details</h3>
                {isLoadingDetail ? (
                  <div className="flex-1 flex items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : selectedMonster ? (
                  <ScrollArea className="flex-1 p-4">
                    <Card className="shadow-none border-none bg-transparent">
                      <CardHeader className="p-0 pb-3 flex-row justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{selectedMonster.name}</CardTitle>
                          <CardDescription>{selectedMonster.size} {selectedMonster.type} ({selectedMonster.subtype || 'no subtype'}), {selectedMonster.alignment}</CardDescription>
                        </div>
                        <div className="flex gap-1">
                           <Button variant="ghost" size="icon" onClick={() => toggleFavorite(selectedMonster)} className="h-8 w-8" aria-label={isFavorite(selectedMonster.index) ? "Unfavorite" : "Favorite"}>
                              <Star className={cn("h-5 w-5", isFavorite(selectedMonster.index) && "text-yellow-400 fill-yellow-400")}/>
                           </Button>
                           <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled className="h-8 w-8"><ShieldCheck className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent>Add to Initiative (TBD)</TooltipContent></Tooltip>
                           <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled className="h-8 w-8"><MapPin className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent>Add to Location (TBD)</TooltipContent></Tooltip>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 space-y-3 text-sm bg-transparent">
                        <div className="grid grid-cols-3 gap-2 text-xs border p-2 rounded-md bg-background/50">
                          <div><strong>AC:</strong> {formatArmorClass(selectedMonster.armor_class)}</div>
                          <div><strong>HP:</strong> {selectedMonster.hit_points} ({selectedMonster.hit_points_roll})</div>
                          <div><strong>CR:</strong> {selectedMonster.challenge_rating} ({selectedMonster.xp} XP)</div>
                        </div>
                        <div><strong>Speed:</strong> {Object.entries(selectedMonster.speed).map(([key, val]) => `${key} ${val}`).join(', ')}</div>
                        <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-xs border p-2 rounded-md bg-background/50">
                          <div className="text-center"><strong>STR</strong><br/>{selectedMonster.strength} ({Math.floor((selectedMonster.strength - 10) / 2)})</div>
                          <div className="text-center"><strong>DEX</strong><br/>{selectedMonster.dexterity} ({Math.floor((selectedMonster.dexterity - 10) / 2)})</div>
                          <div className="text-center"><strong>CON</strong><br/>{selectedMonster.constitution} ({Math.floor((selectedMonster.constitution - 10) / 2)})</div>
                          <div className="text-center"><strong>INT</strong><br/>{selectedMonster.intelligence} ({Math.floor((selectedMonster.intelligence - 10) / 2)})</div>
                          <div className="text-center"><strong>WIS</strong><br/>{selectedMonster.wisdom} ({Math.floor((selectedMonster.wisdom - 10) / 2)})</div>
                          <div className="text-center"><strong>CHA</strong><br/>{selectedMonster.charisma} ({Math.floor((selectedMonster.charisma - 10) / 2)})</div>
                        </div>
                        
                        {selectedMonster.proficiencies.length > 0 && (
                          <div><strong>Saving Throws & Skills:</strong> {selectedMonster.proficiencies.map(p => `${p.proficiency.name.replace("Saving Throw: ", "STR ")} +${p.value}`).join(', ')}</div>
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
                     <p className="text-xs text-muted-foreground mt-2">Note: CR filtering is not available for the main search list due to API limitations. Favorites can be sorted by CR.</p>
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

    

    