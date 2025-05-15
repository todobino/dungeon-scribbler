
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Library, Users, Swords, PlusCircle, Trash2, XCircle } from "lucide-react";
import { useCampaign } from "@/contexts/campaign-context";
import type { EncounterMonster } from "@/lib/types";
import { ENCOUNTER_STORAGE_KEY_PREFIX } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export default function EncounterPlannerPage() {
  const { activeCampaign, isLoadingCampaigns } = useCampaign();
  const { toast } = useToast();

  const [encounterMonsters, setEncounterMonsters] = useState<EncounterMonster[]>([]);
  const [isLoadingEncounter, setIsLoadingEncounter] = useState(true);

  const [monsterName, setMonsterName] = useState("");
  const [monsterQuantity, setMonsterQuantity] = useState("1");
  const [monsterCR, setMonsterCR] = useState("");

  const getEncounterStorageKey = useCallback(() => {
    if (!activeCampaign) return null;
    return `${ENCOUNTER_STORAGE_KEY_PREFIX}${activeCampaign.id}`;
  }, [activeCampaign]);

  useEffect(() => {
    if (isLoadingCampaigns) return;

    if (!activeCampaign) {
      setEncounterMonsters([]);
      setIsLoadingEncounter(false);
      return;
    }
    setIsLoadingEncounter(true);
    const storageKey = getEncounterStorageKey();
    if (storageKey) {
      try {
        const storedEncounter = localStorage.getItem(storageKey);
        if (storedEncounter) {
          setEncounterMonsters(JSON.parse(storedEncounter));
        } else {
          setEncounterMonsters([]);
        }
      } catch (error) {
        console.error("Error loading encounter from localStorage for " + activeCampaign.name, error);
        setEncounterMonsters([]);
      }
    } else {
      setEncounterMonsters([]);
    }
    setIsLoadingEncounter(false);
  }, [activeCampaign, isLoadingCampaigns, getEncounterStorageKey]);

  useEffect(() => {
    if (activeCampaign && !isLoadingEncounter) {
      const storageKey = getEncounterStorageKey();
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(encounterMonsters));
        } catch (error) {
          console.error("Error saving encounter to localStorage for " + activeCampaign.name, error);
        }
      }
    }
  }, [encounterMonsters, activeCampaign, isLoadingEncounter, getEncounterStorageKey]);

  const handleAddMonster = () => {
    if (!monsterName.trim()) {
      toast({ title: "Missing Name", description: "Please enter a name for the monster.", variant: "destructive" });
      return;
    }
    const quantity = parseInt(monsterQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: "Invalid Quantity", description: "Quantity must be a positive number.", variant: "destructive" });
      return;
    }

    const newMonster: EncounterMonster = {
      id: Date.now().toString(),
      name: monsterName.trim(),
      quantity: quantity,
      cr: monsterCR.trim() || undefined,
    };

    setEncounterMonsters(prev => [...prev, newMonster]);
    setMonsterName("");
    setMonsterQuantity("1");
    setMonsterCR("");
    toast({ title: "Monster Added", description: `${newMonster.name} (x${newMonster.quantity}) added to encounter.` });
  };

  const handleRemoveMonster = (id: string) => {
    setEncounterMonsters(prev => prev.filter(monster => monster.id !== id));
    toast({ title: "Monster Removed" });
  };

  const handleClearEncounter = () => {
    setEncounterMonsters([]);
    toast({ title: "Encounter Cleared" });
  };

  if (isLoadingCampaigns || isLoadingEncounter) {
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
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlusCircle className="mr-2 h-5 w-5 text-primary" />
                Add Monsters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="monsterName">Monster Name*</Label>
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
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddMonster} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add to Encounter
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

        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="flex items-center">
                <Swords className="mr-3 h-6 w-6 text-primary" />
                Current Encounter
              </CardTitle>
              {encounterMonsters.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleClearEncounter}>
                  <XCircle className="mr-2 h-4 w-4" /> Clear All
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {encounterMonsters.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No monsters added to this encounter yet.</p>
              ) : (
                <ul className="space-y-3">
                  {encounterMonsters.map((monster) => (
                    <li key={monster.id} className="flex justify-between items-center p-3 border rounded-md shadow-sm bg-card">
                      <div>
                        <p className="font-medium">{monster.name} (x{monster.quantity})</p>
                        {monster.cr && <p className="text-xs text-muted-foreground">CR: {monster.cr}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveMonster(monster.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
        </div>
      </div>
    </div>
  );
}
