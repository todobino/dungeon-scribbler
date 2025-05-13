
"use client";

import type { Faction } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { useCampaign } from "@/contexts/campaign-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ShieldCheck, Users, Trash2, Edit3, Eye, Library, Target, Activity, FileText, UserCircle2, Home, Link2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FACTION_REPUTATION_SCALE, getFactionReputationLabel, getFactionReputationColorClass } from "@/lib/constants";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FACTIONS_STORAGE_KEY_PREFIX = 'dungeonScribblerFactions_';
const getFactionsStorageKey = (campaignId: string) => `${FACTIONS_STORAGE_KEY_PREFIX}${campaignId}`;

export default function FactionsPage() {
  const { activeCampaign, isLoadingCampaigns } = useCampaign();
  const { toast } = useToast();

  const [factions, setFactions] = useState<Faction[]>([]);
  const [isLoadingFactions, setIsLoadingFactions] = useState(true);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingFaction, setEditingFaction] = useState<Faction | null>(null);
  const [viewingFaction, setViewingFaction] = useState<Faction | null>(null);

  const initialFormState: Omit<Faction, 'id' | 'campaignId'> = {
    name: "",
    goals: "",
    reputation: 0,
    notes: "",
    leader: "",
    headquarters: "",
    allies: "",
    enemies: "",
  };
  const [factionFormData, setFactionFormData] = useState(initialFormState);

  // Load factions when activeCampaign changes
  useEffect(() => {
    if (activeCampaign) {
      setIsLoadingFactions(true);
      try {
        const storageKey = getFactionsStorageKey(activeCampaign.id);
        const storedFactions = localStorage.getItem(storageKey);
        if (storedFactions) {
          setFactions(JSON.parse(storedFactions));
        } else {
          setFactions([]);
        }
      } catch (error) {
        console.error("Failed to load factions from localStorage", error);
        setFactions([]);
      }
      setIsLoadingFactions(false);
    } else if (!isLoadingCampaigns) { // if no active campaign and campaigns are loaded
      setFactions([]); // Clear factions if no active campaign
      setIsLoadingFactions(false);
    }
  }, [activeCampaign, isLoadingCampaigns]);

  // Save factions when they change for the active campaign
  useEffect(() => {
    if (activeCampaign && !isLoadingFactions) {
      try {
        const storageKey = getFactionsStorageKey(activeCampaign.id);
        localStorage.setItem(storageKey, JSON.stringify(factions));
      } catch (error) {
        console.error("Failed to save factions to localStorage", error);
      }
    }
  }, [factions, activeCampaign, isLoadingFactions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFactionFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReputationChange = (value: number[]) => {
    setFactionFormData(prev => ({ ...prev, reputation: value[0] }));
  };

  const handleSubmitFaction = () => {
    if (!activeCampaign) return;
    if (!factionFormData.name.trim() || !factionFormData.goals.trim()) {
      toast({ title: "Missing Information", description: "Faction Name and Goals are required.", variant: "destructive" });
      return;
    }

    if (editingFaction) {
      const updatedFaction: Faction = { ...editingFaction, ...factionFormData };
      setFactions(factions.map(f => f.id === updatedFaction.id ? updatedFaction : f));
      toast({ title: "Faction Updated", description: `"${updatedFaction.name}" has been updated.` });
    } else {
      const newFaction: Faction = {
        ...factionFormData,
        id: Date.now().toString(),
        campaignId: activeCampaign.id,
      };
      setFactions([...factions, newFaction]);
      toast({ title: "Faction Added", description: `"${newFaction.name}" has been added.` });
    }
    setIsFormDialogOpen(false);
    setEditingFaction(null);
    setFactionFormData(initialFormState);
  };

  const openAddDialog = () => {
    setEditingFaction(null);
    setFactionFormData(initialFormState);
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (faction: Faction) => {
    setEditingFaction(faction);
    setFactionFormData({
      name: faction.name,
      goals: faction.goals,
      reputation: faction.reputation,
      notes: faction.notes || "",
      leader: faction.leader || "",
      headquarters: faction.headquarters || "",
      allies: faction.allies || "",
      enemies: faction.enemies || "",
    });
    setIsFormDialogOpen(true);
  };

  const openViewDialog = (faction: Faction) => {
    setViewingFaction(faction);
    setIsViewDialogOpen(true);
  };

  const handleDeleteFaction = (id: string) => {
    setFactions(factions.filter(f => f.id !== id));
    toast({ title: "Faction Deleted", description: "The faction has been removed." });
  };

  const ReputationDisplay = ({ reputation }: { reputation: number }) => {
    const label = getFactionReputationLabel(reputation);
    const colorClass = getFactionReputationColorClass(reputation);
    
    let badgeVariant: "default" | "secondary" | "destructive" = "secondary";
    if (reputation >= FACTION_REPUTATION_SCALE.MAX - 2) badgeVariant = "default"; // Allied / Trusted
    else if (reputation <= FACTION_REPUTATION_SCALE.MIN + 2) badgeVariant = "destructive"; // Sworn Enemy / Hostile

    return <Badge variant={badgeVariant} className={cn(colorClass, "font-semibold")}>{label}</Badge>;
  };

  if (isLoadingCampaigns || isLoadingFactions) {
    return <div className="text-center p-10">Loading faction data...</div>;
  }

  if (!activeCampaign) {
    return (
      <Card className="text-center py-12">
        <CardHeader>
          <Library className="mx-auto h-16 w-16 text-muted-foreground" />
          <CardTitle className="mt-4">No Active Campaign</CardTitle>
          <CardDescription>Please select or create a campaign to manage factions.</CardDescription>
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Factions</h1>
        <Button onClick={openAddDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Faction
        </Button>
      </div>

      {factions.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <ShieldCheck className="mx-auto h-16 w-16 text-muted-foreground" />
            <CardTitle className="mt-4">No Factions Yet</CardTitle>
            <CardDescription>Define the powers and groups that shape your world.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-5 w-5" /> Create First Faction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {factions.map(faction => (
            <Card key={faction.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{faction.name}</CardTitle>
                    <ReputationDisplay reputation={faction.reputation} />
                </div>
                <CardDescription className="flex items-center gap-1 text-sm">
                  <UserCircle2 className="h-4 w-4" /> Leader: {faction.leader || "N/A"}
                </CardDescription>
                 <CardDescription className="flex items-center gap-1 text-sm">
                  <Home className="h-4 w-4" /> HQ: {faction.headquarters || "N/A"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-start gap-2 mb-2">
                  <Target className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                  <p className="text-sm text-muted-foreground line-clamp-3"><span className="font-medium text-card-foreground">Goals:</span> {faction.goals}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Button variant="outline" size="sm" onClick={() => openViewDialog(faction)} className="flex-1">
                  <Eye className="mr-2 h-4 w-4" /> View
                </Button>
                <Button variant="secondary" size="sm" onClick={() => openEditDialog(faction)} className="flex-1">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteFaction(faction.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Faction Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setEditingFaction(null);
          setFactionFormData(initialFormState);
        }
        setIsFormDialogOpen(isOpen);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingFaction ? "Edit Faction" : "New Faction"}</DialogTitle>
            <DialogDescription>{editingFaction ? "Update the details of this faction." : "Define a new faction in your campaign world."}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-1 pr-3">
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" />Name*</Label>
                <Input id="name" name="name" value={factionFormData.name} onChange={handleInputChange} placeholder="e.g., The Shadow Syndicate" />
              </div>
              <div>
                <Label htmlFor="goals" className="flex items-center gap-1"><Target className="h-4 w-4" />Goals*</Label>
                <Textarea id="goals" name="goals" value={factionFormData.goals} onChange={handleInputChange} placeholder="Describe the faction's primary objectives..." rows={3} />
              </div>
              <div>
                <Label htmlFor="reputation" className="flex items-center gap-1 mb-1">
                  <Activity className="h-4 w-4" />Reputation with Party: <span className="font-semibold ml-1">{getFactionReputationLabel(factionFormData.reputation)}</span>
                </Label>
                <Slider
                  id="reputation"
                  min={FACTION_REPUTATION_SCALE.MIN}
                  max={FACTION_REPUTATION_SCALE.MAX}
                  step={FACTION_REPUTATION_SCALE.STEP}
                  value={[factionFormData.reputation]}
                  onValueChange={handleReputationChange}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                  <span>{getFactionReputationLabel(FACTION_REPUTATION_SCALE.MIN)}</span>
                  <span>{getFactionReputationLabel(0)}</span>
                  <span>{getFactionReputationLabel(FACTION_REPUTATION_SCALE.MAX)}</span>
                </div>
              </div>
              <div>
                <Label htmlFor="leader" className="flex items-center gap-1"><UserCircle2 className="h-4 w-4" />Leader (Optional)</Label>
                <Input id="leader" name="leader" value={factionFormData.leader} onChange={handleInputChange} placeholder="e.g., Lord Valerius" />
              </div>
              <div>
                <Label htmlFor="headquarters" className="flex items-center gap-1"><Home className="h-4 w-4" />Headquarters (Optional)</Label>
                <Input id="headquarters" name="headquarters" value={factionFormData.headquarters} onChange={handleInputChange} placeholder="e.g., The Obsidian Spire" />
              </div>
              <div>
                <Label htmlFor="allies" className="flex items-center gap-1"><Link2 className="h-4 w-4" />Allies (Optional)</Label>
                <Textarea id="allies" name="allies" value={factionFormData.allies} onChange={handleInputChange} placeholder="Describe known allies or allied groups..." rows={2} />
              </div>
              <div>
                <Label htmlFor="enemies" className="flex items-center gap-1"><Link2 className="h-4 w-4" />Enemies (Optional)</Label>
                <Textarea id="enemies" name="enemies" value={factionFormData.enemies} onChange={handleInputChange} placeholder="Describe known enemies or rival groups..." rows={2} />
              </div>
              <div>
                <Label htmlFor="notes" className="flex items-center gap-1"><FileText className="h-4 w-4" />Notes (Optional)</Label>
                <Textarea id="notes" name="notes" value={factionFormData.notes} onChange={handleInputChange} placeholder="Additional details, history, secrets..." rows={4} />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitFaction}>{editingFaction ? "Save Changes" : "Add Faction"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Faction Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          {viewingFaction && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <DialogTitle className="text-2xl">{viewingFaction.name}</DialogTitle>
                  <ReputationDisplay reputation={viewingFaction.reputation} />
                </div>
                <DialogDescription>Details for {viewingFaction.name}</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] p-1 pr-3">
                <div className="space-y-4 py-4">
                  <div><h4 className="font-semibold text-primary flex items-center gap-1"><Target className="h-4 w-4"/>Goals:</h4><p className="text-sm whitespace-pre-wrap pl-5">{viewingFaction.goals}</p></div>
                  {viewingFaction.leader && <div><h4 className="font-semibold text-primary flex items-center gap-1"><UserCircle2 className="h-4 w-4"/>Leader:</h4><p className="text-sm pl-5">{viewingFaction.leader}</p></div>}
                  {viewingFaction.headquarters && <div><h4 className="font-semibold text-primary flex items-center gap-1"><Home className="h-4 w-4"/>Headquarters:</h4><p className="text-sm pl-5">{viewingFaction.headquarters}</p></div>}
                  {viewingFaction.allies && <div><h4 className="font-semibold text-primary flex items-center gap-1"><Link2 className="h-4 w-4"/>Allies:</h4><p className="text-sm whitespace-pre-wrap pl-5">{viewingFaction.allies}</p></div>}
                  {viewingFaction.enemies && <div><h4 className="font-semibold text-primary flex items-center gap-1"><Link2 className="h-4 w-4"/>Enemies:</h4><p className="text-sm whitespace-pre-wrap pl-5">{viewingFaction.enemies}</p></div>}
                  {viewingFaction.notes && <div><h4 className="font-semibold text-primary flex items-center gap-1"><FileText className="h-4 w-4"/>Notes:</h4><p className="text-sm whitespace-pre-wrap pl-5">{viewingFaction.notes}</p></div>}
                </div>
              </ScrollArea>
              <DialogFooter className="justify-between">
                 <Button variant="secondary" onClick={() => { setIsViewDialogOpen(false); openEditDialog(viewingFaction); }}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
