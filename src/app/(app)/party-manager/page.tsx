
"use client";

import type { PlayerCharacter } from "@/lib/types";
import type { DndClass, PredefinedColor } from "@/lib/constants";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter as UIAlertDialogFooter, AlertDialogHeader as UIAlertDialogHeader, AlertDialogTitle as UIAlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, User, Shield, Wand, Users, Trash2, Eye, BookOpen, Library, Edit3, LinkIcon, Link2OffIcon, ArrowUpCircle, Palette, VenetianMask, ChevronsRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DND_CLASSES, PREDEFINED_COLORS } from "@/lib/constants";
import { useCampaign, type CharacterFormData } from "@/contexts/campaign-context";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { CharacterDetailsDialog } from "@/components/features/party-manager/character-details-dialog";
import { LevelDiscrepancyDialog } from "@/components/features/party-manager/level-discrepancy-dialog";
import { useToast } from "@/hooks/use-toast";


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
  const { toast } = useToast();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<PlayerCharacter | null>(null);
  const [currentCharacterDetails, setCurrentCharacterDetails] = useState<PlayerCharacter | null>(null);
  const [linkedPartyLevel, setLinkedPartyLevel] = useState(false);

  const [isLevelSyncDialogOpen, setIsLevelSyncDialogOpen] = useState(false);
  const [levelSyncDetails, setLevelSyncDetails] = useState<{ characterId: string; newLevel: number; allFormData: CharacterFormData } | null>(null);

  const [isLevelDiscrepancyDialogOpen, setIsLevelDiscrepancyDialogOpen] = useState(false);
  const [partyUniqueLevels, setPartyUniqueLevels] = useState<number[]>([]);


  const initialCharacterFormState: CharacterFormData = {
    name: "",
    level: 1,
    class: DND_CLASSES[0],
    race: "", 
    armorClass: 10,
    initiativeModifier: 0,
    color: PREDEFINED_COLORS[0].value,
  };
  const [characterFormData, setCharacterFormData] = useState<CharacterFormData>(initialCharacterFormState);

  const handleFormSubmit = async () => {
    if (characterFormData.name?.trim() && characterFormData.class && characterFormData.race?.trim() && activeCampaign) {
      if (editingCharacter) {
        const originalLevel = editingCharacter.level;
        const newLevel = characterFormData.level;

        if (linkedPartyLevel && newLevel !== originalLevel && activeCampaignParty.length > 1) {
          setLevelSyncDetails({
            characterId: editingCharacter.id,
            newLevel: newLevel,
            allFormData: { ...characterFormData } 
          });
          setIsLevelSyncDialogOpen(true);
          return; 
        } else {
          await updateCharacterInActiveCampaign({ ...editingCharacter, ...characterFormData });
          // toast({ title: "Character Updated", description: `${characterFormData.name} has been updated.` });
        }
      } else { // Adding new character
        let dataToAdd = { ...characterFormData };
        if (linkedPartyLevel && activeCampaignParty.length > 0) {
          dataToAdd.level = activeCampaignParty[0].level; // Ensure new char has party level
        }
        await addCharacterToActiveCampaign(dataToAdd);
        // toast({ title: "Character Added", description: `${dataToAdd.name} has been added to the party.` });
      }
      setCharacterFormData(initialCharacterFormState);
      setEditingCharacter(null);
      setIsFormDialogOpen(false);
    } else {
      // toast({ title: "Missing Information", description: "Please fill in Name, Class, and Race.", variant: "destructive"});
    }
  };

  const handleLevelSyncConfirmation = async (syncAll: boolean) => {
    if (!levelSyncDetails || !editingCharacter) return; 

    const { characterId, newLevel, allFormData } = levelSyncDetails;

    if (syncAll) {
      // toast({ title: "Syncing Party Levels...", description: `Updating all characters to Level ${newLevel}.` });
      try {
        await setPartyLevel(newLevel); // Use new context function
        // Update the specific character that triggered this, in case other form data changed
        await updateCharacterInActiveCampaign({ ...editingCharacter, ...allFormData, level: newLevel });
        // toast({ title: "Party Levels Synced!", description: `All characters set to Level ${newLevel}.` });
      } catch (error) {
        console.error("Error syncing party levels:", error);
        // toast({ title: "Error Syncing Levels", description: "Could not update all characters.", variant: "destructive" });
      }
    } else {
      // Only update this character
      await updateCharacterInActiveCampaign({ ...editingCharacter, ...allFormData });
      // toast({ title: "Character Updated", description: `${allFormData.name} has been updated to Level ${newLevel}. Other party members remain unchanged.` });
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

  const handleClassChange = (value: string) => {
    setCharacterFormData((prev) => ({
      ...prev,
      class: value as DndClass,
    }));
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
    setCharacterFormData({...initialCharacterFormState, level: newCharLevel});
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (character: PlayerCharacter) => {
    setEditingCharacter(character);
    setCharacterFormData({
      name: character.name,
      level: character.level,
      class: character.class,
      race: character.race,
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
      // toast({ title: "Character Deleted", description: "The character has been removed from the party." });
    }
  };

  const handleLevelUpPartyButton = async () => {
    if (linkedPartyLevel && activeCampaignParty.length > 0) {
      await incrementPartyLevel();
      // toast({ title: "Party Leveled Up!", description: "All party members have gained a level." });
    } else {
       // toast({ title: "Action Not Allowed", description: "Enable 'Link Party Level' and ensure there are characters in the party.", variant: "destructive" });
    }
  };

  const handleLinkedPartyLevelChange = (newCheckedState: boolean) => {
    if (newCheckedState) { // Trying to turn ON
      if (activeCampaignParty.length > 0) {
        const uniqueLevels = [...new Set(activeCampaignParty.map(c => c.level))];
        if (uniqueLevels.length > 1) {
          setPartyUniqueLevels(uniqueLevels.sort((a,b) => a-b));
          setIsLevelDiscrepancyDialogOpen(true);
          // Do NOT setLinkedPartyLevel(true) yet. Dialog will handle it.
          return; // Exit early, dialog will set linkedPartyLevel
        }
      }
      // No discrepancy, no party members, or party.length === 1
      setLinkedPartyLevel(true);
    } else { // Trying to turn OFF
      setLinkedPartyLevel(false);
    }
  };

  const handleLevelDiscrepancyConfirm = async (selectedLevel: number) => {
    await setPartyLevel(selectedLevel);
    setLinkedPartyLevel(true);
    setIsLevelDiscrepancyDialogOpen(false);
    // toast({ title: "Party Levels Synced", description: `All characters set to Level ${selectedLevel}.` });
  };

  const handleLevelDiscrepancyCancel = () => {
    setLinkedPartyLevel(false); // Ensure switch reflects cancellation
    setIsLevelDiscrepancyDialogOpen(false);
  };


  if (isLoadingCampaigns || isLoadingParty) {
    return <div className="text-center p-10">Loading party data...</div>;
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
              <CardDescription>Level {char.level} {char.race} {char.class}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
               <div className="flex items-center">
                <VenetianMask className="mr-2 h-5 w-5 text-primary" /> 
                <span>Race: {char.race}</span>
              </div>
              <div className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                <span>Armor Class: {char.armorClass}</span>
              </div>
              <div className="flex items-center">
                <Wand className="mr-2 h-5 w-5 text-primary" />
                <span>Class: {char.class}</span>
              </div>
              <div className="flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                <span>Level: {char.level}</span>
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
                <Label htmlFor="race">Race</Label>
                <Input id="race" name="race" value={characterFormData.race} onChange={handleInputChange} placeholder="e.g., Human, Elf, Dwarf" />
              </div>
              <div>
                <Label htmlFor="class">Class</Label>
                <Select name="class" value={characterFormData.class} onValueChange={handleClassChange}>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {DND_CLASSES.map((className) => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
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
                <Label htmlFor="color">Character Color</Label>
                <Select name="color" value={characterFormData.color} onValueChange={handleColorChange}>
                  <SelectTrigger id="color">
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
        <UIDialogContent>
          <UIAlertDialogHeader>
            <UIAlertDialogTitle>Confirm Party Level Sync</UIAlertDialogTitle>
            <AlertDialogDescription>
              Party level is linked. You've changed {editingCharacter?.name}'s level to {levelSyncDetails?.newLevel}.
              Do you want to update all other party members to Level {levelSyncDetails?.newLevel} as well?
            </AlertDialogDescription>
          </UIAlertDialogHeader>
          <UIAlertDialogFooter>
            <Button variant="outline" onClick={() => handleLevelSyncConfirmation(false)}>
              No, only this character
            </Button>
            <Button onClick={() => handleLevelSyncConfirmation(true)}>
              Yes, sync all to Level {levelSyncDetails?.newLevel}
            </Button>
          </UIAlertDialogFooter>
        </UIDialogContent>
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
