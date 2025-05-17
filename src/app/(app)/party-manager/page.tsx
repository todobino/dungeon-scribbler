
"use client";

import type { PlayerCharacter, ApiListItem } from "@/lib/types";
// Removed: import type { DndClass } from "@/lib/constants"; // DndClass removed
import { useState, useEffect, useCallback } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription as UIAlertDialogDescription, AlertDialogFooter as UIAlertDialogFooter, AlertDialogHeader as UIAlertDialogHeader, AlertDialogTitle as UIAlertDialogTitle } from "@/components/ui/alert-dialog"; // Renamed imports
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, User, Shield, Wand, Users, Trash2, Eye, BookOpen, Library, Edit3, LinkIcon, Link2OffIcon, ArrowUpCircle, Palette, VenetianMask, ChevronsRight, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PREDEFINED_COLORS, DND5E_API_BASE_URL } from "@/lib/constants"; // DND_CLASSES removed
import { DND_CLASS_DETAILS } from "@/lib/data/class-data"; // Import new class data
import { useCampaign, type CharacterFormData } from "@/contexts/campaign-context";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { CharacterDetailsDialog } from "@/components/features/party-manager/character-details-dialog";
import { LevelDiscrepancyDialog } from "@/components/features/party-manager/level-discrepancy-dialog";


