
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Library, Users, Swords, PlusCircle, Trash2, XCircle, Skull, Star, SaveAll, FolderOpen, ListChecks, Edit, MinusCircle } from "lucide-react";
import { useCampaign } from "@/contexts/campaign-context";
import type { EncounterMonster, SavedEncounter, FavoriteMonster } from "@/lib/types";
import { ENCOUNTER_STORAGE_KEY_PREFIX, SAVED_ENCOUNTERS_STORAGE_KEY_PREFIX, MONSTER_MASH_FAVORITES_STORAGE_KEY } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter as UIAlertDialogFooter, AlertDialogHeader as UIAlertDialogHeader, AlertDialogTitle as UIAlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatCRDisplay } from "@/components/features/monster-mash/MonsterMashDrawer";


interface CurrentEncounterData {
  title: string;
  monsters: EncounterMonster[];
}

type DuplicateNameAction = "overwrite" | "rename" | "append";

export default function EncounterPlannerPage() {
  const { activeCampaign, isLoadingCampaigns } = useCampaign();
  const { toast } = useToast();

  const [encounterMonsters, setEncounterMonsters] = useState<EncounterMonster[]>([]);
  const [currentEncounterTitle, setCurrentEncounterTitle] = useState("New Encounter");
  
  const [isLoadingEncounter, setIsLoadingEncounter] = useState(true);
  const [isLoadingSavedEncounters, setIsLoadingSavedEncounters] = useState(true);

  const [monsterName, setMonsterName] = useState("");
  const [monsterQuantity, setMonsterQuantity] = useState("1");
  const [monsterCR, setMonsterCR] = useState("");
  const [monsterAC, setMonsterAC] = useState("");
  const [monsterHP, setMonsterHP] = useState("");

  const [savedEncounters, setSavedEncounters] = useState<SavedEncounter[]>([]);
  const [isFavoriteDialogOpen, setIsFavoriteDialogOpen] = useState(false);
  const [favoritesList, setFavoritesList] = useState<FavoriteMonster[]>([]);
  const [encounterToDelete, setEncounterToDelete] = useState<SavedEncounter | null>(null);

  const [isDuplicateNameDialogOpen, setIsDuplicateNameDialogOpen] = useState(false);
  const [conflictingEncounterTitle, setConflictingEncounterTitle] = useState("");
  const [newEncounterNameForRename, setNewEncounterNameForRename] = useState("");


  const getEncounterStorageKey = useCallback(() => {
    if (!activeCampaign) return null;
    return `${ENCOUNTER_STORAGE_KEY_PREFIX}${activeCampaign.id}`;
  }, [activeCampaign]);

  const getSavedEncountersStorageKey = useCallback(() => {
    if (!activeCampaign) return null;
    return `${SAVED_ENCOUNTERS_STORAGE_KEY_PREFIX}${activeCampaign.id}`;
  }, [activeCampaign]);

  // Load Current Encounter
  useEffect(() => {
    if (isLoadingCampaigns) return;
    if (!activeCampaign) {
      setEncounterMonsters([]);
      setCurrentEncounterTitle("New Encounter");
      setIsLoadingEncounter(false);
      return;
    }
    setIsLoadingEncounter(true);
    const storageKey = getEncounterStorageKey();
    if (storageKey) {
      try {
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
          const parsedData: CurrentEncounterData = JSON.parse(storedData);
          setEncounterMonsters(parsedData.monsters || []);
          setCurrentEncounterTitle(parsedData.title || "New Encounter");
        } else {
          setEncounterMonsters([]);
          setCurrentEncounterTitle("New Encounter");
        }
      } catch (error) {
        console.error("Error loading current encounter from localStorage for " + activeCampaign.name, error);
        setEncounterMonsters([]);
        setCurrentEncounterTitle("New Encounter");
      }
    } else {
      setEncounterMonsters([]);
      setCurrentEncounterTitle("New Encounter");
    }
    setIsLoadingEncounter(false);
  }, [activeCampaign, isLoadingCampaigns, getEncounterStorageKey]);

  // Save Current Encounter
  useEffect(() => {
    if (activeCampaign && !isLoadingEncounter) {
      const storageKey = getEncounterStorageKey();
      if (storageKey) {
        try {
          const dataToSave: CurrentEncounterData = { title: currentEncounterTitle, monsters: encounterMonsters };
          localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        } catch (error) {
          console.error("Error saving current encounter to localStorage for " + activeCampaign.name, error);
        }
      }
    }
  }, [encounterMonsters, currentEncounterTitle, activeCampaign, isLoadingEncounter, getEncounterStorageKey]);

  // Load Saved Encounters
  useEffect(() => {
    if (isLoadingCampaigns) return;
    if (!activeCampaign) {
      setSavedEncounters([]);
      setIsLoadingSavedEncounters(false);
      return;
    }
    setIsLoadingSavedEncounters(true);
    const storageKey = getSavedEncountersStorageKey();
    if (storageKey) {
      try {
        const storedEncounters = localStorage.getItem(storageKey);
        setSavedEncounters(storedEncounters ? JSON.parse(storedEncounters) : []);
      } catch (error) {
        console.error("Error loading saved encounters from localStorage for " + activeCampaign.name, error);
        setSavedEncounters([]);
      }
    } else {
      setSavedEncounters([]);
    }
    setIsLoadingSavedEncounters(false);
  }, [activeCampaign, isLoadingCampaigns, getSavedEncountersStorageKey]);

  // Save Saved Encounters
  useEffect(() => {
    if (activeCampaign && !isLoadingSavedEncounters) {
      const storageKey = getSavedEncountersStorageKey();
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(savedEncounters));
        } catch (error) {
          console.error("Error saving saved encounters to localStorage for " + activeCampaign.name, error);
        }
      }
    }
  }, [savedEncounters, activeCampaign, isLoadingSavedEncounters, getSavedEncountersStorageKey]);
  
  // Load Favorites for Dialog
  useEffect(() => {
    if (isFavoriteDialogOpen) {
      try {
        const storedFavorites = localStorage.getItem(MONSTER_MASH_FAVORITES_STORAGE_KEY);
        setFavoritesList(storedFavorites ? JSON.parse(storedFavorites) : []);
      } catch (error) {
        console.error("Error loading favorites for Encounter Planner:", error);
        setFavoritesList([]);
      }
    }
  }, [isFavoriteDialogOpen]);


  const handleAddEnemy = () => {
    if (!monsterName.trim()) {
      toast({ title: "Missing Name", description: "Please enter a name for the enemy.", variant: "destructive" });
      return;
    }
    const quantity = parseInt(monsterQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: "Invalid Quantity", description: "Quantity must be a positive number.", variant: "destructive" });
      return;
    }

    const newEnemy: EncounterMonster = {
      id: Date.now().toString(),
      name: monsterName.trim(),
      quantity: quantity,
      cr: monsterCR.trim() || undefined,
      ac: monsterAC.trim() || undefined,
      hp: monsterHP.trim() || undefined,
    };

    setEncounterMonsters(prev => [...prev, newEnemy]);
    setMonsterName("");
    setMonsterQuantity("1");
    setMonsterCR("");
    setMonsterAC("");
    setMonsterHP("");
    toast({ title: "Enemy Added", description: `${newEnemy.name} (x${newEnemy.quantity}) added to encounter.` });
  };

  const handleSelectFavorite = (fav: FavoriteMonster) => {
    setMonsterName(fav.name);
    setMonsterCR(formatCRDisplay(fav.cr));
    setMonsterAC(fav.acValue !== undefined ? fav.acValue.toString() : "");
    setMonsterHP(fav.hpValue !== undefined ? fav.hpValue.toString() : "");
    setIsFavoriteDialogOpen(false);
    toast({title: "Favorite Selected", description: `${fav.name} details pre-filled.`});
  };

  const handleRemoveMonster = (id: string) => {
    setEncounterMonsters(prev => prev.filter(monster => monster.id !== id));
    toast({ title: "Enemy Removed" });
  };

  const handleClearEncounter = () => {
    setEncounterMonsters([]);
    setCurrentEncounterTitle("New Encounter");
    toast({ title: "Current Encounter Cleared" });
  };

  const performSaveEncounter = (title: string, monsters: EncounterMonster[], overwriteId?: string) => {
    const encounterToSave: SavedEncounter = {
      id: overwriteId || Date.now().toString(),
      title: title,
      monsters: [...monsters],
    };

    if (overwriteId) {
      setSavedEncounters(prev => prev.map(enc => enc.id === overwriteId ? encounterToSave : enc));
      toast({ title: "Encounter Overwritten!", description: `"${encounterToSave.title}" has been updated.` });
    } else {
      setSavedEncounters(prev => [encounterToSave, ...prev]);
      toast({ title: "Encounter Saved!", description: `"${encounterToSave.title}" has been added.` });
    }
  };

  const handleSaveCurrentEncounter = () => {
    if (encounterMonsters.length === 0) {
      toast({ title: "Cannot Save Empty Encounter", description: "Add some enemies before saving.", variant: "destructive" });
      return;
    }
    const trimmedTitle = currentEncounterTitle.trim();
    if (!trimmedTitle) {
      toast({ title: "Encounter Title Required", description: "Please give your encounter a title before saving.", variant: "destructive" });
      return;
    }

    const existingEncounter = savedEncounters.find(enc => enc.title.toLowerCase() === trimmedTitle.toLowerCase());
    if (existingEncounter) {
      setConflictingEncounterTitle(existingEncounter.title); 
      setNewEncounterNameForRename(trimmedTitle); 
      setIsDuplicateNameDialogOpen(true);
    } else {
      performSaveEncounter(trimmedTitle, encounterMonsters);
    }
  };
  
  const handleDuplicateNameDialogAction = (action: DuplicateNameAction) => {
    const trimmedOriginalTitle = conflictingEncounterTitle.trim(); 
    const currentTrimmedTitle = currentEncounterTitle.trim(); 

    if (action === "overwrite") {
      const existing = savedEncounters.find(enc => enc.title.toLowerCase() === trimmedOriginalTitle.toLowerCase());
      if (existing) {
        performSaveEncounter(existing.title, encounterMonsters, existing.id);
      }
    } else if (action === "rename") {
      if (!newEncounterNameForRename.trim()) {
        toast({ title: "New Name Required", description: "Please enter a new name for the encounter.", variant: "destructive" });
        return; 
      }
      if (savedEncounters.some(enc => enc.title.toLowerCase() === newEncounterNameForRename.trim().toLowerCase())) {
         toast({ title: "Name Still Exists", description: "That name is also taken. Please choose another.", variant: "destructive" });
        return; 
      }
      performSaveEncounter(newEncounterNameForRename.trim(), encounterMonsters);
    } else if (action === "append") {
      let newTitle = currentTrimmedTitle;
      let count = 2;
      while (savedEncounters.some(enc => enc.title.toLowerCase() === `${currentTrimmedTitle} (${count})`.toLowerCase())) {
        count++;
      }
      newTitle = `${currentTrimmedTitle} (${count})`;
      performSaveEncounter(newTitle, encounterMonsters);
    }
    setIsDuplicateNameDialogOpen(false);
    setConflictingEncounterTitle("");
  };


  const handleLoadSavedEncounter = (encounter: SavedEncounter) => {
    setCurrentEncounterTitle(encounter.title);
    setEncounterMonsters([...encounter.monsters]);
    toast({ title: "Encounter Loaded", description: `"${encounter.title}" is now the current encounter.`});
  };

  const handleDeleteSavedEncounter = (id: string) => {
    setSavedEncounters(prev => prev.filter(enc => enc.id !== id));
    toast({ title: "Saved Encounter Deleted" });
  };

  const handleQuantityChange = (monsterId: string, change: number) => {
    setEncounterMonsters(prev => 
      prev.map(monster => 
        monster.id === monsterId 
          ? { ...monster, quantity: Math.max(1, monster.quantity + change) } 
          : monster
      )
    );
  };


  if (isLoadingCampaigns || isLoadingEncounter || isLoadingSavedEncounters) {
    return <div className="text-center p-10">Loading encounter data...</div>;
  }

  if (!activeCampaign) {
    return (
      <Card className="text-center py-12">
        <CardHeader>
          <Library className="mx-auto h-16 w-16 text-muted-foreground" />
          <CardTitle className="mt-4">No Active Campaign</CardTitle>
          <CardDescription>Please select or create a campaign to plan encounters.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/campaign-management">
              <Users className="mr-2 h-5 w-5" /> Go to Campaign Management
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="flex items-center">
                <Skull className="mr-2 h-5 w-5 text-primary" />
                Add Enemy
              </CardTitle>
              <Dialog open={isFavoriteDialogOpen} onOpenChange={setIsFavoriteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Star className="h-5 w-5 text-amber-400 hover:text-amber-500" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Select Favorite Monster</DialogTitle>
                    <DialogDescription>Choose a monster from your Monster Mash favorites. AC & HP will be pre-filled if available.</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[60vh] mt-4">
                    {favoritesList.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No favorites found in Monster Mash.</p>
                    ) : (
                      <ul className="space-y-2">
                        {favoritesList.map(fav => (
                          <li key={fav.index}>
                            <Button variant="outline" className="w-full justify-start" onClick={() => handleSelectFavorite(fav)}>
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="monsterName">Enemy Name*</Label>
                <Input id="monsterName" value={monsterName} onChange={(e) => setMonsterName(e.target.value)} placeholder="e.g., Goblin Boss" />
              </div>
              <div>
                <Label htmlFor="monsterQuantity">Quantity*</Label>
                <Input id="monsterQuantity" type="number" value={monsterQuantity} onChange={(e) => setMonsterQuantity(e.target.value)} min="1" />
              </div>
              <div>
                <Label htmlFor="monsterCR">Challenge Rating (CR)</Label>
                <Input id="monsterCR" value={monsterCR} onChange={(e) => setMonsterCR(e.target.value)} placeholder="e.g., 1/2 or 5" />
              </div>
              <div>
                <Label htmlFor="monsterAC">Armor Class (AC)</Label>
                <Input id="monsterAC" type="text" value={monsterAC} onChange={(e) => setMonsterAC(e.target.value)} placeholder="e.g., 15" />
              </div>
              <div>
                <Label htmlFor="monsterHP">Hit Points (HP)</Label>
                <Input id="monsterHP" type="text" value={monsterHP} onChange={(e) => setMonsterHP(e.target.value)} placeholder="e.g., 27" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddEnemy} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Enemy to Encounter
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Encounter Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm">
                    Difficulty calculation (Easy, Medium, Hard, Deadly) based on party level and monster XP is coming soon!
                </p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
               <div className="flex-grow mr-2">
                <Label htmlFor="encounterTitle" className="sr-only">Encounter Title</Label>
                <Input 
                  id="encounterTitle"
                  value={currentEncounterTitle} 
                  onChange={(e) => setCurrentEncounterTitle(e.target.value)} 
                  placeholder="Encounter Title (e.g., Goblin Ambush)"
                  className="text-xl font-semibold border-0 shadow-none focus-visible:ring-0 pl-1"
                />
               </div>
              <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" onClick={handleSaveCurrentEncounter} disabled={encounterMonsters.length === 0}>
                  <SaveAll className="mr-2 h-4 w-4" /> Save
                </Button>
                {encounterMonsters.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleClearEncounter}>
                    <XCircle className="mr-2 h-4 w-4" /> Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {encounterMonsters.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No enemies added to this encounter yet.</p>
              ) : (
                <ul className="space-y-3">
                  {encounterMonsters.map((monster) => (
                    <li key={monster.id} className="flex justify-between items-center p-3 border rounded-md shadow-sm bg-card">
                      <div className="flex-grow">
                        <p className="font-medium">{monster.name}</p>
                        <div className="text-xs text-muted-foreground flex gap-2 flex-wrap">
                          {monster.cr && <span>CR: {monster.cr}</span>}
                          {monster.ac && <span>AC: {monster.ac}</span>}
                          {monster.hp && <span>HP: {monster.hp}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(monster.id, -1)} disabled={monster.quantity <= 1}>
                            <MinusCircle className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{monster.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(monster.id, 1)}>
                            <PlusCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveMonster(monster.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">
                    Total XP and other quick-actions (e.g., send to Combat Tracker) will be available here.
                </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary"/>Saved Encounters</CardTitle>
              <CardDescription>Load or delete your previously saved encounters.</CardDescription>
            </CardHeader>
            <CardContent>
              {savedEncounters.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No encounters saved yet for this campaign.</p>
              ) : (
                <ScrollArea className="max-h-[400px]">
                  <Accordion type="multiple" className="w-full">
                    {savedEncounters.map((enc) => (
                      <AccordionItem value={enc.id} key={enc.id}>
                        <div className="flex items-center justify-between py-2 group">
                          <AccordionTrigger className="flex-1 hover:no-underline">
                            <span className="font-medium">{enc.title}</span>
                          </AccordionTrigger>
                          <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" size="sm" onClick={() => handleLoadSavedEncounter(enc)}>
                              <FolderOpen className="mr-1 h-3 w-3" /> Load
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setEncounterToDelete(enc)} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <AccordionContent>
                          <ul className="space-y-2 pl-4 pt-2 border-t">
                            {enc.monsters.map(monster => (
                              <li key={monster.id} className="text-sm">
                                {monster.name} (x{monster.quantity})
                                <span className="text-xs text-muted-foreground ml-2">
                                  {monster.cr && `CR:${monster.cr} `}
                                  {monster.ac && `AC:${monster.ac} `}
                                  {monster.hp && `HP:${monster.hp}`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!encounterToDelete} onOpenChange={(isOpen) => !isOpen && setEncounterToDelete(null)}>
        <AlertDialogContent>
          <UIAlertDialogHeader>
            <UIAlertDialogTitle>Delete Saved Encounter?</UIAlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the encounter "{encounterToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </UIAlertDialogHeader>
          <UIAlertDialogFooter>
            <AlertDialogCancel onClick={() => setEncounterToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (encounterToDelete) handleDeleteSavedEncounter(encounterToDelete.id);
                setEncounterToDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </UIAlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Encounter Name Dialog */}
      <Dialog open={isDuplicateNameDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) setConflictingEncounterTitle(""); setIsDuplicateNameDialogOpen(isOpen);}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Encounter Name</DialogTitle>
            <DialogDescription>
              An encounter named "{conflictingEncounterTitle}" already exists. What would you like to do?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <div>
                <Label htmlFor="newEncounterNameInput">New Name (if renaming):</Label>
                <Input 
                    id="newEncounterNameInput" 
                    value={newEncounterNameForRename} 
                    onChange={(e) => setNewEncounterNameForRename(e.target.value)}
                    placeholder="Enter new unique name"
                />
            </div>
            <p className="text-sm text-muted-foreground">
                Current encounter title is: "{currentEncounterTitle}"
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => handleDuplicateNameDialogAction("append")}>Append Number (e.g., "{currentEncounterTitle} (2)")</Button>
            <Button variant="secondary" onClick={() => handleDuplicateNameDialogAction("rename")} disabled={!newEncounterNameForRename.trim() || newEncounterNameForRename.trim().toLowerCase() === conflictingEncounterTitle.toLowerCase()}>Rename & Save</Button>
            <Button variant="destructive" onClick={() => handleDuplicateNameDialogAction("overwrite")}>Overwrite "{conflictingEncounterTitle}"</Button>
            <Button variant="ghost" onClick={() => {setIsDuplicateNameDialogOpen(false); setConflictingEncounterTitle(""); }}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
