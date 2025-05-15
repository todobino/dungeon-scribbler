
"use client";

import { useState, useEffect, useCallback } from "react";
import type { MonsterSummary, MonsterDetail, FavoriteMonster } from "@/lib/types";
import { MONSTER_MASH_FAVORITES_STORAGE_KEY } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Swords, Search, X, Star, ShieldAlert, MapPin, Loader2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const DND5E_API_BASE_URL = "https://www.dnd5eapi.co";

interface MonsterMashDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MonsterMashDrawer({ open, onOpenChange }: MonsterMashDrawerProps) {
  const [allMonstersData, setAllMonstersData] = useState<MonsterSummary[]>([]);
  const [filteredMonsters, setFilteredMonsters] = useState<MonsterSummary[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<MonsterDetail | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [crFilter, setCrFilter] = useState<string>(""); // CR as string for input

  const [favorites, setFavorites] = useState<FavoriteMonster[]>([]);
  const [selectedFavoriteForPopover, setSelectedFavoriteForPopover] = useState<MonsterDetail | null>(null);

  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial list of all monster summaries
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
          setAllMonstersData(data.results || []);
          setFilteredMonsters(data.results || []);
        })
        .catch(err => {
          console.error("Error fetching monster list:", err);
          setError("Could not load monster list. Please try again later.");
        })
        .finally(() => setIsLoadingList(false));
    }
  }, [open, allMonstersData.length]);

  // Load favorites from localStorage
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

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MONSTER_MASH_FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error("Error saving favorites to localStorage", e);
    }
  }, [favorites]);

  const handleSearchAndFilter = useCallback(async () => {
    if (crFilter.trim() !== "") {
      setIsLoadingList(true);
      setError(null);
      setSelectedMonster(null); // Clear detail view when CR filter changes
      try {
        const response = await fetch(`${DND5E_API_BASE_URL}/api/monsters?challenge_rating=${crFilter.trim()}`);
        if (!response.ok) throw new Error(`Failed to fetch monsters for CR ${crFilter}: ${response.status}`);
        const data = await response.json();
        let crFiltered = data.results || [];
        if (searchTerm.trim() !== "") {
          crFiltered = crFiltered.filter((monster: MonsterSummary) =>
            monster.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setFilteredMonsters(crFiltered);
      } catch (err) {
        console.error("Error fetching CR filtered monsters:", err);
        setError(`Could not load monsters for CR ${crFilter}. Try a different CR or clear the filter.`);
        setFilteredMonsters([]);
      } finally {
        setIsLoadingList(false);
      }
    } else {
      // Client-side name filtering if CR filter is empty
      let nameFiltered = allMonstersData;
      if (searchTerm.trim() !== "") {
        nameFiltered = allMonstersData.filter(monster =>
          monster.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setFilteredMonsters(nameFiltered);
      setError(null); // Clear previous CR errors if any
    }
  }, [searchTerm, crFilter, allMonstersData]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
        handleSearchAndFilter();
    }, 300); // Debounce search/filter application
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, crFilter, handleSearchAndFilter]);


  const fetchMonsterDetail = async (monsterIndex: string, forPopover: boolean = false) => {
    if (!forPopover) setIsLoadingDetail(true); else setSelectedFavoriteForPopover(null);
    setError(null);
    try {
      const response = await fetch(`${DND5E_API_BASE_URL}/api/monsters/${monsterIndex}`);
      if (!response.ok) throw new Error(`Failed to fetch details for ${monsterIndex}: ${response.status}`);
      const data = await response.json();
      if (forPopover) {
        setSelectedFavoriteForPopover(data);
      } else {
        setSelectedMonster(data);
      }
    } catch (err) {
      console.error("Error fetching monster detail:", err);
      setError(`Could not load details for ${monsterIndex}.`);
      if (!forPopover) setSelectedMonster(null);
    } finally {
      if (!forPopover) setIsLoadingDetail(false);
    }
  };

  const toggleFavorite = (monster: MonsterDetail | MonsterSummary) => {
    const existingFav = favorites.find(f => f.index === monster.index);
    if (existingFav) {
      setFavorites(favorites.filter(f => f.index !== monster.index));
    } else {
      // Ensure we have enough details to create a FavoriteMonster entry
      if ('challenge_rating' in monster && 'type' in monster) { // MonsterDetail
         setFavorites([...favorites, { index: monster.index, name: monster.name, cr: (monster as MonsterDetail).challenge_rating, type: (monster as MonsterDetail).type }]);
      } else { // MonsterSummary - need to fetch details first for CR/Type if not displaying them
        // For simplicity, if it's just a summary, we might only store index/name
        // or fetch details before favoriting. Let's fetch details first for now.
        fetchMonsterDetail(monster.index).then(detailData => {
          // This part is tricky because fetchMonsterDetail sets selectedMonster, not returns.
          // A better approach would be for fetchMonsterDetail to return data.
          // For now, assuming selectedMonster gets updated by fetchMonsterDetail
          // This is a simplification and might need refinement for robustness
          if(selectedMonster && selectedMonster.index === monster.index) { // check if the fetched detail is the one we wanted
             setFavorites([...favorites, { index: selectedMonster.index, name: selectedMonster.name, cr: selectedMonster.challenge_rating, type: selectedMonster.type }]);
          }
        });
      }
    }
  };
  
  const isFavorite = (monsterIndex: string) => favorites.some(f => f.index === monsterIndex);

  const formatArmorClass = (acArray: ArmorClass[]): string => {
    if (!acArray || acArray.length === 0) return "N/A";
    const mainAc = acArray[0];
    let str = `${mainAc.value} (${mainAc.type})`;
    if (mainAc.desc) str += ` - ${mainAc.desc}`;
    // Could add more logic for multiple AC sources if needed
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


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full h-full max-w-full sm:max-w-full flex flex-col p-0 overflow-hidden">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center text-2xl"><Swords className="mr-3 h-7 w-7 text-primary"/>Monster Mash</SheetTitle>
          <SheetDescription>Search the D&D 5e bestiary, filter creatures, and manage your favorites.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 min-h-0">
          {/* Favorites Sidebar */}
          <div className="w-1/4 min-w-[200px] max-w-[300px] border-r bg-background p-3 flex flex-col">
            <h3 className="text-lg font-semibold mb-2 text-primary">Favorites</h3>
            <ScrollArea className="flex-1">
              {favorites.length === 0 ? (
                <p className="text-sm text-muted-foreground">No favorites yet. Click the star on a monster's details to add it here.</p>
              ) : (
                <ul className="space-y-1">
                  {favorites.map(fav => (
                     <Popover key={fav.index} onOpenChange={(isOpen) => {
                        if (isOpen) fetchMonsterDetail(fav.index, true);
                        else setSelectedFavoriteForPopover(null);
                     }}>
                      <PopoverTrigger asChild>
                        <li className="p-2 rounded-md hover:bg-muted cursor-pointer text-sm flex justify-between items-center">
                          <span>{fav.name}</span>
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        </li>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 z-[60]" side="right" align="start">
                         {selectedFavoriteForPopover && selectedFavoriteForPopover.index === fav.index ? (
                          <div className="space-y-1">
                            <h4 className="font-semibold">{selectedFavoriteForPopover.name}</h4>
                            <p className="text-xs text-muted-foreground">{selectedFavoriteForPopover.size} {selectedFavoriteForPopover.type}, CR {selectedFavoriteForPopover.challenge_rating}</p>
                            <p className="text-xs">AC: {formatArmorClass(selectedFavoriteForPopover.armor_class)} | HP: {selectedFavoriteForPopover.hit_points} ({selectedFavoriteForPopover.hit_dice})</p>
                          </div>
                        ) : <div className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>}
                      </PopoverContent>
                    </Popover>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 pb-3 border-b">
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
              <div className="w-full sm:w-40">
                <Label htmlFor="cr-filter">Challenge Rating (CR)</Label>
                 <Input 
                    id="cr-filter" 
                    placeholder="e.g., 1/4, 5, 10" 
                    value={crFilter}
                    onChange={(e) => setCrFilter(e.target.value)}
                  />
              </div>
            </div>
            
            {error && <p className="text-destructive text-center mb-2 p-2 bg-destructive/10 rounded-md">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
              {/* Results List */}
              <div className="flex flex-col border rounded-lg overflow-hidden">
                <h3 className="text-md font-semibold p-3 bg-muted border-b">
                  Results ({isLoadingList ? "..." : filteredMonsters.length})
                </h3>
                {isLoadingList ? (
                   <div className="flex-1 flex items-center justify-center p-4">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                   </div>
                ) : filteredMonsters.length === 0 && !isLoadingList ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    {allMonstersData.length > 0 ? "No monsters match your criteria." : "Loading initial monster list or API error."}
                  </p>
                ) : (
                  <ScrollArea className="flex-1">
                    <ul className="divide-y">
                      {filteredMonsters.map(monster => (
                        <li 
                          key={monster.index}
                          onClick={() => fetchMonsterDetail(monster.index)}
                          className={cn(
                            "p-3 cursor-pointer hover:bg-muted/50",
                            selectedMonster?.index === monster.index && "bg-primary/10"
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{monster.name}</span>
                            {isFavorite(monster.index) && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                )}
              </div>

              {/* Monster Detail View */}
              <div className="flex flex-col border rounded-lg overflow-hidden">
                 <h3 className="text-md font-semibold p-3 bg-muted border-b">Monster Details</h3>
                {isLoadingDetail ? (
                  <div className="flex-1 flex items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : selectedMonster ? (
                  <ScrollArea className="flex-1 p-4">
                    <Card className="shadow-none border-none">
                      <CardHeader className="p-0 pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{selectedMonster.name}</CardTitle>
                           <Button variant={isFavorite(selectedMonster.index) ? "default" : "outline"} size="sm" onClick={() => toggleFavorite(selectedMonster)}>
                              <Star className={cn("mr-2 h-4 w-4", isFavorite(selectedMonster.index) && "text-yellow-400 fill-yellow-400")}/>
                              {isFavorite(selectedMonster.index) ? "Favorited" : "Favorite"}
                            </Button>
                        </div>
                        <CardDescription>{selectedMonster.size} {selectedMonster.type} ({selectedMonster.subtype || 'no subtype'}), {selectedMonster.alignment}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 space-y-3 text-sm">
                        <div className="grid grid-cols-3 gap-2 text-xs border p-2 rounded-md bg-muted/50">
                          <div><strong>AC:</strong> {formatArmorClass(selectedMonster.armor_class)}</div>
                          <div><strong>HP:</strong> {selectedMonster.hit_points} ({selectedMonster.hit_points_roll})</div>
                          <div><strong>CR:</strong> {selectedMonster.challenge_rating} ({selectedMonster.xp} XP)</div>
                        </div>
                        <div><strong>Speed:</strong> {Object.entries(selectedMonster.speed).map(([key, val]) => `${key} ${val}`).join(', ')}</div>
                        <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-xs border p-2 rounded-md">
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
                       <CardFooter className="p-0 pt-3 mt-3 border-t flex gap-2">
                          <Button variant="outline" size="sm" disabled><ShieldAlert className="mr-2 h-4 w-4"/>Add to Initiative (TBD)</Button>
                          <Button variant="outline" size="sm" disabled><MapPin className="mr-2 h-4 w-4"/>Add to Location (TBD)</Button>
                        </CardFooter>
                    </Card>
                  </ScrollArea>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                     <Info className="h-12 w-12 text-muted-foreground mb-2"/>
                    <p className="text-sm text-muted-foreground">Select a monster from the list to view its details, or use search/CR filter.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
