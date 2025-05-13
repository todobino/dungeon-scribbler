
"use client";

import type { PlayerCharacter } from "@/lib/types";
import type { DndClass, PredefinedColor } from "@/lib/constants";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, User, Shield, Wand, Users, Trash2, Eye, BookOpen, Library, Edit3, LinkIcon, LinkOffIcon, ArrowUpCircle, Palette } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DND_CLASSES, PREDEFINED_COLORS } from "@/lib/constants";
import { useCampaign, type CharacterFormData } from "@/contexts/campaign-context";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { CharacterDetailsDialog } from "@/components/features/party-manager/character-details-dialog";
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
    levelUpActiveParty
  } = useCampaign();
  const { toast } = useToast();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<PlayerCharacter | null>(null);
  const [currentCharacterDetails, setCurrentCharacterDetails] = useState<PlayerCharacter | null>(null);
  const [linkedPartyLevel, setLinkedPartyLevel] = useState(false);

  const initialCharacterFormState: CharacterFormData = {
    name: "",
    level: 1,
    class: DND_CLASSES[0],
    armorClass: 10,
    color: PREDEFINED_COLORS[0].value,
  };
  const [characterFormData, setCharacterFormData] = useState<CharacterFormData>(initialCharacterFormState);

  const handleFormSubmit = async () => {
    if (characterFormData.name && characterFormData.class && activeCampaign) {
      if (editingCharacter) {
        await updateCharacterInActiveCampaign({ ...editingCharacter, ...characterFormData });
        toast({ title: "Character Updated", description: `${characterFormData.name} has been updated.` });
      } else {
        await addCharacterToActiveCampaign(characterFormData);
        toast({ title: "Character Added", description: `${characterFormData.name} has been added to the party.` });
      }
      setCharacterFormData(initialCharacterFormState);
      setEditingCharacter(null);
      setIsFormDialogOpen(false);
    }
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
    setCharacterFormData(initialCharacterFormState);
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (character: PlayerCharacter) => {
    setEditingCharacter(character);
    setCharacterFormData({
      name: character.name,
      level: character.level,
      class: character.class,
      armorClass: character.armorClass,
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
      toast({ title: "Character Deleted", description: "The character has been removed from the party." });
    }
  };

  const handleLevelUpParty = async () => {
    if (linkedPartyLevel && activeCampaignParty.length > 0) {
      await levelUpActiveParty();
      toast({ title: "Party Leveled Up!", description: "All party members have gained a level." });
    } else {
       toast({ title: "Action Not Allowed", description: "Enable 'Link Party Level' and ensure there are characters in the party.", variant: "destructive" });
    }
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Party Manager</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center space-x-2 p-2 border rounded-md bg-card w-full sm:w-auto justify-between">
            <Label htmlFor="link-level-switch" className="flex items-center gap-1 cursor-pointer">
              {linkedPartyLevel ? <LinkIcon className="h-4 w-4" /> : <LinkOffIcon className="h-4 w-4" />}
              Link Party Level
            </Label>
            <Switch
              id="link-level-switch"
              checked={linkedPartyLevel}
              onCheckedChange={setLinkedPartyLevel}
            />
          </div>
           <Button 
            onClick={handleLevelUpParty} 
            disabled={!linkedPartyLevel || activeCampaignParty.length === 0}
            className="w-full sm:w-auto"
          >
            <ArrowUpCircle className="mr-2 h-5 w-5" /> Level Up Party (+1)
          </Button>
          <Button onClick={openAddDialog} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Character
          </Button>
        </div>
      </div>

      {activeCampaignParty.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <Users className="mx-auto h-16 w-16 text-muted-foreground" />
            <CardTitle className="mt-4">No Characters Yet in {activeCampaign.name}</CardTitle>
            <CardDescription>Start by adding your first player character to the party for this campaign.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Character
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <CardDescription>Level {char.level} {char.class}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
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
        </div>
      )}

      {/* Add/Edit Character Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingCharacter(null); 
            setCharacterFormData(initialCharacterFormState);
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
                <Input id="level" name="level" type="number" value={characterFormData.level} onChange={handleInputChange} min="1" />
              </div>
              <div>
                <Label htmlFor="armorClass">Armor Class</Label>
                <Input id="armorClass" name="armorClass" type="number" value={characterFormData.armorClass} onChange={handleInputChange} />
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
            <Button variant="outline" onClick={() => { setIsFormDialogOpen(false); setEditingCharacter(null); setCharacterFormData(initialCharacterFormState);}}>Cancel</Button>
            <Button onClick={handleFormSubmit} disabled={!characterFormData.name.trim()}>{editingCharacter ? "Save Changes" : "Add Character"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Character Details Dialog */}
      <CharacterDetailsDialog 
        character={currentCharacterDetails}
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
    </div>
  );
}
