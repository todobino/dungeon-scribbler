
"use client";

import type { PlayerCharacter, ApiListItem } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader as UIAlertDialogHeader, AlertDialogTitle as UIAlertDialogTitle, AlertDialogFooter as UIAlertDialogFooter } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, User, Shield, Users, Trash2, Eye, BookOpen, Library, Edit3, LinkIcon, Link2OffIcon, ArrowUpCircle, Palette, ChevronsRight, Loader2, VenetianMask, Image as ImageIcon, UploadCloud } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PREDEFINED_COLORS, DND5E_API_BASE_URL } from "@/lib/constants";
import { DND_CLASS_DETAILS } from "@/lib/data/class-data";
import { useCampaign, type CharacterFormData } from "@/contexts/campaign-context";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { CharacterDetailsDialog } from "@/components/features/party-manager/character-details-dialog";
import { LevelDiscrepancyDialog } from "@/components/features/party-manager/level-discrepancy-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import { generateCharacterPortrait, type CharacterPortraitInput } from "@/ai/flows/character-portrait-generator";


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

  const [apiRaces, setApiRaces] = useState<ApiListItem[]>([]);
  const [isLoadingApiRaces, setIsLoadingApiRaces] = useState(false);
  const [apiSubclasses, setApiSubclasses] = useState<ApiListItem[]>([]);
  const [isLoadingApiSubclasses, setIsLoadingApiSubclasses] = useState(false);

  const [characterToDelete, setCharacterToDelete] = useState<PlayerCharacter | null>(null);
  const [isDeleteCharacterConfirm1Open, setIsDeleteCharacterConfirm1Open] = useState(false);
  const [isDeleteCharacterConfirm2Open, setIsDeleteCharacterConfirm2Open] = useState(false);
  const [deleteCharacterConfirmInput, setDeleteCharacterConfirmInput] = useState("");

  // State for AI Portrait Generation
  const [isGeneratingPortrait, setIsGeneratingPortrait] = useState(false);
  const [portraitGenerationCharacter, setPortraitGenerationCharacter] = useState<PlayerCharacter | null>(null);
  const [isPortraitPromptDialogOpen, setIsPortraitPromptDialogOpen] = useState(false);
  const [portraitPromptDetails, setPortraitPromptDetails] = useState<{ appearance: string; artStyle: string }>({
    appearance: "",
    artStyle: "fantasy oil painting",
  });


  const initialCharacterFormState: CharacterFormData = {
    name: "",
    level: 1,
    class: DND_CLASS_DETAILS[0]?.class || "",
    race: "",
    customRaceInput: "",
    subclass: "",
    armorClass: 10,
    initiativeModifier: 0,
    color: PREDEFINED_COLORS[0].value,
    imageUrl: "",
  };
  const [characterFormData, setCharacterFormData] = useState<CharacterFormData>(initialCharacterFormState);

  useEffect(() => {
    if (isFormDialogOpen && !isLoadingApiRaces && (apiRaces.length === 0 || !apiRaces.find(r => r.index === 'other'))) {
      const fetchRaces = async () => {
        setIsLoadingApiRaces(true);
        try {
          const response = await fetch(`${DND5E_API_BASE_URL}/api/races`);
          if (!response.ok) throw new Error("Failed to fetch races");
          const data = await response.json();
          const standardRaces = data.results || [];
          setApiRaces([{ index: 'other', name: 'Other', url: '' }, ...standardRaces]);
        } catch (error) {
          console.error("Error fetching races:", error);
          toast({ title: "Error", description: "Could not fetch races from D&D API.", variant: "destructive" });
          if (apiRaces.length === 0) setApiRaces([{ index: 'other', name: 'Other', url: '' }]);
        }
        setIsLoadingApiRaces(false);
      };
      fetchRaces();
    }
  }, [isFormDialogOpen, apiRaces, isLoadingApiRaces, toast]);

  useEffect(() => {
    if (isFormDialogOpen && characterFormData.class) {
      const selectedClassDetail = DND_CLASS_DETAILS.find(cd => cd.class === characterFormData.class);
      if (selectedClassDetail && selectedClassDetail.subclasses && selectedClassDetail.subclasses.length > 0) {
        setApiSubclasses(selectedClassDetail.subclasses.map(sc => ({index: sc.name.toLowerCase().replace(/\s+/g, '-'), name: sc.name, url: ''})));
      } else {
        setApiSubclasses([]);
      }
       setCharacterFormData(prev => ({...prev, subclass: ""})); 
    } else if (isFormDialogOpen) {
      setApiSubclasses([]);
       setCharacterFormData(prev => ({...prev, subclass: ""})); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormDialogOpen, characterFormData.class]);


  const handleFormSubmit = async () => {
    if (characterFormData.name?.trim() && characterFormData.class && characterFormData.race?.trim() && activeCampaign) {
      let finalRace = characterFormData.race;
      if (characterFormData.race === "Other") {
        finalRace = characterFormData.customRaceInput?.trim() || "Unknown Custom Race";
      }
      
      const dataToSave: PlayerCharacter = { // Construct as PlayerCharacter for saving
        id: editingCharacter ? editingCharacter.id : Date.now().toString(), // Ensure ID is handled
        name: characterFormData.name.trim(),
        level: characterFormData.level,
        class: characterFormData.class,
        race: finalRace,
        subclass: characterFormData.subclass?.trim() || "",
        armorClass: characterFormData.armorClass,
        initiativeModifier: characterFormData.initiativeModifier || 0,
        color: characterFormData.color || PREDEFINED_COLORS[0].value,
        imageUrl: characterFormData.imageUrl?.trim() || "",
      };


      if (editingCharacter) {
        const originalLevel = editingCharacter.level;
        const newLevel = dataToSave.level;

        if (linkedPartyLevel && newLevel !== originalLevel && activeCampaignParty.length > 1) {
           // Pass the fully constructed PlayerCharacter for update context
          setLevelSyncDetails({
            characterId: editingCharacter.id,
            newLevel: newLevel,
            allFormData: characterFormData // Pass original form data for re-evaluation if needed
          });
          setIsLevelSyncDialogOpen(true);
          return;
        } else {
          await updateCharacterInActiveCampaign(dataToSave);
        }
      } else {
        let dataToAdd: CharacterFormData = { ...characterFormData, race: finalRace };
        if (linkedPartyLevel && activeCampaignParty.length > 0) {
          dataToAdd.level = activeCampaignParty[0].level;
        }
        await addCharacterToActiveCampaign(dataToAdd);
      }
      setCharacterFormData(initialCharacterFormState);
      setEditingCharacter(null);
      setIsFormDialogOpen(false);
    }
  };

  const handleLevelSyncConfirmation = async (syncAll: boolean) => {
    if (!levelSyncDetails || !editingCharacter) return;

    const { newLevel, allFormData } = levelSyncDetails;
    let finalRace = allFormData.race;
    if (allFormData.race === "Other") {
        finalRace = allFormData.customRaceInput?.trim() || "Unknown Custom Race";
    }
    const characterToUpdate: PlayerCharacter = {
      ...editingCharacter,
      ...allFormData,
      race: finalRace,
      level: newLevel // Ensure the new level is applied here
    };


    if (syncAll) {
      try {
        await setPartyLevel(newLevel);
        // Update the current character explicitly as setPartyLevel might not trigger re-render of this specific char's details in time
        await updateCharacterInActiveCampaign(characterToUpdate); 
      } catch (error) {
        console.error("Error syncing party levels:", error);
      }
    } else {
      await updateCharacterInActiveCampaign(characterToUpdate);
    }

    setIsLevelSyncDialogOpen(false);
    setLevelSyncDetails(null);
    setCharacterFormData(initialCharacterFormState);
    setEditingCharacter(null);
    setIsFormDialogOpen(false);
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if(type === 'textarea' || e.target instanceof HTMLTextAreaElement) {
      setPortraitPromptDetails(prev => ({...prev, [name]: value}))
    } else {
      setCharacterFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) || 0 : value,
      }));
    }
  };

  const handleSelectChange = (name: keyof CharacterFormData, value: string) => {
     setCharacterFormData((prev) => {
      let newState = { ...prev, [name]: value };
      if (name === "class") {
        newState.subclass = "";
      }
      if (name === "race" && value !== "Other") {
        newState.customRaceInput = "";
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
    if (activeCampaign?.defaultStartingLevel && activeCampaign.defaultStartingLevel > 0) {
      newCharLevel = activeCampaign.defaultStartingLevel;
    }
    if (linkedPartyLevel && activeCampaignParty.length > 0) {
      newCharLevel = activeCampaignParty[0].level;
    }
    setCharacterFormData({...initialCharacterFormState, level: newCharLevel, race: "", class: DND_CLASS_DETAILS[0]?.class || "", subclass: "", imageUrl: "", customRaceInput: ""});
    setIsFormDialogOpen(true);
  };

  const openEditDialog = async (character: PlayerCharacter) => {
    setEditingCharacter(character);
    
    let raceValue = character.race;
    let customRaceValue = "";
    const standardRaceExists = apiRaces.length > 1 && apiRaces.slice(1).some(r => r.name === character.race);

    if (!standardRaceExists && character.race) { // apiRaces[0] is "Other"
        raceValue = "Other";
        customRaceValue = character.race;
    }

    setCharacterFormData({
      name: character.name,
      level: character.level,
      class: character.class,
      race: raceValue,
      customRaceInput: customRaceValue,
      subclass: character.subclass || "",
      armorClass: character.armorClass,
      initiativeModifier: character.initiativeModifier || 0,
      color: character.color || PREDEFINED_COLORS[0].value,
      imageUrl: character.imageUrl || "",
    });
    
    setIsFormDialogOpen(true);
  };

  const openDetailsDialog = (character: PlayerCharacter) => {
    setCurrentCharacterDetails(character);
    setIsDetailsDialogOpen(true);
  };

  const handleOpenDeleteCharacterDialog1 = (character: PlayerCharacter) => {
    setCharacterToDelete(character);
    setIsDeleteCharacterConfirm1Open(true);
  };

  const handleConfirmCharacterDelete1 = () => {
    setIsDeleteCharacterConfirm1Open(false);
    setIsDeleteCharacterConfirm2Open(true);
    setDeleteCharacterConfirmInput("");
  };

  const handleFinalCharacterDelete = async () => {
    if (characterToDelete && deleteCharacterConfirmInput === "DELETE") {
      try {
        await deleteCharacterFromActiveCampaign(characterToDelete.id);
        toast({ title: "Character Deleted", description: `"${characterToDelete.name}" has been removed from the party.` });
      } catch (error) {
        console.error("Error deleting character:", error);
        toast({ title: "Error Deleting Character", description: "Could not remove the character.", variant: "destructive" });
      }
    } else if (deleteCharacterConfirmInput !== "DELETE") {
      toast({ title: "Incorrect Confirmation", description: "Please type DELETE to confirm.", variant: "destructive" });
      return;
    }
    setIsDeleteCharacterConfirm2Open(false);
    setCharacterToDelete(null);
    setDeleteCharacterConfirmInput("");
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

  const handleOpenPortraitPromptDialog = (character: PlayerCharacter) => {
    setPortraitGenerationCharacter(character);
    setPortraitPromptDetails({ appearance: "", artStyle: "fantasy oil painting" }); // Reset prompts
    setIsPortraitPromptDialogOpen(true);
  };

  const handleGeneratePortrait = async () => {
    if (!portraitGenerationCharacter) return;

    setIsGeneratingPortrait(true);
    try {
      const input: CharacterPortraitInput = {
        characterName: portraitGenerationCharacter.name,
        characterRace: portraitGenerationCharacter.race,
        characterClass: portraitGenerationCharacter.class,
        appearanceDescription: portraitPromptDetails.appearance,
        artStyle: portraitPromptDetails.artStyle,
      };
      const result = await generateCharacterPortrait(input);
      if (result.generatedImageDataUri) {
        await updateCharacterInActiveCampaign({
          ...portraitGenerationCharacter,
          imageUrl: result.generatedImageDataUri,
        });
        toast({ title: "Portrait Generated!", description: `New portrait for ${portraitGenerationCharacter.name} is set.` });
      } else {
        throw new Error("AI did not return an image.");
      }
    } catch (error: any) {
      console.error("Error generating character portrait:", error);
      toast({ title: "Portrait Generation Failed", description: error.message || "Could not generate portrait.", variant: "destructive" });
    }
    setIsGeneratingPortrait(false);
    setIsPortraitPromptDialogOpen(false);
    setPortraitGenerationCharacter(null);
  };


  if (isLoadingCampaigns || isLoadingParty) {
    return <div className="text-center p-10"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2"/>Loading party data...</div>;
  }

  if (!activeCampaign) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
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
      </div>
    );
  }

  const isAddingNewCharacter = !editingCharacter;
  const isLevelInputDisabled = linkedPartyLevel && isAddingNewCharacter && activeCampaignParty.length > 0;


  return (
    <div className="space-y-6 w-full p-4 sm:p-6 lg:p-8">
       <h1>Party Manager</h1>
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
            className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col rounded-lg overflow-hidden"
            style={{ borderTop: `6px solid ${char.color || 'hsl(var(--border))'}` }}
          >
            <CardContent className="p-0 flex flex-col flex-grow">
                <div className="aspect-[3/4] w-full bg-muted/50 relative overflow-hidden flex items-center justify-center">
                    {char.imageUrl ? (
                        <NextImage src={char.imageUrl} alt={char.name} layout="fill" objectFit="cover" />
                    ) : (
                        <NextImage src="https://placehold.co/300x400.png" alt="Character Placeholder" layout="fill" objectFit="cover" data-ai-hint="character portrait fantasy" />
                    )}
                     <div className="absolute bottom-2 right-2 flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm" onClick={() => toast({ title: "Image Upload Coming Soon!" })}>
                            <UploadCloud className="h-4 w-4" />
                        </Button>
                         <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm" onClick={() => handleOpenPortraitPromptDialog(char)}>
                            <Palette className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="p-4 flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl font-bold">{char.name}</CardTitle>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive -mt-1 -mr-1" onClick={() => handleOpenDeleteCharacterDialog1(char)}>
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground mb-3">
                        Level {char.level} {char.race} {char.class}{char.subclass ? ` (${char.subclass})` : ""}
                    </CardDescription>
                    <div className="space-y-1.5 text-xs">
                        <div className="flex items-center"><Shield className="mr-2 h-4 w-4 text-primary/70" /><span>AC: {char.armorClass}</span></div>
                        <div className="flex items-center"><ChevronsRight className="mr-2 h-4 w-4 text-primary/70" /><span>Initiative: {char.initiativeModifier !== undefined ? (char.initiativeModifier >= 0 ? `+${char.initiativeModifier}` : char.initiativeModifier) : '+0'}</span></div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex gap-2 border-t p-3">
              <Button variant="outline" className="flex-1 text-sm" onClick={() => openDetailsDialog(char)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>
              <Button variant="secondary" className="flex-1 text-sm" onClick={() => openEditDialog(char)}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
        {activeCampaignParty.length < 6 && (
          <Card
            className="col-span-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted hover:border-primary hover:bg-muted/50 transition-colors duration-200 cursor-pointer group min-h-[320px] rounded-lg"
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
        )}
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
                 {characterFormData.race === "Other" && (
                  <div className="mt-2">
                    <Label htmlFor="customRaceInput">Specify Race</Label>
                    <Input
                      id="customRaceInput"
                      name="customRaceInput"
                      value={characterFormData.customRaceInput || ""}
                      onChange={handleInputChange}
                      placeholder="Enter custom race name"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div>
                <Label htmlFor="subclass-select">Subclass</Label>
                <Select
                  name="subclass"
                  value={characterFormData.subclass || ""}
                  onValueChange={(value) => handleSelectChange("subclass", value || "")}
                  disabled={!characterFormData.class || (DND_CLASS_DETAILS.find(cd => cd.class === characterFormData.class)?.subclasses || []).length === 0 || isLoadingApiSubclasses}
                >
                  <SelectTrigger id="subclass-select">
                  <SelectValue placeholder={
                      isLoadingApiSubclasses ? "Loading subclasses..." :
                      !characterFormData.class ? "Select class first" :
                      (DND_CLASS_DETAILS.find(cd => cd.class === characterFormData.class)?.subclasses || []).length === 0 ? "No subclasses available" :
                      "Select a subclass (Optional)"
                  }/>
                  </SelectTrigger>
                  <SelectContent key={characterFormData.class || 'no-class-selected'}>
                    {isLoadingApiSubclasses && <SelectItem value="loading-subclasses" disabled>Loading...</SelectItem>}
                    {!isLoadingApiSubclasses && (DND_CLASS_DETAILS.find(cd => cd.class === characterFormData.class)?.subclasses || []).length === 0 && characterFormData.class ? (
                        <SelectItem value="none" disabled>No subclasses for {characterFormData.class}</SelectItem>
                    ) : (
                      (DND_CLASS_DETAILS.find(cd => cd.class === characterFormData.class)?.subclasses || []).map((subclass) => (
                        <SelectItem key={subclass.name} value={subclass.name}>
                          {subclass.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="armorClass">Armor Class</Label>
                  <Input id="armorClass" name="armorClass" type="number" value={characterFormData.armorClass.toString()} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="initiativeModifier">Initiative Modifier</Label>
                  <Input id="initiativeModifier" name="initiativeModifier" type="number" value={(characterFormData.initiativeModifier || 0).toString()} onChange={handleInputChange} placeholder="e.g., 2" />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input id="imageUrl" name="imageUrl" value={characterFormData.imageUrl || ""} onChange={handleInputChange} placeholder="https://example.com/image.png" />
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
              disabled={!characterFormData.name?.trim() || !characterFormData.race?.trim() || (characterFormData.race === "Other" && !characterFormData.customRaceInput?.trim())}
            >
              {editingCharacter ? "Save Changes" : "Add Character"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Portrait Generation Prompt Dialog */}
      <Dialog open={isPortraitPromptDialogOpen} onOpenChange={setIsPortraitPromptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate AI Portrait for {portraitGenerationCharacter?.name}</DialogTitle>
            <DialogDescription>
              Provide details to guide the AI. The character's name, race, and class will be automatically included in the prompt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="appearanceDescription">Appearance Description</Label>
              <Textarea
                id="appearanceDescription"
                name="appearance"
                value={portraitPromptDetails.appearance}
                onChange={handleInputChange}
                placeholder="e.g., battle-scarred veteran with a grim expression, wearing dark, practical leather armor, short-cropped grey hair, a prominent scar over their left eye."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="artStyle">Art Style</Label>
              <Input
                id="artStyle"
                name="artStyle"
                value={portraitPromptDetails.artStyle}
                onChange={handleInputChange}
                placeholder="e.g., fantasy oil painting, photorealistic, anime sketch, pixel art"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPortraitPromptDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleGeneratePortrait} disabled={isGeneratingPortrait || !portraitPromptDetails.appearance.trim()}>
              {isGeneratingPortrait ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Palette className="mr-2 h-4 w-4" />}
              {isGeneratingPortrait ? "Generating..." : "Generate Portrait"}
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
        </AlertDialogContent>
      </AlertDialog>

      <LevelDiscrepancyDialog
        isOpen={isLevelDiscrepancyDialogOpen}
        onOpenChange={setIsLevelDiscrepancyDialogOpen}
        partyLevels={partyUniqueLevels}
        onConfirmSync={handleLevelDiscrepancyConfirm}
        onCancel={handleLevelDiscrepancyCancel}
      />

      {/* Delete Character Confirmation Dialog 1 */}
      <AlertDialog open={isDeleteCharacterConfirm1Open} onOpenChange={setIsDeleteCharacterConfirm1Open}>
        <AlertDialogContent>
          <UIAlertDialogHeader>
            <UIAlertDialogTitle>Delete Character "{characterToDelete?.name}"?</UIAlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this character from the party.
            </AlertDialogDescription>
          </UIAlertDialogHeader>
          <UIAlertDialogFooter>
            <AlertDialogCancel onClick={() => { setIsDeleteCharacterConfirm1Open(false); setCharacterToDelete(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCharacterDelete1}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              Delete
            </AlertDialogAction>
          </UIAlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Character Confirmation Dialog 2 (Type DELETE) */}
      <Dialog open={isDeleteCharacterConfirm2Open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setCharacterToDelete(null);
          setDeleteCharacterConfirmInput("");
        }
        setIsDeleteCharacterConfirm2Open(isOpen);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion of "{characterToDelete?.name}"</DialogTitle>
            <DialogDescription>
              To permanently delete this character, please type "DELETE" in the box below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={deleteCharacterConfirmInput}
              onChange={(e) => setDeleteCharacterConfirmInput(e.target.value)}
              placeholder="DELETE"
              className="border-destructive focus-visible:ring-destructive"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDeleteCharacterConfirm2Open(false); setCharacterToDelete(null); setDeleteCharacterConfirmInput(""); }}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleFinalCharacterDelete}
              disabled={deleteCharacterConfirmInput !== "DELETE"}
            >
              Confirm Permanent Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

