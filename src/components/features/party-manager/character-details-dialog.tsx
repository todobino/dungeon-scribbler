
"use client";

import type { PlayerCharacter, ClassDetail, LevelBasedFeature, ClassFeatureDetail } from "@/lib/types";
import { DND_CLASS_DETAILS } from "@/lib/data/class-data"; 
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Shield, Users, VenetianMask } from "lucide-react"; 

interface CharacterDetailsDialogProps {
  character: PlayerCharacter | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function CharacterDetailsDialog({ character, isOpen, onOpenChange }: CharacterDetailsDialogProps) {
  if (!character) return null;

  const classDetail = DND_CLASS_DETAILS.find(cd => cd.class === character.class);
  const subclassDetail = classDetail?.subclasses.find(sc => sc.name === character.subclass);

  const getCumulativeFeatures = (
    levelBasedFeatures: LevelBasedFeature[] | undefined, 
    currentLevel: number
  ): ClassFeatureDetail[] => {
    if (!levelBasedFeatures) return [];
    const gained: ClassFeatureDetail[] = [];
    levelBasedFeatures.forEach(levelFeature => {
      if (levelFeature.level <= currentLevel) {
        // Ensure features array exists and is an array before spreading
        if (levelFeature.features && Array.isArray(levelFeature.features)) {
          gained.push(...levelFeature.features);
        }
      }
    });
    return gained;
  };

  const baseClassFeatures = getCumulativeFeatures(classDetail?.base_class_features, character.level);
  const subclassFeatures = getCumulativeFeatures(subclassDetail?.features, character.level);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{character.name}</DialogTitle>
          <DialogDescription>
            Level {character.level} {character.race} {character.class} {character.subclass ? `(${character.subclass})` : ''}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
          <div className="space-y-6 py-4 pr-4">
            
            <div>
              <h3 className="font-semibold text-lg mb-2 text-primary flex items-center">
                <Shield className="mr-2 h-5 w-5" /> 
                Core Stats & Proficiencies
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-2 text-sm">
                <li>Armor Class: {character.armorClass}</li>
                <li>Initiative Modifier: {character.initiativeModifier !== undefined ? (character.initiativeModifier >= 0 ? `+${character.initiativeModifier}` : character.initiativeModifier) : '+0'}</li>
                {classDetail && <li>Hit Die: {classDetail.hit_die}</li>}
                {classDetail && classDetail.saving_throws.length > 0 && <li>Saving Throws: {classDetail.saving_throws.join(", ")}</li>}
                {classDetail && classDetail.armor_proficiencies.length > 0 && <li>Armor Proficiencies: {classDetail.armor_proficiencies.join(", ")}</li>}
                {classDetail && classDetail.weapon_proficiencies.length > 0 && <li>Weapon Proficiencies: {classDetail.weapon_proficiencies.join(", ")}</li>}
                {classDetail && classDetail.tools.length > 0 && <li>Tool Proficiencies: {classDetail.tools.join(", ")}</li>}
              </ul>
            </div>
            
            {baseClassFeatures.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2 text-primary flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Base Class Features (up to Level {character.level})
                </h3>
                <ul className="space-y-3 pl-2">
                  {baseClassFeatures.map((feature, index) => (
                    <li key={`base-feat-${index}`}>
                      <strong className="font-medium">{feature.name}:</strong>
                      <p className="text-sm text-muted-foreground ml-2 whitespace-pre-wrap">{feature.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {subclassDetail && subclassFeatures.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2 text-primary flex items-center">
                  <Users className="mr-2 h-5 w-5" /> 
                  {subclassDetail.name} Features (up to Level {character.level})
                </h3>
                <ul className="space-y-3 pl-2">
                  {subclassFeatures.map((feature, index) => (
                    <li key={`subclass-feat-${index}`}>
                      <strong className="font-medium">{feature.name}:</strong>
                      <p className="text-sm text-muted-foreground ml-2 whitespace-pre-wrap">{feature.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
             <p className="text-xs text-muted-foreground pt-4">
              Note: Features shown are based on the character's current level and provided class data. This is a simplified representation.
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

