
"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"; // Added SheetDescription
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Dice5, ShieldAlert, Loader2, FolderOpen } from "lucide-react"; // Changed ChevronRight to ChevronLeft
import type { Combatant, SavedEncounter, EncounterMonster, Campaign } from "@/lib/types";
import { SAVED_ENCOUNTERS_STORAGE_KEY_PREFIX } from "@/lib/constants";
import { rollDie, parseDiceNotation } from "@/lib/dice-utils"; 

interface AddEnemyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEnemies: (combatants: Combatant[]) => void;
  activeCampaign: Campaign | null;
  combatUniqueId: string;
}

export function AddEnemyDrawer({
  open,
  onOpenChange,
  onAddEnemies,
  activeCampaign,
  combatUniqueId,
}: AddEnemyDrawerProps) {
  const [activeTab, setActiveTab] = useState("single-enemy");
  const [enemyName, setEnemyName] = useState("");
  const [enemyInitiativeInput, setEnemyInitiativeInput] = useState<string>("");
  const [enemyQuantityInput, setEnemyQuantityInput] = useState<string>("1");
  const [rollEnemyInitiativeFlag, setRollEnemyInitiativeFlag] = useState<boolean>(false);
  const [rollGroupInitiativeFlag, setRollGroupInitiativeFlag] = useState<boolean>(false);
  const [enemyAC, setEnemyAC] = useState<string>("");
  const [enemyHP, setEnemyHP] = useState<string>("");

  const [savedEncountersForCombat, setSavedEncountersForCombat] = useState<SavedEncounter[]>([]);
  const [selectedSavedEncounterId, setSelectedSavedEncounterId] = useState<string | undefined>(undefined);
  const [isLoadingSavedEncounters, setIsLoadingSavedEncounters] = useState(false);

  useEffect(() => {
    if (open && activeCampaign && activeTab === "load-encounter" && savedEncountersForCombat.length === 0) {
      setIsLoadingSavedEncounters(true);
      try {
        const storageKey = `${SAVED_ENCOUNTERS_STORAGE_KEY_PREFIX}${activeCampaign.id}`;
        const storedEncounters = localStorage.getItem(storageKey);
        setSavedEncountersForCombat(storedEncounters ? JSON.parse(storedEncounters) : []);
      } catch (error) {
        console.error("Error loading saved encounters for combat tracker:", error);
        setSavedEncountersForCombat([]);
      }
      setIsLoadingSavedEncounters(false);
    }
  }, [open, activeCampaign, activeTab, savedEncountersForCombat.length]);

  const parseModifierString = (modStr: string): number => {
    modStr = modStr.trim();
    if (modStr === "") return 0;
    const num = parseInt(modStr);
    return isNaN(num) ? 0 : num;
  };

  const handleAddSingleEnemyGroup = () => {
    if (!enemyName.trim()) return;
    const quantity = parseInt(enemyQuantityInput) || 1;
    if (quantity <= 0) return;

    const acValue = enemyAC.trim() === "" ? undefined : parseInt(enemyAC);
    const hpValue = enemyHP.trim() === "" ? undefined : parseInt(enemyHP);
    if (enemyAC.trim() !== "" && (isNaN(acValue!) || acValue! < 0)) return;
    if (enemyHP.trim() !== "" && (isNaN(hpValue!) || hpValue! <= 0)) return;

    const newEnemies: Combatant[] = [];
    let groupInitiativeValue: number | undefined;

    if (rollGroupInitiativeFlag) {
      groupInitiativeValue = rollEnemyInitiativeFlag ? rollDie(20) + parseModifierString(enemyInitiativeInput) : parseInt(enemyInitiativeInput);
      if (isNaN(groupInitiativeValue)) return;
    }

    for (let i = 0; i < quantity; i++) {
      let initiativeValue: number;
      const currentEnemyName = quantity > 1 ? `${enemyName.trim()} ${i + 1}` : enemyName.trim();

      if (rollGroupInitiativeFlag && groupInitiativeValue !== undefined) {
        initiativeValue = groupInitiativeValue;
      } else {
        initiativeValue = rollEnemyInitiativeFlag ? rollDie(20) + parseModifierString(enemyInitiativeInput) : parseInt(enemyInitiativeInput);
        if (isNaN(initiativeValue)) return;
      }
      newEnemies.push({
        id: `${combatUniqueId}-enemy-${Date.now()}-${i}`,
        name: currentEnemyName,
        initiative: initiativeValue,
        type: 'enemy',
        ac: acValue,
        hp: hpValue,
        currentHp: hpValue,
      });
    }
    onAddEnemies(newEnemies);
    handleClose();
  };

  const handleLoadSavedEncounterToCombat = () => {
    if (!selectedSavedEncounterId) return;
    const encounter = savedEncountersForCombat.find(e => e.id === selectedSavedEncounterId);
    if (!encounter) return;

    const newEnemiesFromEncounter: Combatant[] = [];
    encounter.monsters.forEach((monster: EncounterMonster, monsterIndex: number) => {
      for (let i = 0; i < monster.quantity; i++) {
        const combatantName = monster.quantity > 1 ? `${monster.name} ${i + 1}` : monster.name;
        const initiativeValue = rollDie(20); 
        const acValue = monster.ac ? parseInt(monster.ac) : undefined;
        const hpValue = monster.hp ? parseInt(monster.hp) : undefined;

        newEnemiesFromEncounter.push({
          id: `${combatUniqueId}-enemy-${monster.name.replace(/\s+/g, '')}-${Date.now()}-${monsterIndex}-${i}`,
          name: combatantName,
          initiative: initiativeValue,
          type: 'enemy',
          ac: isNaN(acValue!) ? undefined : acValue,
          hp: isNaN(hpValue!) ? undefined : hpValue,
          currentHp: isNaN(hpValue!) ? undefined : hpValue,
        });
      }
    });
    onAddEnemies(newEnemiesFromEncounter);
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    setEnemyName("");
    setEnemyInitiativeInput("");
    setEnemyQuantityInput("1");
    setRollEnemyInitiativeFlag(false);
    setRollGroupInitiativeFlag(false);
    setEnemyAC("");
    setEnemyHP("");
    setSelectedSavedEncounterId(undefined);
    setActiveTab("single-enemy");
  };

  const selectedEncounterDetails = selectedSavedEncounterId ? savedEncountersForCombat.find(e => e.id === selectedSavedEncounterId) : null;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="left" className="w-[380px] sm:w-[450px] flex flex-col p-0" hideCloseButton={true}>
        <div className="flex flex-col h-full pl-8"> {/* Changed pr-8 to pl-8 */}
          <SheetHeader className="bg-primary text-primary-foreground p-4 rounded-t-md -ml-6 -mt-0 mb-4"> {/* Adjusted margins for header */}
            <SheetTitle className="text-primary-foreground flex items-center">
              <ShieldAlert className="mr-2 h-5 w-5"/>
              Add Enemies
            </SheetTitle>
            <SheetDescription className="text-primary-foreground/80">
              Add individual enemies or load a pre-saved encounter.
            </SheetDescription>
          </SheetHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-2 flex flex-col flex-grow min-h-0">
            <TabsList className="grid w-full grid-cols-2 mx-4 w-auto">
              <TabsTrigger value="single-enemy">Single Enemy/Group</TabsTrigger>
              <TabsTrigger value="load-encounter" disabled={!activeCampaign}>Load Encounter</TabsTrigger>
            </TabsList>
            <TabsContent value="single-enemy" className="space-y-3 p-4 flex-grow flex flex-col">
              <div><Label htmlFor="enemy-name">Enemy Name</Label><Input id="enemy-name" value={enemyName} onChange={(e) => setEnemyName(e.target.value)} placeholder="e.g., Goblin" /></div>
              <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="enemy-ac">AC (Optional)</Label><Input id="enemy-ac" type="number" value={enemyAC} onChange={(e) => setEnemyAC(e.target.value)} placeholder="e.g., 13" /></div><div><Label htmlFor="enemy-hp">HP (Optional)</Label><Input id="enemy-hp" type="number" value={enemyHP} onChange={(e) => setEnemyHP(e.target.value)} placeholder="e.g., 7" /></div></div>
              <div><Label htmlFor="enemy-quantity">Quantity</Label><Input id="enemy-quantity" type="number" value={enemyQuantityInput} onChange={(e) => setEnemyQuantityInput(e.target.value)} placeholder="1" min="1" /></div>
              <div className="flex items-center space-x-2 pt-2"><Switch id="roll-group-initiative" checked={rollGroupInitiativeFlag} onCheckedChange={setRollGroupInitiativeFlag} /><Label htmlFor="roll-group-initiative" className="cursor-pointer">Roll initiative as a group?</Label></div>
              <div className="flex items-center space-x-2 pt-1"><Switch id="roll-enemy-initiative" checked={rollEnemyInitiativeFlag} onCheckedChange={setRollEnemyInitiativeFlag} /><Label htmlFor="roll-enemy-initiative" className="cursor-pointer">{rollGroupInitiativeFlag ? "Roll for Group?" : "Roll for each Enemy?"}</Label></div>
              <div><Label htmlFor="enemy-initiative-input">{rollEnemyInitiativeFlag ? "Initiative Modifier (e.g., +2 or -1)" : "Fixed Initiative Value"}{rollGroupInitiativeFlag ? " (for group)" : ""}</Label><Input id="enemy-initiative-input" value={enemyInitiativeInput} onChange={(e) => setEnemyInitiativeInput(e.target.value)} placeholder={rollEnemyInitiativeFlag ? "e.g., 2 or -1" : "e.g., 12"} type={rollEnemyInitiativeFlag ? "text" : "number"} /></div>
              <div className="mt-auto pt-4">
                <Button onClick={handleAddSingleEnemyGroup} disabled={!enemyName.trim() || !enemyInitiativeInput.trim()} className="w-full">Add to Combat</Button>
              </div>
            </TabsContent>
            <TabsContent value="load-encounter" className="space-y-3 p-4 flex-grow flex flex-col">
              {isLoadingSavedEncounters ? (
                <div className="flex items-center justify-center h-32 flex-grow"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : savedEncountersForCombat.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 flex-grow">No saved encounters found for this campaign.</p>
              ) : (
                <>
                  <div>
                    <Label htmlFor="saved-encounter-select">Select Saved Encounter</Label>
                    <Select value={selectedSavedEncounterId} onValueChange={setSelectedSavedEncounterId}>
                      <SelectTrigger id="saved-encounter-select" className="mt-1">
                        <SelectValue placeholder="Choose an encounter..." />
                      </SelectTrigger>
                      <SelectContent>
                        {savedEncountersForCombat.map(enc => (
                          <SelectItem key={enc.id} value={enc.id}>{enc.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedEncounterDetails && (
                    <div className="mt-2 flex-grow flex flex-col">
                      <Label className="font-medium">Monsters in "{selectedEncounterDetails.title}":</Label>
                      <ScrollArea className="h-32 mt-1 border rounded-md p-2 bg-muted/30 flex-grow">
                        <ul className="text-sm space-y-1">
                          {selectedEncounterDetails.monsters.map(monster => (
                            <li key={monster.id}>
                              {monster.name} (x{monster.quantity})
                              <span className="text-xs text-muted-foreground ml-1">
                                {monster.cr && `CR:${monster.cr} `}
                                {monster.ac && `AC:${monster.ac} `}
                                {monster.hp && `HP:${monster.hp}`}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </div>
                  )}
                  <div className="mt-auto pt-4">
                    <Button onClick={handleLoadSavedEncounterToCombat} disabled={!selectedSavedEncounterId} className="w-full">Add Encounter to Combat</Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
        <button
          onClick={handleClose}
          className="absolute top-0 left-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]" /* Changed right-0 to left-0 */
          aria-label="Close Add Enemy Drawer"
        >
          <ChevronLeft className="h-6 w-6" /> {/* Changed ChevronRight to ChevronLeft */}
        </button>
      </SheetContent>
    </Sheet>
  );
}
