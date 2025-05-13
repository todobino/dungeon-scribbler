
"use client";

import type { PlayerCharacter } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Users, VenetianMask, ChevronsRight, Shield } from "lucide-react"; 

// Mock SRD data
const mockAbilities: Record<string, Record<number, string[]>> = {
  Fighter: { 1: ["Second Wind", "Fighting Style"], 2: ["Action Surge"], 3: ["Martial Archetype"]},
  Wizard: { 1: ["Spellcasting", "Arcane Recovery"], 2: ["Arcane Tradition"], 3: ["Cantrip Formulas"]},
  Rogue: { 1: ["Expertise", "Sneak Attack", "Thieves' Cant"], 2: ["Cunning Action"], 3: ["Roguish Archetype"]},
  Cleric: { 1: ["Spellcasting", "Divine Domain"], 2: ["Channel Divinity"], 3: ["Divine Domain feature"]},
  Bard: { 1: ["Spellcasting", "Bardic Inspiration"], 2: ["Jack of All Trades", "Song of Rest"], 3: ["Bard College"]},
  Artificer: { 1: ["Magical Tinkering", "Spellcasting"], 2: ["Infuse Item"], 3: ["Artificer Specialist"] },
  Barbarian: { 1: ["Rage", "Unarmored Defense"], 2: ["Reckless Attack", "Danger Sense"], 3: ["Primal Path"] },
  Druid: { 1: ["Druidic", "Spellcasting"], 2: ["Wild Shape", "Druid Circle"], 3: ["Druid Circle feature"] },
  Monk: { 1: ["Unarmored Defense", "Martial Arts"], 2: ["Ki", "Unarmored Movement"], 3: ["Monastic Tradition"] },
  Paladin: { 1: ["Divine Sense", "Lay on Hands"], 2: ["Fighting Style", "Spellcasting", "Divine Smite"], 3: ["Divine Health", "Sacred Oath"] },
  Ranger: { 1: ["Favored Enemy", "Natural Explorer"], 2: ["Fighting Style", "Spellcasting"], 3: ["Ranger Archetype", "Primeval Awareness"] },
  Sorcerer: { 1: ["Spellcasting", "Sorcerous Origin"], 2: ["Font of Magic"], 3: ["Metamagic"] },
  Warlock: { 1: ["Otherworldly Patron", "Pact Magic"], 2: ["Eldritch Invocations"], 3: ["Pact Boon"] },
};

// Ensure keys are capitalized to match potential input
const mockRacialTraits: Record<string, string[]> = {
  Human: ["Versatile", "Skilled"], 
  Elf: ["Darkvision", "Fey Ancestry", "Trance"], 
  Dwarf: ["Darkvision", "Dwarven Resilience", "Stonecunning"],
  Dragonborn: ["Draconic Ancestry", "Breath Weapon", "Damage Resistance"],
  Gnome: ["Darkvision", "Gnome Cunning"],
  "Half-Elf": ["Darkvision", "Fey Ancestry", "Skill Versatility"], // Key with hyphen
  "Half Elf": ["Darkvision", "Fey Ancestry", "Skill Versatility"], // Key with space
  Halfling: ["Lucky", "Brave", "Halfling Nimbleness"],
  "Half-Orc": ["Darkvision", "Menacing", "Relentless Endurance", "Savage Attacks"], // Key with hyphen
  "Half Orc": ["Darkvision", "Menacing", "Relentless Endurance", "Savage Attacks"], // Key with space
  Tiefling: ["Darkvision", "Hellish Resistance", "Infernal Legacy"],
  Orc: ["Darkvision", "Powerful Build", "Aggressive"], // Added Orc
  Goblin: ["Darkvision", "Fury of the Small", "Nimble Escape"], // Added Goblin
};


interface CharacterDetailsDialogProps {
  character: PlayerCharacter | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function CharacterDetailsDialog({ character, isOpen, onOpenChange }: CharacterDetailsDialogProps) {
  if (!character) return null;

  const abilities = mockAbilities[character.class]?.[character.level] || [];
  
  let raceKey = "";
  let racialTraits: string[] = [];
  let displayRace = character.race || "Unknown Race";

  if (character.race && typeof character.race === 'string' && character.race.length > 0) {
    raceKey = character.race.charAt(0).toUpperCase() + character.race.slice(1);
    racialTraits = mockRacialTraits[raceKey] || mockRacialTraits[character.race] || [];
    displayRace = character.race;
  }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{character.name}</DialogTitle>
          <DialogDescription>
            Level {character.level} {displayRace} {character.class}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
          <div className="space-y-6 py-4 pr-4">
            <div>
              <h3 className="font-semibold text-lg mb-2 text-primary flex items-center">
                 {/* Using Shield as a generic stats icon */}
                <Shield className="mr-2 h-5 w-5" /> 
                Core Stats
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Armor Class: {character.armorClass}</li>
                <li>Initiative Modifier: {character.initiativeModifier !== undefined ? (character.initiativeModifier >= 0 ? `+${character.initiativeModifier}` : character.initiativeModifier) : '+0'}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-primary flex items-center">
                <VenetianMask className="mr-2 h-5 w-5" /> 
                Racial Traits ({displayRace})
              </h3>
              {racialTraits.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 pl-2">
                  {racialTraits.map((trait, index) => (
                    <li key={`trait-${index}`}>{trait}</li>
                  ))}
                </ul>
              ) : <p className="text-muted-foreground italic">No specific racial traits listed for {displayRace}.</p>}
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-primary flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Class Abilities (Level {character.level})
              </h3>
              {abilities.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 pl-2">
                  {abilities.map((ability, index) => (
                    <li key={`ability-${index}`}>{ability}</li>
                  ))}
                </ul>
              ) : <p className="text-muted-foreground italic">No class abilities listed for this class/level.</p>}
            </div>
             <p className="text-xs text-muted-foreground pt-4">
              Note: Abilities and traits are based on D&D 5e SRD information and may vary. This is a simplified representation.
            </p>
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
