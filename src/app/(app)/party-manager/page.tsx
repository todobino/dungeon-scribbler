"use client";

import type { PlayerCharacter } from "@/lib/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, User, Shield, Wand, Users, Edit3, Trash2, Eye, BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Mock SRD data - in a real app, this would come from a database or API
const mockAbilities: Record<string, Record<number, string[]>> = {
  Fighter: {
    1: ["Second Wind", "Fighting Style"],
    2: ["Action Surge"],
    3: ["Martial Archetype"],
  },
  Wizard: {
    1: ["Spellcasting", "Arcane Recovery"],
    2: ["Arcane Tradition"],
    3: ["Cantrip Formulas"],
  },
  Rogue: {
    1: ["Expertise", "Sneak Attack", "Thieves' Cant"],
    2: ["Cunning Action"],
    3: ["Roguish Archetype"],
  },
};

const mockRacialTraits: Record<string, string[]> = {
  Human: ["Versatile", "Skilled"],
  Elf: ["Darkvision", "Fey Ancestry", "Trance"],
  Dwarf: ["Darkvision", "Dwarven Resilience", "Stonecunning"],
};


export default function PartyManagerPage() {
  const [characters, setCharacters] = useState<PlayerCharacter[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [currentCharacterDetails, setCurrentCharacterDetails] = useState<PlayerCharacter | null>(null);

  const [newCharacter, setNewCharacter] = useState({
    name: "",
    level: 1,
    class: "Fighter",
    armorClass: 10,
  });

  const handleAddCharacter = () => {
    if (newCharacter.name && newCharacter.class) {
      const characterToAdd: PlayerCharacter = {
        id: Date.now().toString(), // simple unique id
        ...newCharacter,
      };
      setCharacters([...characters, characterToAdd]);
      setNewCharacter({ name: "", level: 1, class: "Fighter", armorClass: 10 });
      setIsAddDialogOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setNewCharacter({
      ...newCharacter,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    });
  };

  const openDetailsDialog = (character: PlayerCharacter) => {
    const abilities = mockAbilities[character.class]?.[character.level] || ["No specific abilities listed for this level."];
    const racialTraits = mockRacialTraits[character.race || "Human"] || ["No specific racial traits listed."]; // Assuming Human if race not specified
    setCurrentCharacterDetails({...character, abilities, racialTraits});
    setIsDetailsDialogOpen(true);
  };
  
  // Effect to load characters from local storage (example of client-side persistence)
  useEffect(() => {
    const storedCharacters = localStorage.getItem("dungeonScribblerCharacters");
    if (storedCharacters) {
      setCharacters(JSON.parse(storedCharacters));
    }
  }, []);

  // Effect to save characters to local storage
  useEffect(() => {
    localStorage.setItem("dungeonScribblerCharacters", JSON.stringify(characters));
  }, [characters]);

  const handleDeleteCharacter = (id: string) => {
    setCharacters(characters.filter(char => char.id !== id));
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Party Manager</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add Character
          </Button>
        </div>

        {characters.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <Users className="mx-auto h-16 w-16 text-muted-foreground" />
              <CardTitle className="mt-4">No Characters Yet</CardTitle>
              <CardDescription>Start by adding your first player character to the party.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Character
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char) => (
              <Card key={char.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-2xl">{char.name}</CardTitle>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteCharacter(char.id)}>
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
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => openDetailsDialog(char)}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Add Character Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Character</DialogTitle>
              <DialogDescription>Fill in the details for the new player character.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={newCharacter.name} onChange={handleInputChange} placeholder="e.g., Elara Meadowlight" />
              </div>
              <div>
                <Label htmlFor="class">Class</Label>
                <Input id="class" name="class" value={newCharacter.class} onChange={handleInputChange} placeholder="e.g., Fighter, Wizard" />
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Input id="level" name="level" type="number" value={newCharacter.level} onChange={handleInputChange} min="1" />
              </div>
              <div>
                <Label htmlFor="armorClass">Armor Class</Label>
                <Input id="armorClass" name="armorClass" type="number" value={newCharacter.armorClass} onChange={handleInputChange} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddCharacter}>Add Character</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Character Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{currentCharacterDetails?.name}</DialogTitle>
              <DialogDescription>Level {currentCharacterDetails?.level} {currentCharacterDetails?.class} {currentCharacterDetails?.race && `(${currentCharacterDetails.race})`}</DialogDescription>
            </DialogHeader>
            {currentCharacterDetails && (
              <ScrollArea className="max-h-[60vh] p-1">
                <div className="space-y-6 py-4 pr-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-primary flex items-center"><BookOpen className="mr-2 h-5 w-5" />Class Abilities (Level {currentCharacterDetails.level})</h3>
                    {currentCharacterDetails.abilities && currentCharacterDetails.abilities.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 pl-2">
                        {currentCharacterDetails.abilities.map((ability, index) => (
                          <li key={`ability-${index}`}>{ability}</li>
                        ))}
                      </ul>
                    ) : <p className="text-muted-foreground italic">No class abilities listed.</p>}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-primary flex items-center"><Users className="mr-2 h-5 w-5" />Racial Traits</h3>
                     {currentCharacterDetails.racialTraits && currentCharacterDetails.racialTraits.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 pl-2">
                        {currentCharacterDetails.racialTraits.map((trait, index) => (
                          <li key={`trait-${index}`}>{trait}</li>
                        ))}
                      </ul>
                    ): <p className="text-muted-foreground italic">No racial traits listed.</p>}
                  </div>
                  <p className="text-xs text-muted-foreground pt-4">
                    Note: Abilities and traits are based on D&D 5e SRD information and may vary. This is a simplified representation.
                  </p>
                </div>
              </ScrollArea>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
