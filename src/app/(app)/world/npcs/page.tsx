
"use client";

import type { NPC, Faction, Location } from "@/lib/types";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useCampaign } from "@/contexts/campaign-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Users2, PlusCircle, Search, Star, Edit3, Trash2, Save, Library, Users as CampaignUsersIcon, ShieldCheck, MapPin, Activity, Brain } from "lucide-react";
import Link from "next/link";
import { 
  NPCS_PAGE_STORAGE_KEY_PREFIX,
  FACTIONS_STORAGE_KEY_PREFIX,
  LOCATIONS_STORAGE_KEY_PREFIX,
  FACTION_REPUTATION_SCALE,
  getFactionReputationLabel
} from "@/lib/constants";
import { cn } from "@/lib/utils";


type NewNpcFormData = Omit<NPC, 'id' | 'campaignId' | 'isFavorite'> & { isIntegrating?: boolean };

const initialNewNpcFormData: NewNpcFormData = {
  name: "",
  race: "",
  class: "",
  notes: "",
  isIntegrating: false,
  factionId: "",
  locationId: "",
  reputationWithParty: 0,
  associations: "",
  description: "",
  personalityTraits: "",
  backstory: "",
  motivations: ""
};


export default function NpcsListPage() {
  const { activeCampaign, isLoadingCampaigns } = useCampaign();
  const { toast } = useToast();

  const [allCampaignNpcs, setAllCampaignNpcs] = useState<NPC[]>([]);
  const [isLoadingNpcs, setIsLoadingNpcs] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
  const [isEditingNpc, setIsEditingNpc] = useState(false);
  const [editNpcFormData, setEditNpcFormData] = useState<NPC | null>(null);

  const [showNewNpcForm, setShowNewNpcForm] = useState(false);
  const [newNpcFormData, setNewNpcFormData] = useState<NewNpcFormData>(initialNewNpcFormData);
  
  const [campaignFactions, setCampaignFactions] = useState<Faction[]>([]);
  const [campaignLocations, setCampaignLocations] = useState<Location[]>([]);

  const [npcToDelete, setNpcToDelete] = useState<NPC | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);


  const getNpcsStorageKey = useCallback(() => {
    if (!activeCampaign) return null;
    return `${NPCS_PAGE_STORAGE_KEY_PREFIX}${activeCampaign.id}`;
  }, [activeCampaign]);

  const getFactionsStorageKey = useCallback(() => {
    if (!activeCampaign) return null;
    return `${FACTIONS_STORAGE_KEY_PREFIX}${activeCampaign.id}`;
  }, [activeCampaign]);
  
  const getLocationsStorageKey = useCallback(() => {
    if (!activeCampaign) return null;
    return `${LOCATIONS_STORAGE_KEY_PREFIX}${activeCampaign.id}`;
  }, [activeCampaign]);

  // Load NPCs, Factions, Locations
  useEffect(() => {
    if (isLoadingCampaigns) return;
    if (!activeCampaign) {
      setAllCampaignNpcs([]);
      setCampaignFactions([]);
      setCampaignLocations([]);
      setSelectedNpc(null);
      setIsEditingNpc(false);
      setShowNewNpcForm(false);
      setIsLoadingNpcs(false);
      return;
    }

    setIsLoadingNpcs(true);
    const npcsKey = getNpcsStorageKey();
    const factionsKey = getFactionsStorageKey();
    const locationsKey = getLocationsStorageKey();

    try {
      const storedNpcs = npcsKey ? localStorage.getItem(npcsKey) : null;
      setAllCampaignNpcs(storedNpcs ? JSON.parse(storedNpcs) : []);
    } catch (e) { console.error("Error loading NPCs:", e); setAllCampaignNpcs([]); }
    
    try {
      const storedFactions = factionsKey ? localStorage.getItem(factionsKey) : null;
      setCampaignFactions(storedFactions ? JSON.parse(storedFactions) : []);
    } catch (e) { console.error("Error loading Factions:", e); setCampaignFactions([]); }

    try {
      const storedLocations = locationsKey ? localStorage.getItem(locationsKey) : null;
      setCampaignLocations(storedLocations ? JSON.parse(storedLocations) : []);
    } catch (e) { console.error("Error loading Locations:", e); setCampaignLocations([]); }

    setIsLoadingNpcs(false);
  }, [activeCampaign, isLoadingCampaigns, getNpcsStorageKey, getFactionsStorageKey, getLocationsStorageKey]);

  // Save NPCs
  useEffect(() => {
    if (activeCampaign && !isLoadingNpcs) {
      const key = getNpcsStorageKey();
      if (key) {
        try {
          localStorage.setItem(key, JSON.stringify(allCampaignNpcs));
        } catch (e) { console.error("Error saving NPCs:", e); }
      }
    }
  }, [allCampaignNpcs, activeCampaign, isLoadingNpcs, getNpcsStorageKey]);

  const filteredNpcs = useMemo(() => {
    if (!searchTerm) return allCampaignNpcs;
    return allCampaignNpcs.filter(npc => 
      npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (npc.race && npc.race.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (npc.class && npc.class.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allCampaignNpcs, searchTerm]);

  const favoriteNpcs = useMemo(() => filteredNpcs.filter(npc => npc.isFavorite), [filteredNpcs]);
  const integratedNpcs = useMemo(() => filteredNpcs.filter(npc => !npc.isFavorite && (npc.factionId || npc.locationId)), [filteredNpcs]);
  const potentialNpcs = useMemo(() => filteredNpcs.filter(npc => !npc.isFavorite && !npc.factionId && !npc.locationId), [filteredNpcs]);

  const handleNewNpcFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewNpcFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewNpcSelectChange = (field: keyof NewNpcFormData, value: string) => {
    setNewNpcFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNewNpcSwitchChange = (checked: boolean) => {
    setNewNpcFormData(prev => ({ ...prev, isIntegrating: checked }));
  };

  const handleNewNpcReputationChange = (value: number[]) => {
    setNewNpcFormData(prev => ({...prev, reputationWithParty: value[0]}));
  };

  const handleSaveNewNpc = () => {
    if (!activeCampaign || !newNpcFormData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    const { isIntegrating, ...npcDataToSave } = newNpcFormData;
    const newNpc: NPC = {
      ...initialNewNpcFormData, // Start with all fields from default
      ...npcDataToSave,
      id: Date.now().toString(),
      campaignId: activeCampaign.id,
      isFavorite: false,
      // Clear integration fields if not integrating
      factionId: isIntegrating ? npcDataToSave.factionId : undefined,
      locationId: isIntegrating ? npcDataToSave.locationId : undefined,
      reputationWithParty: isIntegrating ? npcDataToSave.reputationWithParty : 0,
      associations: isIntegrating ? npcDataToSave.associations : undefined,
    };
    setAllCampaignNpcs(prev => [...prev, newNpc].sort((a,b) => a.name.localeCompare(b.name)));
    setShowNewNpcForm(false);
    setNewNpcFormData(initialNewNpcFormData);
    setSelectedNpc(newNpc);
    toast({ title: "NPC Added", description: `${newNpc.name} has been added.` });
  };

  const handleSelectNpc = (npc: NPC) => {
    setSelectedNpc(npc);
    setIsEditingNpc(false); // Reset to view mode
    setEditNpcFormData(null);
  };

  const handleToggleFavorite = (npcId: string) => {
    setAllCampaignNpcs(prev => prev.map(npc => 
      npc.id === npcId ? { ...npc, isFavorite: !npc.isFavorite } : npc
    ));
    if (selectedNpc?.id === npcId) {
      setSelectedNpc(prev => prev ? {...prev, isFavorite: !prev.isFavorite} : null);
    }
     if (editNpcFormData?.id === npcId && isEditingNpc) {
      setEditNpcFormData(prev => prev ? {...prev, isFavorite: !prev.isFavorite} : null);
    }
  };

  const handleEditNpc = () => {
    if (selectedNpc) {
      setEditNpcFormData({ ...selectedNpc });
      setIsEditingNpc(true);
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editNpcFormData) return;
    const { name, value } = e.target;
    setEditNpcFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleEditSelectChange = (field: keyof NPC, value: string) => {
     if (!editNpcFormData) return;
    setEditNpcFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleEditReputationChange = (value: number[]) => {
    if (!editNpcFormData) return;
    setEditNpcFormData(prev => prev ? {...prev, reputationWithParty: value[0]} : null);
  };

  const handleSaveChanges = () => {
    if (!editNpcFormData || !editNpcFormData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setAllCampaignNpcs(prev => prev.map(npc => npc.id === editNpcFormData.id ? editNpcFormData : npc).sort((a,b) => a.name.localeCompare(b.name)));
    setSelectedNpc(editNpcFormData);
    setIsEditingNpc(false);
    toast({ title: "NPC Updated", description: `${editNpcFormData.name} has been updated.` });
  };

  const handleOpenDeleteDialog = (npc: NPC) => {
    setNpcToDelete(npc);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (npcToDelete) {
      setAllCampaignNpcs(prev => prev.filter(npc => npc.id !== npcToDelete.id));
      if (selectedNpc?.id === npcToDelete.id) setSelectedNpc(null);
      if (editNpcFormData?.id === npcToDelete.id) {
        setIsEditingNpc(false);
        setEditNpcFormData(null);
      }
      toast({ title: "NPC Deleted", description: `${npcToDelete.name} has been removed.` });
    }
    setIsDeleteConfirmOpen(false);
    setNpcToDelete(null);
  };

  const renderNpcList = (npcsToList: NPC[], title: string, emptyMessage: string) => (
    <AccordionItem value={title.toLowerCase().replace(/\s+/g, '-')}>
      <AccordionTrigger>{title} ({npcsToList.length})</AccordionTrigger>
      <AccordionContent>
        {npcsToList.length === 0 ? (
          <p className="text-sm text-muted-foreground p-2">{emptyMessage}</p>
        ) : (
          <ScrollArea className="h-48"> {/* Fixed height for scroll */}
            <ul className="space-y-1 p-1">
              {npcsToList.map(npc => (
                <li key={npc.id} 
                    onClick={() => handleSelectNpc(npc)}
                    className={cn(
                      "p-2 rounded-md hover:bg-accent cursor-pointer text-sm",
                      selectedNpc?.id === npc.id && "bg-primary/10 text-primary font-medium"
                    )}>
                  {npc.name}
                  <span className="text-xs text-muted-foreground ml-1">({npc.race || 'N/A'}{npc.class ? `, ${npc.class}` : ''})</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </AccordionContent>
    </AccordionItem>
  );

  if (isLoadingCampaigns || isLoadingNpcs) {
    return <div className="p-4 sm:p-6 lg:p-8 text-center">Loading NPC data...</div>;
  }

  if (!activeCampaign) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
      <Card className="text-center py-12">
        <CardHeader>
          <Library className="mx-auto h-16 w-16 text-muted-foreground" />
          <CardTitle className="mt-4">No Active Campaign</CardTitle>
          <CardDescription>Please select or create a campaign to manage NPCs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/campaign-management">
              <CampaignUsersIcon className="mr-2 h-5 w-5" /> Go to Campaign Management
            </Link>
          </Button>
        </CardContent>
      </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 sm:p-6 lg:p-8 h-full">
      {/* Left Column: Search, New NPC Form, NPC Lists */}
      <div className="lg:col-span-1 flex flex-col gap-4 h-full">
        <Card className="shrink-0">
          <CardContent className="p-4 space-y-3">
            <div className="flex gap-2 items-center">
              <div className="relative flex-grow">
                <Input 
                  placeholder="Search NPCs by name, race, class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-8"
                />
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Button onClick={() => setShowNewNpcForm(prev => !prev)} variant={showNewNpcForm ? "secondary" : "default"} size="icon">
                <PlusCircle className="h-5 w-5"/>
              </Button>
            </div>
          </CardContent>
        </Card>

        {showNewNpcForm && (
          <Card className="shrink-0">
            <CardHeader><CardTitle>New NPC</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label htmlFor="newName">Name*</Label><Input id="newName" name="name" value={newNpcFormData.name} onChange={handleNewNpcFormChange}/></div>
              <div><Label htmlFor="newRace">Race</Label><Input id="newRace" name="race" value={newNpcFormData.race || ""} onChange={handleNewNpcFormChange}/></div>
              <div><Label htmlFor="newClass">Class/Role</Label><Input id="newClass" name="class" value={newNpcFormData.class || ""} onChange={handleNewNpcFormChange}/></div>
              <div><Label htmlFor="newNotes">Notes</Label><Textarea id="newNotes" name="notes" value={newNpcFormData.notes || ""} onChange={handleNewNpcFormChange} rows={2}/></div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="integrateNewNpc" checked={newNpcFormData.isIntegrating} onCheckedChange={handleNewNpcSwitchChange} />
                <Label htmlFor="integrateNewNpc">Integrate this NPC?</Label>
              </div>

              {newNpcFormData.isIntegrating && (
                <div className="space-y-3 pt-2 border-t mt-2">
                  <div><Label htmlFor="newFactionId">Faction</Label>
                    <Select value={newNpcFormData.factionId || ""} onValueChange={(val) => handleNewNpcSelectChange("factionId", val)}>
                      <SelectTrigger><SelectValue placeholder="Select Faction..."/></SelectTrigger>
                      <SelectContent>{campaignFactions.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label htmlFor="newLocationId">Location</Label>
                    <Select value={newNpcFormData.locationId || ""} onValueChange={(val) => handleNewNpcSelectChange("locationId", val)}>
                      <SelectTrigger><SelectValue placeholder="Select Location..."/></SelectTrigger>
                      <SelectContent>{campaignLocations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label htmlFor="newReputation">Reputation with Party: {getFactionReputationLabel(newNpcFormData.reputationWithParty || 0)}</Label>
                    <Slider id="newReputation" min={FACTION_REPUTATION_SCALE.MIN} max={FACTION_REPUTATION_SCALE.MAX} step={FACTION_REPUTATION_SCALE.STEP} value={[newNpcFormData.reputationWithParty || 0]} onValueChange={handleNewNpcReputationChange}/>
                  </div>
                  <div><Label htmlFor="newAssociations">Associations</Label><Textarea id="newAssociations" name="associations" value={newNpcFormData.associations || ""} onChange={handleNewNpcFormChange} rows={2}/></div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {setShowNewNpcForm(false); setNewNpcFormData(initialNewNpcFormData);}}>Cancel</Button>
              <Button onClick={handleSaveNewNpc}>Save NPC</Button>
            </CardFooter>
          </Card>
        )}

        <Card className="flex-grow flex flex-col min-h-0">
          <CardHeader><CardTitle>NPC Categories</CardTitle></CardHeader>
          <CardContent className="p-2 flex-grow overflow-hidden">
            <ScrollArea className="h-full">
                <Accordion type="multiple" className="w-full">
                {renderNpcList(favoriteNpcs, "Favorite NPCs", "No favorites yet. Star an NPC in their details view.")}
                {renderNpcList(integratedNpcs, "Integrated NPCs", "No NPCs linked to factions or locations yet.")}
                {renderNpcList(potentialNpcs, "Potential NPCs", "No unlinked NPCs found.")}
                </Accordion>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: NPC Details / Edit Form */}
      <div className="lg:col-span-2">
        {selectedNpc ? (
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">{isEditingNpc ? editNpcFormData?.name : selectedNpc.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleToggleFavorite(selectedNpc.id)} title={selectedNpc.isFavorite ? "Unfavorite" : "Favorite"}>
                    <Star className={cn("h-5 w-5", selectedNpc.isFavorite ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")}/>
                  </Button>
                  {!isEditingNpc ? (
                    <Button onClick={handleEditNpc}><Edit3 className="mr-2 h-4 w-4"/>Edit</Button>
                  ) : (
                    <Button variant="destructive" onClick={() => handleOpenDeleteDialog(selectedNpc)}><Trash2 className="mr-2 h-4 w-4"/>Delete</Button>
                  )}
                </div>
              </div>
              <CardDescription>
                {isEditingNpc ? editNpcFormData?.race : selectedNpc.race || "Race not specified"}
                {selectedNpc.class || editNpcFormData?.class ? `, ${isEditingNpc ? editNpcFormData?.class : selectedNpc.class}` : ''}
              </CardDescription>
            </CardHeader>
            <ScrollArea className="flex-grow">
            <CardContent className="space-y-4 pt-2">
              {isEditingNpc && editNpcFormData ? (
                <>
                  <div><Label htmlFor="editName">Name*</Label><Input id="editName" name="name" value={editNpcFormData.name} onChange={handleEditFormChange}/></div>
                  <div><Label htmlFor="editRace">Race</Label><Input id="editRace" name="race" value={editNpcFormData.race || ""} onChange={handleEditFormChange}/></div>
                  <div><Label htmlFor="editClass">Class/Role</Label><Input id="editClass" name="class" value={editNpcFormData.class || ""} onChange={handleEditFormChange}/></div>
                  <div><Label htmlFor="editNotes">Notes</Label><Textarea id="editNotes" name="notes" value={editNpcFormData.notes || ""} onChange={handleEditFormChange} rows={3}/></div>
                  <div><Label htmlFor="editDescription">Description</Label><Textarea id="editDescription" name="description" value={editNpcFormData.description || ""} onChange={handleEditFormChange} rows={3}/></div>
                  <div><Label htmlFor="editPersonalityTraits">Personality Traits</Label><Textarea id="editPersonalityTraits" name="personalityTraits" value={editNpcFormData.personalityTraits || ""} onChange={handleEditFormChange} rows={2}/></div>
                  <div><Label htmlFor="editBackstory">Backstory</Label><Textarea id="editBackstory" name="backstory" value={editNpcFormData.backstory || ""} onChange={handleEditFormChange} rows={3}/></div>
                  <div><Label htmlFor="editMotivations">Motivations</Label><Textarea id="editMotivations" name="motivations" value={editNpcFormData.motivations || ""} onChange={handleEditFormChange} rows={2}/></div>

                  <div className="pt-2 border-t mt-2">
                    <Label className="font-semibold block mb-2">Integration Details</Label>
                    <div><Label htmlFor="editFactionId">Faction</Label>
                        <Select value={editNpcFormData.factionId || ""} onValueChange={(val) => handleEditSelectChange("factionId", val)}>
                        <SelectTrigger><SelectValue placeholder="Select Faction..."/></SelectTrigger>
                        <SelectContent>{campaignFactions.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div><Label htmlFor="editLocationId">Location</Label>
                        <Select value={editNpcFormData.locationId || ""} onValueChange={(val) => handleEditSelectChange("locationId", val)}>
                        <SelectTrigger><SelectValue placeholder="Select Location..."/></SelectTrigger>
                        <SelectContent>{campaignLocations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div><Label htmlFor="editReputation">Reputation with Party: {getFactionReputationLabel(editNpcFormData.reputationWithParty || 0)}</Label>
                        <Slider id="editReputation" min={FACTION_REPUTATION_SCALE.MIN} max={FACTION_REPUTATION_SCALE.MAX} step={FACTION_REPUTATION_SCALE.STEP} value={[editNpcFormData.reputationWithParty || 0]} onValueChange={handleEditReputationChange}/>
                    </div>
                    <div><Label htmlFor="editAssociations">Associations</Label><Textarea id="editAssociations" name="associations" value={editNpcFormData.associations || ""} onChange={handleEditFormChange} rows={2}/></div>
                  </div>
                </>
              ) : (
                <>
                  {selectedNpc.description && <div><strong className="text-primary">Description:</strong><p className="text-sm whitespace-pre-wrap">{selectedNpc.description}</p></div>}
                  {selectedNpc.personalityTraits && <div><strong className="text-primary">Personality:</strong><p className="text-sm whitespace-pre-wrap">{selectedNpc.personalityTraits}</p></div>}
                  {selectedNpc.backstory && <div><strong className="text-primary">Backstory:</strong><p className="text-sm whitespace-pre-wrap">{selectedNpc.backstory}</p></div>}
                  {selectedNpc.motivations && <div><strong className="text-primary">Motivations:</strong><p className="text-sm whitespace-pre-wrap">{selectedNpc.motivations}</p></div>}
                  {selectedNpc.notes && <div><strong className="text-primary">Notes:</strong><p className="text-sm whitespace-pre-wrap">{selectedNpc.notes}</p></div>}
                  
                  {(selectedNpc.factionId || selectedNpc.locationId || selectedNpc.associations || selectedNpc.reputationWithParty !== undefined) && (
                    <div className="pt-3 mt-3 border-t">
                      <h4 className="font-semibold mb-2">Integration Details</h4>
                      {selectedNpc.factionId && <p className="text-sm"><ShieldCheck className="inline h-4 w-4 mr-1 text-muted-foreground"/>Faction: {campaignFactions.find(f=>f.id === selectedNpc.factionId)?.name || 'Unknown'}</p>}
                      {selectedNpc.locationId && <p className="text-sm"><MapPin className="inline h-4 w-4 mr-1 text-muted-foreground"/>Location: {campaignLocations.find(l=>l.id === selectedNpc.locationId)?.name || 'Unknown'}</p>}
                      {selectedNpc.reputationWithParty !== undefined && <p className="text-sm"><Activity className="inline h-4 w-4 mr-1 text-muted-foreground"/>Party Reputation: {getFactionReputationLabel(selectedNpc.reputationWithParty)} ({selectedNpc.reputationWithParty})</p>}
                      {selectedNpc.associations && <div><strong className="text-primary"><Brain className="inline h-4 w-4 mr-1"/>Associations:</strong><p className="text-sm whitespace-pre-wrap">{selectedNpc.associations}</p></div>}
                    </div>
                  )}
                </>
              )}
            </CardContent>
            </ScrollArea>
            {isEditingNpc && (
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => {setIsEditingNpc(false); setEditNpcFormData(null);}}>Cancel</Button>
                <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4"/>Save Changes</Button>
              </CardFooter>
            )}
          </Card>
        ) : (
          <Card className="h-full flex flex-col items-center justify-center text-center">
            <Users2 className="h-24 w-24 text-muted-foreground" />
            <CardTitle className="mt-4">Select an NPC</CardTitle>
            <CardDescription>Choose an NPC from the list to view or edit their details, or create a new one.</CardDescription>
          </Card>
        )}
      </div>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete NPC "{npcToDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the NPC.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setIsDeleteConfirmOpen(false); setNpcToDelete(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className={cn(buttonVariants({variant: "destructive"}))}>
              Delete NPC
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

// Small helper, can be in a badge component file if reused - keeping local for now.
function buttonVariants(options: { variant: "destructive" }) {
  if (options.variant === "destructive") {
    return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
  }
  return "";
}