export default function PartyManagerPage() {
  const { 
    activeCampaign, 
    activeCampaignParty, 
    isLoadingCampaigns, 
    isLoadingParty,
    addCharacterToActiveCampaign,
    updateCharacterInActiveCampaign,
    deleteCharacterFromActiveCampaign,
    incrementPartyLevel,
    setPartyLevel
  } = useCampaign();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<PlayerCharacter | null>(null);
  const [currentCharacterDetails, setCurrentCharacterDetails] = useState<PlayerCharacter | null>(null);
  const [linkedPartyLevel, setLinkedPartyLevel] = useState(false);

  const [isLevelSyncDialogOpen, setIsLevelSyncDialogOpen] = useState(false);
  const [levelSyncDetails, setLevelSyncDetails] = useState<{ characterId: string; newLevel: number; allFormData: CharacterFormData } | null>(null);

  const [isLevelDiscrepancyDialogOpen, setIsLevelDiscrepancyDialogOpen] = useState(false);
  const [partyUniqueLevels, setPartyUniqueLevels] = useState<number[]>([]);

  const [apiRaces, setApiRaces] = useState<ApiListItem[]>([]);
  const [isLoadingApiRaces, setIsLoadingApiRaces] = useState(false);
  // No longer need apiSubclasses and isLoadingApiSubclasses from API
  // const [apiSubclasses, setApiSubclasses] = useState<ApiListItem[]>([]);
  // const [isLoadingApiSubclasses, setIsLoadingApiSubclasses] = useState(false);


  const initialCharacterFormState: CharacterFormData = {
    name: "",
    level: 1,
    class: DND_CLASS_DETAILS[0]?.class || "", // Default to first class from data or empty
    race: "", 
    subclass: "",
    armorClass: 10,
    initiativeModifier: 0,
    color: PREDEFINED_COLORS[0].value,
  };
  const [characterFormData, setCharacterFormData] = useState<CharacterFormData>(initialCharacterFormState);

  // Fetch Races (remains the same)
  useEffect(() => {
    if (isFormDialogOpen && apiRaces.length === 0 && !isLoadingApiRaces) {
      const fetchRaces = async () => {
        setIsLoadingApiRaces(true);
        try {
          const response = await fetch(`${DND5E_API_BASE_URL}/api/races`);
          if (!response.ok) throw new Error("Failed to fetch races");
          const data = await response.json();
          setApiRaces(data.results || []);
        } catch (error) {
          console.error("Error fetching races:", error);
        }
        setIsLoadingApiRaces(false);
      };
      fetchRaces();
    }
  }, [isFormDialogOpen, apiRaces.length, isLoadingApiRaces]);

  // Subclasses are now derived from DND_CLASS_DETAILS, not fetched via API
  const availableSubclasses = DND_CLASS_DETAILS.find(
    (cls) => cls.class === characterFormData.class
  )?.subclasses || [];


  const handleFormSubmit = async () => {
    if (characterFormData.name?.trim() && characterFormData.class && characterFormData.race?.trim() && activeCampaign) {
      
      const dataToSave: CharacterFormData = {
        ...characterFormData,
        name: characterFormData.name.trim(),
        race: characterFormData.race.trim(),
        subclass: characterFormData.subclass?.trim() || "",
      };

      if (editingCharacter) {
        const originalLevel = editingCharacter.level;
        const newLevel = dataToSave.level;

        if (linkedPartyLevel && newLevel !== originalLevel && activeCampaignParty.length > 1) {
          setLevelSyncDetails({
            characterId: editingCharacter.id,
            newLevel: newLevel,
            allFormData: dataToSave 
          });
          setIsLevelSyncDialogOpen(true);
          return; 
        } else {
          await updateCharacterInActiveCampaign({ ...editingCharacter, ...dataToSave });
        }
      } else { 
        let dataToAdd = { ...dataToSave };
        if (linkedPartyLevel && activeCampaignParty.length > 0) {
          dataToAdd.level = activeCampaignParty[0].level; 
        }
        await addCharacterToActiveCampaign(dataToAdd);
      }
      setCharacterFormData(initialCharacterFormState);
      setEditingCharacter(null);
      setIsFormDialogOpen(false);
      // No longer need to clear apiSubclasses here as it's derived
    }
  };

  const handleLevelSyncConfirmation = async (syncAll: boolean) => {
    if (!levelSyncDetails || !editingCharacter) return; 

    const { newLevel, allFormData } = levelSyncDetails;

    if (syncAll) {
      try {
        await setPartyLevel(newLevel); 
        await updateCharacterInActiveCampaign({ ...editingCharacter, ...allFormData, level: newLevel });
      } catch (error) {
        console.error("Error syncing party levels:", error);
      }
    } else {
      await updateCharacterInActiveCampaign({ ...editingCharacter, ...allFormData });
    }

    setIsLevelSyncDialogOpen(false);
    setLevelSyncDetails(null);
    setCharacterFormData(initialCharacterFormState);
    setEditingCharacter(null);
    setIsFormDialogOpen(false); 
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setCharacterFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: keyof CharacterFormData, value: string) => {
     setCharacterFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === "class") {
        newState.subclass = ""; // Reset subclass when class changes
      }
      return newState;
    });
  };
  
  const handleColorChange = (value: string) => {
    setCharacterFormData((prev) => ({
      ...prev,
      color: value,
    }));
  };

  const openAddDialog = () => {
    setEditingCharacter(null);
    let newCharLevel = 1;
    if (linkedPartyLevel && activeCampaignParty.length > 0) {
      newCharLevel = activeCampaignParty[0].level;
    }
    setCharacterFormData({...initialCharacterFormState, level: newCharLevel, race: "", class: DND_CLASS_DETAILS[0]?.class || "", subclass: ""});
    setIsFormDialogOpen(true);
  };

  const openEditDialog = async (character: PlayerCharacter) => {
    setEditingCharacter(character);
    setCharacterFormData({
      name: character.name,
      level: character.level,
      class: character.class,
      race: character.race,
      subclass: character.subclass || "",
      armorClass: character.armorClass,
      initiativeModifier: character.initiativeModifier || 0,
      color: character.color || PREDEFINED_COLORS[0].value,
    });
    setIsFormDialogOpen(true);
  };

  const openDetailsDialog = (character: PlayerCharacter) => {
    setCurrentCharacterDetails(character);
    setIsDetailsDialogOpen(true);
  };
  
  const handleDeleteCharacter = async (id: string) => {
    if (activeCampaign) {
      await deleteCharacterFromActiveCampaign(id);
    }
  };

  const handleLevelUpPartyButton = async () => {
    if (linkedPartyLevel && activeCampaignParty.length > 0) {
      await incrementPartyLevel();
    }
  };

  const handleLinkedPartyLevelChange = (newCheckedState: boolean) => {
    if (newCheckedState) { 
      if (activeCampaignParty.length > 0) {
        const uniqueLevels = [...new Set(activeCampaignParty.map(c => c.level))];
        if (uniqueLevels.length > 1) {
          setPartyUniqueLevels(uniqueLevels.sort((a,b) => a-b));
          setIsLevelDiscrepancyDialogOpen(true);
          return; 
        }
      }
      setLinkedPartyLevel(true);
    } else { 
      setLinkedPartyLevel(false);
    }
  };

  const handleLevelDiscrepancyConfirm = async (selectedLevel: number) => {
    await setPartyLevel(selectedLevel);
    setLinkedPartyLevel(true);
    setIsLevelDiscrepancyDialogOpen(false);
  };

  const handleLevelDiscrepancyCancel = () => {
    setLinkedPartyLevel(false); 
    setIsLevelDiscrepancyDialogOpen(false);
  };

  if (isLoadingCampaigns || isLoadingParty) {
    return <div className="text-center p-10"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2"/>Loading party data...</div>;
  }

  if (!activeCampaign) {
    return (
      <Card className="text-center py-12">
        <CardHeader>
          <Library className="mx-auto h-16 w-16 text-muted-foreground" />
          <CardTitle className="mt-4">No Active Campaign</CardTitle>
          <CardDescription>Please select or create a campaign to manage your party.</CardDescription>
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
  
  const isAddingNewCharacter = !editingCharacter;
  const isLevelInputDisabled = linkedPartyLevel && isAddingNewCharacter && activeCampaignParty.length > 0;


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Party Manager</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto ml-auto">
          <div className="flex items-center space-x-2 p-2 border rounded-md bg-card w-full sm:w-auto justify-between">
            <Label htmlFor="link-level-switch" className="flex items-center gap-1 cursor-pointer">
              {linkedPartyLevel ? <LinkIcon className="h-4 w-4" /> : <Link2OffIcon className="h-4 w-4" />}
              Link Party Level
            </Label>
            <Switch
              id="link-level-switch"
              checked={linkedPartyLevel}
              onCheckedChange={handleLinkedPartyLevelChange}
            />
          </div>
           <Button 
            onClick={handleLevelUpPartyButton} 
            disabled={!linkedPartyLevel || activeCampaignParty.length === 0}
            className="w-full sm:w-auto"
          >
            <ArrowUpCircle className="mr-2 h-5 w-5" /> Level Up Party (+1)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activeCampaignParty.map((char) => (
          <Card 
            key={char.id} 
            className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col border-l-4"
            style={{ borderColor: char.color || 'hsl(var(--border))' }}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">{char.name}</CardTitle>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive -mt-2 -mr-2" onClick={() => handleDeleteCharacter(char.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Level {char.level} {char.race} {char.class}{char.subclass ? ` (${char.subclass})` : ""}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
               <div className="flex items-center">
                <VenetianMask className="mr-2 h-5 w-5 text-primary" /> 
                <span>Race: {char.race}</span>
              </div>
              <div className="flex items-center">
                <Wand className="mr-2 h-5 w-5 text-primary" />
                <span>Class: {char.class}{char.subclass ? ` (${char.subclass})` : ""}</span>
              </div>
              <div className="flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                <span>Level: {char.level}</span>
              </div>
               <div className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                <span>Armor Class: {char.armorClass}</span>
              </div>
              <div className="flex items-center">
                <ChevronsRight className="mr-2 h-5 w-5 text-primary" />
                <span>Initiative Mod: {char.initiativeModifier !== undefined ? (char.initiativeModifier >= 0 ? `+${char.initiativeModifier}` : char.initiativeModifier) : '+0'}</span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => openDetailsDialog(char)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => openEditDialog(char)}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
        <Card
          className="col-span-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted hover:border-primary hover:bg-muted/50 transition-colors duration-200 cursor-pointer group min-h-[280px]"
          onClick={openAddDialog}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openAddDialog(); }}
          aria-label="Add new character"
        >
          <PlusCircle className="h-12 w-12 text-muted-foreground group-hover:text-primary mb-3 transition-colors" />
          <p className="text-lg font-medium text-muted-foreground group-hover:text-primary transition-colors">Add Character</p>
          <p className="text-sm text-muted-foreground text-center mt-1">Click to add a new character to the party.</p>
        </Card>
      </div>


      <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingCharacter(null); 
            setCharacterFormData(initialCharacterFormState);
            // No longer need to clear apiSubclasses here
            setLevelSyncDetails(null); 
            setIsLevelSyncDialogOpen(false); 
          }
          setIsFormDialogOpen(isOpen);
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCharacter ? "Edit Character" : "Add New Character"}</DialogTitle>
            <DialogDescription>
              {editingCharacter ? `Update details for ${editingCharacter.name}.` : `Fill in the details for the new player character in ${activeCampaign?.name}.`}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-3">
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={characterFormData.name} onChange={handleInputChange} placeholder="e.g., Elara Meadowlight" />
              </div>
              
              <div>
                <Label htmlFor="race-select">Race</Label>
                <Select 
                  name="race" 
                  value={characterFormData.race} 
                  onValueChange={(value) => handleSelectChange("race", value || "")}
                >
                  <SelectTrigger id="race-select" disabled={isLoadingApiRaces}>
                    <SelectValue placeholder={isLoadingApiRaces ? "Loading races..." : "Select a race"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingApiRaces ? (
                       <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      apiRaces.map((race) => (
                        <SelectItem key={race.index} value={race.name}>
                          {race.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="class-select">Class</Label>
                <Select name="class" value={characterFormData.class} onValueChange={(value) => handleSelectChange("class", value || (DND_CLASS_DETAILS[0]?.class || ""))}>
                  <SelectTrigger id="class-select">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {DND_CLASS_DETAILS.map((classDetail) => (
                      <SelectItem key={classDetail.class} value={classDetail.class}>
                        {classDetail.class}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subclass-select">Subclass</Label>
                <Select 
                  name="subclass" 
                  value={characterFormData.subclass || ""} 
                  onValueChange={(value) => handleSelectChange("subclass", value || "")}
                  disabled={!characterFormData.class || availableSubclasses.length === 0}
                >
                  <SelectTrigger id="subclass-select">
                    <SelectValue placeholder={
                        !characterFormData.class ? "Select class first" : 
                        availableSubclasses.length === 0 ? "No subclasses available" : 
                        "Select a subclass (Optional)"
                    }/>
                  </SelectTrigger>
                  <SelectContent key={characterFormData.class || 'no-class-selected'}>
                    {availableSubclasses.length === 0 && characterFormData.class ? (
                        <SelectItem value="none" disabled>No subclasses for {characterFormData.class}</SelectItem>
                    ) : (
                      availableSubclasses.map((subclass) => (
                        <SelectItem key={subclass.name} value={subclass.name}>
                          {subclass.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level">Level</Label>
                <Input 
                  id="level" 
                  name="level" 
                  type="number" 
                  value={characterFormData.level.toString()} 
                  onChange={handleInputChange} 
                  min="1" 
                  disabled={isLevelInputDisabled}
                />
                 {isLevelInputDisabled && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Level is linked to party (Level {activeCampaignParty[0]?.level || 1}). Unlink "Link Party Level" to set a different starting level.
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="armorClass">Armor Class</Label>
                <Input id="armorClass" name="armorClass" type="number" value={characterFormData.armorClass.toString()} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="initiativeModifier">Initiative Modifier</Label>
                <Input id="initiativeModifier" name="initiativeModifier" type="number" value={(characterFormData.initiativeModifier || 0).toString()} onChange={handleInputChange} placeholder="e.g., 2" />
              </div>
              <div>
                <Label htmlFor="color-select">Character Color</Label>
                <Select name="color" value={characterFormData.color} onValueChange={handleColorChange}>
                  <SelectTrigger id="color-select">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-sm mr-2 border" style={{ backgroundColor: color.value }} />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => { 
                setIsFormDialogOpen(false); 
                setEditingCharacter(null); 
                setCharacterFormData(initialCharacterFormState);
                setLevelSyncDetails(null);
                setIsLevelSyncDialogOpen(false);
            }}>Cancel</Button>
            <Button 
              onClick={handleFormSubmit} 
              disabled={!characterFormData.name?.trim() || !characterFormData.race?.trim()}
            >
              {editingCharacter ? "Save Changes" : "Add Character"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CharacterDetailsDialog 
        character={currentCharacterDetails}
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />

      <AlertDialog open={isLevelSyncDialogOpen} onOpenChange={setIsLevelSyncDialogOpen}>
        <AlertDialogContent>
          <UIAlertDialogHeader>
            <UIAlertDialogTitle>Confirm Party Level Sync</UIAlertDialogTitle>
            <UIAlertDialogDescription>
              Party level is linked. You've changed {editingCharacter?.name}'s level to {levelSyncDetails?.newLevel}.
              Do you want to update all other party members to Level {levelSyncDetails?.newLevel} as well?
            </UIAlertDialogDescription>
          </UIAlertDialogHeader>
          <UIAlertDialogFooter>
            <Button variant="outline" onClick={() => handleLevelSyncConfirmation(false)}>
              No, only this character
            </Button>
            <Button onClick={() => handleLevelSyncConfirmation(true)}>
              Yes, sync all to Level {levelSyncDetails?.newLevel}
            </Button>
          </UIAlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LevelDiscrepancyDialog
        isOpen={isLevelDiscrepancyDialogOpen}
        onOpenChange={setIsLevelDiscrepancyDialogOpen}
        partyLevels={partyUniqueLevels}
        onConfirmSync={handleLevelDiscrepancyConfirm}
        onCancel={handleLevelDiscrepancyCancel}
      />

    </div>
  );
}

    