
"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Dice5, UserPlus, Users } from "lucide-react";
import type { PlayerCharacter, Combatant } from "@/lib/types";
import { rollDie } from "@/lib/dice-utils";

interface AddFriendlyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFriendly: (combatant: Combatant) => void;
  activeCampaignParty: PlayerCharacter[];
  combatants: Combatant[]; // To filter out already added players
  combatUniqueId: string; // To ensure unique IDs for combatants
}

export function AddFriendlyDrawer({
  open,
  onOpenChange,
  onAddFriendly,
  activeCampaignParty,
  combatants,
  combatUniqueId,
}: AddFriendlyDrawerProps) {
  const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState<PlayerCharacter | null>(null);
  const [allyNameInput, setAllyNameInput] = useState<string>("");
  const [friendlyInitiativeInput, setFriendlyInitiativeInput] = useState<string>("");

  const availablePartyMembers = activeCampaignParty.filter(
    (p) => !combatants.some((c) => c.playerId === p.id)
  );
  const isAllyMode = availablePartyMembers.length === 0;

  const handleSaveFriendly = () => {
    const initiativeValue = parseInt(friendlyInitiativeInput);
    if (isNaN(initiativeValue) || friendlyInitiativeInput.trim() === "") return;

    let name: string, playerId: string | undefined, color: string | undefined;
    if (isAllyMode) {
      if (!allyNameInput.trim()) return;
      name = allyNameInput.trim();
    } else {
      if (!selectedPlayerToAdd) return;
      name = selectedPlayerToAdd.name;
      playerId = selectedPlayerToAdd.id;
      color = selectedPlayerToAdd.color;
    }

    const newCombatant: Combatant = {
      id: `${combatUniqueId}-${isAllyMode ? 'ally' : 'player'}-${playerId || name.replace(/\s+/g, '')}-${Date.now()}`,
      name,
      initiative: initiativeValue,
      type: 'player',
      color,
      playerId,
    };
    onAddFriendly(newCombatant);
    // Reset form state
    setSelectedPlayerToAdd(null);
    setAllyNameInput("");
    setFriendlyInitiativeInput("");
  };

  const handleRollFriendlyInitiative = () => {
    let mod = 0;
    if (!isAllyMode && selectedPlayerToAdd) {
      mod = selectedPlayerToAdd.initiativeModifier || 0;
    }
    setFriendlyInitiativeInput((rollDie(20) + mod).toString());
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedPlayerToAdd(null);
    setAllyNameInput("");
    setFriendlyInitiativeInput("");
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-[380px] sm:w-[450px] flex flex-col p-0" hideCloseButton={true}>
        <div className="flex flex-col h-full pr-8">
          <SheetHeader className="p-4 border-b bg-primary text-primary-foreground">
            <SheetTitle className="text-primary-foreground flex items-center">
              {isAllyMode ? <UserPlus className="mr-2 h-5 w-5"/> : <Users className="mr-2 h-5 w-5"/>}
              {isAllyMode ? "Add Ally" : "Add Player Character"}
            </SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-4 flex-grow">
            {isAllyMode ? (
              <div>
                <Label htmlFor="ally-name">Ally Name</Label>
                <Input
                  id="ally-name"
                  value={allyNameInput}
                  onChange={(e) => setAllyNameInput(e.target.value)}
                  placeholder="e.g., Sir Reginald"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="player-select">Player Character</Label>
                {availablePartyMembers.length > 0 ? (
                  <Select
                    value={selectedPlayerToAdd?.id || ""}
                    onValueChange={(value) =>
                      setSelectedPlayerToAdd(
                        activeCampaignParty.find((p) => p.id === value) || null
                      )
                    }
                  >
                    <SelectTrigger id="player-select" className="mt-1">
                      <SelectValue placeholder="Select a player" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePartyMembers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} - {p.race} {p.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    All party members added.
                  </p>
                )}
              </div>
            )}
            <div>
              <Label htmlFor="friendly-initiative">Initiative</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="friendly-initiative"
                  type="number"
                  value={friendlyInitiativeInput}
                  onChange={(e) => setFriendlyInitiativeInput(e.target.value)}
                  placeholder="e.g., 15"
                  className="flex-grow"
                />
                {(isAllyMode || selectedPlayerToAdd) && (
                   <Button onClick={handleRollFriendlyInitiative} variant="outline" size="sm" className="shrink-0">
                    <Dice5 className="mr-1 h-4 w-4"/> Roll (d20{(!isAllyMode && selectedPlayerToAdd && selectedPlayerToAdd.initiativeModifier) ? `+${selectedPlayerToAdd.initiativeModifier}` : ''})
                   </Button>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 border-t mt-auto">
            <Button
              onClick={handleSaveFriendly}
              disabled={(!isAllyMode && !selectedPlayerToAdd) || (isAllyMode && !allyNameInput.trim()) || !friendlyInitiativeInput.trim()}
              className="w-full"
            >
              Add to Combat
            </Button>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]"
          aria-label="Close Add Friendly Drawer"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </SheetContent>
    </Sheet>
  );
}

    