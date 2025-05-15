
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle, ChevronRight, BookOpen, Search, PlusCircle, Dna, Edit3, Trash2, Save } from "lucide-react";
import type { SpellSummary, SpellDetail, HomebrewSpellFormData } from "@/lib/types";
import { SPELLBOOK_HOMEBREW_STORAGE_KEY, SPELL_SCHOOLS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

interface SpellbookDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DND5E_API_BASE_URL = "https://www.dnd5eapi.co";

const initialHomebrewSpellFormData: HomebrewSpellFormData = {
  name: "",
  level: "0", // Default to cantrip
  casting_time: "1 action",
  range: "Self",
  components: "V, S",
  duration: "Instantaneous",
  concentration: false,
  school: SPELL_SCHOOLS[0],
  desc: "",
  higher_level: "",
  classes: "",
  subclasses: "",
};


export function SpellbookDrawer({ open, onOpenChange }: SpellbookDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [apiSpells, setApiSpells] = useState<SpellSummary[]>([]);
  const [homebrewSpells, setHomebrewSpells] = useState<SpellDetail[]>([]);
  const [combinedSpells, setCombinedSpells] = useState<(SpellSummary | SpellDetail)[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<(SpellSummary | SpellDetail)[]>([]);

  const [spellDetailsCache, setSpellDetailsCache] = useState<Record<string, SpellDetail>>({});
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [openAccordionItem, setOpenAccordionItem] = useState<string | null>(null);

  const [isCreatingHomebrewSpell, setIsCreatingHomebrewSpell] = useState(false);
  const [editingHomebrewSpellIndex, setEditingHomebrewSpellIndex] = useState<string | null>(null);
  const [homebrewSpellFormData, setHomebrewSpellFormData] = useState<HomebrewSpellFormData>(initialHomebrewSpellFormData);
  const [initialEditHomebrewSpellFormData, setInitialEditHomebrewSpellFormData] = useState<HomebrewSpellFormData | null>(null);
  const [isHomebrewFormDirty, setIsHomebrewFormDirty] = useState(false);
  const [showHomebrewOnly, setShowHomebrewOnly] = useState(false);

  const [isUnsavedChangesDialogOpen, setIsUnsavedChangesDialogOpen] = useState(false);
  const [pendingActionArgs, setPendingActionArgs] = useState<{ type: 'select_spell' | 'create_new'; spellIndex?: string } | null>(null);
  
  const [isDeleteHomebrewConfirmOpen, setIsDeleteHomebrewConfirmOpen] = useState(false);
  const [spellToDeleteIndex, setSpellToDeleteIndex] = useState<string | null>(null);


  const fetchSpellsList = useCallback(async () => {
    setIsLoadingList(true);
    setError(null);
    try {
      const response = await fetch(`${DND5E_API_BASE_URL}/api/spells`);
      if (!response.ok) {
        throw new Error(`Failed to fetch spells list: ${response.statusText}`);
      }
      const data = await response.json();
      setApiSpells((data.results || []).map((s: SpellSummary) => ({...s, source: 'api'})));
    } catch (err: any) {
      setError(err.message || "Could not load spells list.");
      setApiSpells([]);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (open && apiSpells.length === 0 && !isLoadingList) {
      fetchSpellsList();
    }
  }, [open, apiSpells.length, fetchSpellsList, isLoadingList]);

  useEffect(() => {
    try {
      const storedHomebrew = localStorage.getItem(SPELLBOOK_HOMEBREW_STORAGE_KEY);
      if (storedHomebrew) {
        setHomebrewSpells(JSON.parse(storedHomebrew));
      }
    } catch (e) { console.error("Failed to load homebrew spells:", e); setHomebrewSpells([]); }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SPELLBOOK_HOMEBREW_STORAGE_KEY, JSON.stringify(homebrewSpells));
    } catch (e) { console.error("Failed to save homebrew spells:", e); }
  }, [homebrewSpells]);


  useEffect(() => {
    let currentCombined = [...apiSpells, ...homebrewSpells.map(hb => ({...hb, index: hb.index || hb.name.toLowerCase().replace(/\s+/g, '-'), name: hb.name, url: ''}))]; 
    if (showHomebrewOnly) {
      currentCombined = homebrewSpells.map(hb => ({...hb, index: hb.index || hb.name.toLowerCase().replace(/\s+/g, '-'), name: hb.name, url: ''}));
    }
    currentCombined.sort((a, b) => a.name.localeCompare(b.name));
    setCombinedSpells(currentCombined);
  }, [apiSpells, homebrewSpells, showHomebrewOnly]);
  
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSpells(combinedSpells);
    } else {
      setFilteredSpells(
        combinedSpells.filter(spell =>
          spell.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, combinedSpells]);

  const fetchSpellDetail = async (spellIndex: string, source?: 'api' | 'homebrew') => {
    if (isCreatingHomebrewSpell && isHomebrewFormDirty) {
        setPendingActionArgs({ type: 'select_spell', spellIndex });
        setIsUnsavedChangesDialogOpen(true);
        return;
    }
    handleExitCreationMode(); 

    if (spellDetailsCache[spellIndex]) {
      setOpenAccordionItem(spellIndex);
      return;
    }
    if (source === 'homebrew') {
        const homebrewDetail = homebrewSpells.find(s => s.index === spellIndex);
        if (homebrewDetail) {
            setSpellDetailsCache(prev => ({ ...prev, [spellIndex]: homebrewDetail }));
            setOpenAccordionItem(spellIndex);
        }
        return;
    }

    setIsLoadingDetail(prev => ({ ...prev, [spellIndex]: true }));
    setError(null);
    try {
      const response = await fetch(`${DND5E_API_BASE_URL}/api/spells/${spellIndex}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch details for ${spellIndex}: ${response.statusText}`);
      }
      const data: SpellDetail = await response.json();
      setSpellDetailsCache(prev => ({ ...prev, [spellIndex]: {...data, source: 'api'} }));
      setOpenAccordionItem(spellIndex);
    } catch (err: any) {
      setError(err.message || `Could not load details for ${spellIndex}.`);
    } finally {
      setIsLoadingDetail(prev => ({ ...prev, [spellIndex]: false }));
    }
  };

  const handleAccordionChange = (value: string) => {
    if (isCreatingHomebrewSpell && isHomebrewFormDirty) {
        setPendingActionArgs({type: 'select_spell', spellIndex: value});
        setIsUnsavedChangesDialogOpen(true);
        return;
    }
    handleExitCreationMode(); 

    setOpenAccordionItem(value || null);
    if (value && !spellDetailsCache[value] && !isLoadingDetail[value]) {
      const spell = combinedSpells.find(s => s.index === value);
      fetchSpellDetail(value, (spell as SpellDetail)?.source || 'api');
    }
  };
  
  const handleHomebrewFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setHomebrewSpellFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
    if (!isHomebrewFormDirty) setIsHomebrewFormDirty(true);
  };

  const handleHomebrewSelectChange = (name: keyof HomebrewSpellFormData, value: string) => {
    setHomebrewSpellFormData(prev => ({ ...prev, [name]: value }));
     if (!isHomebrewFormDirty) setIsHomebrewFormDirty(true);
  };

  const handleSaveHomebrewSpell = () => {
    if (!homebrewSpellFormData.name.trim()) {
      setError("Spell name is required.");
      return;
    }
    const spellLevel = parseInt(homebrewSpellFormData.level);
    if (isNaN(spellLevel) || spellLevel < 0 || spellLevel > 9) {
      setError("Invalid spell level. Must be 0-9.");
      return;
    }

    const newSpell: SpellDetail = {
      index: editingHomebrewSpellIndex || `homebrew-${Date.now()}-${homebrewSpellFormData.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: homebrewSpellFormData.name.trim(),
      level: spellLevel,
      casting_time: homebrewSpellFormData.casting_time.trim(),
      range: homebrewSpellFormData.range.trim(),
      components: homebrewSpellFormData.components.trim(),
      duration: homebrewSpellFormData.duration.trim(),
      concentration: homebrewSpellFormData.concentration,
      school: { name: homebrewSpellFormData.school, index: homebrewSpellFormData.school.toLowerCase() },
      desc: homebrewSpellFormData.desc.trim(),
      higher_level: homebrewSpellFormData.higher_level?.trim() || undefined,
      classes: homebrewSpellFormData.classes?.split(',').map(c => c.trim()).filter(Boolean) || [],
      subclasses: homebrewSpellFormData.subclasses?.split(',').map(sc => sc.trim()).filter(Boolean) || [],
      isHomebrew: true,
      source: 'homebrew',
      ritual: false, 
    };
    
    if (editingHomebrewSpellIndex) {
        setHomebrewSpells(prev => prev.map(s => s.index === editingHomebrewSpellIndex ? newSpell : s));
    } else {
        setHomebrewSpells(prev => [...prev, newSpell]);
    }
    
    handleExitCreationMode();
    setOpenAccordionItem(newSpell.index); 
    setSpellDetailsCache(prev => ({ ...prev, [newSpell.index]: newSpell }));
    setError(null);
  };

  const handleOpenCreateHomebrewForm = () => {
    if (isCreatingHomebrewSpell && isHomebrewFormDirty) {
      setPendingActionArgs({ type: 'create_new' });
      setIsUnsavedChangesDialogOpen(true);
    } else {
      setIsCreatingHomebrewSpell(true);
      setEditingHomebrewSpellIndex(null);
      setHomebrewSpellFormData(initialHomebrewSpellFormData);
      setInitialEditHomebrewSpellFormData(null);
      setIsHomebrewFormDirty(false);
      setOpenAccordionItem(null);
      setError(null);
    }
  };
  
  const handleOpenEditHomebrewForm = (spell: SpellDetail) => {
     if (isCreatingHomebrewSpell && isHomebrewFormDirty && editingHomebrewSpellIndex !== spell.index) {
        setPendingActionArgs({ type: 'select_spell', spellIndex: spell.index });
        setIsUnsavedChangesDialogOpen(true);
        return;
    }
    const formData: HomebrewSpellFormData = {
        name: spell.name,
        level: spell.level.toString(),
        casting_time: spell.casting_time,
        range: spell.range,
        components: typeof spell.components === 'string' ? spell.components : spell.components.join(', '),
        duration: spell.duration,
        concentration: spell.concentration,
        school: spell.school.name,
        desc: typeof spell.desc === 'string' ? spell.desc : spell.desc.join('\n\n'),
        higher_level: typeof spell.higher_level === 'string' ? spell.higher_level : spell.higher_level?.join('\n\n') || "",
        classes: typeof spell.classes === 'string' ? spell.classes : Array.isArray(spell.classes) ? spell.classes.map(c => typeof c === 'string' ? c : c.name).join(', ') : "",
        subclasses: typeof spell.subclasses === 'string' ? spell.subclasses : Array.isArray(spell.subclasses) ? spell.subclasses.map(sc =>  typeof sc === 'string' ? sc : sc.name).join(', ') : "",
    };
    setHomebrewSpellFormData(formData);
    setInitialEditHomebrewSpellFormData(formData);
    setIsCreatingHomebrewSpell(true);
    setEditingHomebrewSpellIndex(spell.index);
    setIsHomebrewFormDirty(false);
    setOpenAccordionItem(null);
    setError(null);
  };

  const handleExitCreationMode = () => {
    setIsCreatingHomebrewSpell(false);
    setEditingHomebrewSpellIndex(null);
    setHomebrewSpellFormData(initialHomebrewSpellFormData);
    setInitialEditHomebrewSpellFormData(null);
    setIsHomebrewFormDirty(false);
    setError(null);
  };

  const handleUnsavedChangesDialogAction = (action: 'save' | 'discard' | 'cancel') => {
    setIsUnsavedChangesDialogOpen(false);
    if (action === 'save') {
      handleSaveHomebrewSpell();
      
      if (pendingActionArgs && (!error || !homebrewSpellFormData.name.trim())) { 
        if (pendingActionArgs.type === 'select_spell' && pendingActionArgs.spellIndex) {
          const spell = combinedSpells.find(s => s.index === pendingActionArgs.spellIndex);
          fetchSpellDetail(pendingActionArgs.spellIndex, (spell as SpellDetail)?.source || 'api');
        } else if (pendingActionArgs.type === 'create_new') {
          handleOpenCreateHomebrewForm(); 
        }
      }
    } else if (action === 'discard') {
      handleExitCreationMode();
      if (pendingActionArgs) {
        if (pendingActionArgs.type === 'select_spell' && pendingActionArgs.spellIndex) {
          const spell = combinedSpells.find(s => s.index === pendingActionArgs.spellIndex);
          fetchSpellDetail(pendingActionArgs.spellIndex, (spell as SpellDetail)?.source || 'api');
        } else if (pendingActionArgs.type === 'create_new') {
          handleOpenCreateHomebrewForm();
        }
      }
    }
    setPendingActionArgs(null);
  };
  
  const handleOpenDeleteHomebrewConfirm = (spellIndex: string) => {
    setSpellToDeleteIndex(spellIndex);
    setIsDeleteHomebrewConfirmOpen(true);
  };

  const handleConfirmDeleteHomebrew = () => {
    if (!spellToDeleteIndex) return;
    setHomebrewSpells(prev => prev.filter(s => s.index !== spellToDeleteIndex));
    setSpellDetailsCache(prev => {
        const newCache = {...prev};
        delete newCache[spellToDeleteIndex];
        return newCache;
    });
    if (openAccordionItem === spellToDeleteIndex) setOpenAccordionItem(null);
    if (editingHomebrewSpellIndex === spellToDeleteIndex) handleExitCreationMode();
    
    setIsDeleteHomebrewConfirmOpen(false);
    setSpellToDeleteIndex(null);
  };

  const renderSpellDetailContent = (detail: SpellDetail | undefined) => {
    if (!detail) return <p className="text-muted-foreground italic">Details not loaded.</p>;
    const descArray = typeof detail.desc === 'string' ? detail.desc.split('\n\n') : detail.desc;
    const higherLevelArray = typeof detail.higher_level === 'string' ? detail.higher_level?.split('\n\n') : detail.higher_level;
    const classesString = typeof detail.classes === 'string' ? detail.classes : Array.isArray(detail.classes) ? detail.classes.map(c => typeof c === 'string' ? c : c.name).join(", ") : "";
    const subclassesString = typeof detail.subclasses === 'string' ? detail.subclasses : Array.isArray(detail.subclasses) ? detail.subclasses.map(sc => typeof sc === 'string' ? sc : sc.name).join(", ") : "";

    return (
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
            <p><strong>Level:</strong> {detail.level === 0 ? "Cantrip" : detail.level} ({detail.school ? detail.school.name : 'Unknown School'})</p>
            {detail.isHomebrew && (
                <Button variant="ghost" size="sm" onClick={() => handleOpenEditHomebrewForm(detail)}><Edit3 className="mr-1 h-3 w-3"/> Edit Homebrew</Button>
            )}
        </div>
        <p><strong>Casting Time:</strong> {detail.casting_time}</p>
        <p><strong>Range:</strong> {detail.range}</p>
        <p><strong>Components:</strong> {typeof detail.components === 'string' ? detail.components : detail.components.join(", ")} {detail.material && ! (typeof detail.components === 'string' && detail.components.toLowerCase().includes(detail.material.toLowerCase())) ? `(${detail.material})` : ''}</p>
        <p><strong>Duration:</strong> {detail.duration} {detail.concentration && "(Concentration)"}</p>
        
        <div><strong>Description:</strong> {descArray.map((d, i) => <p key={i} className="mt-1">{d}</p>)}</div>
        {higherLevelArray && higherLevelArray.length > 0 && higherLevelArray[0].trim() !== "" && (
          <div><strong>At Higher Levels:</strong> {higherLevelArray.map((hl, i) => <p key={i} className="mt-1">{hl}</p>)}</div>
        )}
        {detail.damage && (
          <div>
            <strong>Damage:</strong>
            {detail.damage.damage_type && <p className="ml-2">Type: {detail.damage.damage_type.name}</p>}
            {detail.damage.damage_at_slot_level && (
              <div className="ml-2">At Slot Level:
                {Object.entries(detail.damage.damage_at_slot_level).map(([slot, dmg]) => <p key={slot} className="ml-2">Level {slot}: {dmg}</p>)}
              </div>
            )}
            {detail.damage.damage_at_character_level && (
               <div className="ml-2">At Character Level (Cantrips):
                {Object.entries(detail.damage.damage_at_character_level).map(([lvl, dmg]) => <p key={lvl} className="ml-2">Level {lvl}: {dmg}</p>)}
              </div>
            )}
          </div>
        )}
         {detail.heal_at_slot_level && (
          <div className="ml-2"><strong>Healing:</strong>
            {Object.entries(detail.heal_at_slot_level).map(([slot, heal]) => <p key={slot} className="ml-2">Level {slot}: {heal}</p>)}
          </div>
        )}
        {detail.area_of_effect && (
          <p><strong>Area of Effect:</strong> {detail.area_of_effect.size} ft {detail.area_of_effect.type}</p>
        )}
         {detail.dc && (
          <p><strong>Saving Throw:</strong> DC {detail.dc.dc_type.name} ({detail.dc.dc_success}) {detail.dc.desc && `- ${detail.dc.desc}`}</p>
        )}
        {classesString && <p><strong>Classes:</strong> {classesString}</p>}
        {subclassesString && <p><strong>Subclasses:</strong> {subclassesString}</p>}
      </div>
    );
  };


  return (
    <>
    <Sheet open={open} onOpenChange={(isOpen) => {
        if (!isOpen && isCreatingHomebrewSpell && isHomebrewFormDirty) {
            setIsUnsavedChangesDialogOpen(true); 
            setPendingActionArgs(null); 
            return; 
        }
        onOpenChange(isOpen);
        if (!isOpen) handleExitCreationMode(); 
    }}>
      <SheetContent
        side="right"
        className="w-[380px] sm:w-[500px] flex flex-col p-0 overflow-hidden"
        hideCloseButton={true}
      >
        <div className="flex flex-col h-full pr-8">
          <SheetHeader className="p-4 border-b bg-primary text-primary-foreground flex-shrink-0 flex flex-row justify-between items-center">
            <SheetTitle className="flex items-center text-xl text-primary-foreground">
              <BookOpen className="mr-2 h-6 w-6" /> Spellbook
            </SheetTitle>
            <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary/80" onClick={() => setShowHomebrewOnly(prev => !prev)}>
                    <Dna className={cn("h-4 w-4", showHomebrewOnly && "text-amber-400")} />
                    <span className="sr-only">{showHomebrewOnly ? "Show All Spells" : "Show Homebrew Only"}</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary/80" onClick={handleOpenCreateHomebrewForm}>
                    <PlusCircle className="h-5 w-5" />
                    <span className="sr-only">Add Homebrew Spell</span>
                </Button>
            </div>
          </SheetHeader>

          {!isCreatingHomebrewSpell && (
            <div className="p-4 border-b">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search spells..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 border-primary focus-visible:ring-primary"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          <div className="flex-grow overflow-y-auto">
            {isCreatingHomebrewSpell ? (
              <ScrollArea className="h-full p-4">
                <div className="space-y-3 text-sm">
                  <h3 className="text-lg font-semibold mb-3">{editingHomebrewSpellIndex ? "Edit Homebrew Spell" : "Create New Homebrew Spell"}</h3>
                  {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">{error}</p>}
                  
                  <div><Label htmlFor="hb-name">Name*</Label><Input id="hb-name" name="name" value={homebrewSpellFormData.name} onChange={handleHomebrewFormChange} /></div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label htmlFor="hb-level">Level (0 for Cantrip)*</Label>
                        <Input id="hb-level" name="level" type="number" min="0" max="9" value={homebrewSpellFormData.level} onChange={handleHomebrewFormChange} />
                    </div>
                    <div>
                      <Label htmlFor="hb-school">School*</Label>
                      <Select name="school" value={homebrewSpellFormData.school} onValueChange={(value) => handleHomebrewSelectChange("school", value || SPELL_SCHOOLS[0])}>
                        <SelectTrigger id="hb-school"><SelectValue /></SelectTrigger>
                        <SelectContent>{SPELL_SCHOOLS.map(school => <SelectItem key={school} value={school}>{school}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div><Label htmlFor="hb-casting-time">Casting Time*</Label><Input id="hb-casting-time" name="casting_time" value={homebrewSpellFormData.casting_time} onChange={handleHomebrewFormChange} /></div>
                  <div><Label htmlFor="hb-range">Range*</Label><Input id="hb-range" name="range" value={homebrewSpellFormData.range} onChange={handleHomebrewFormChange} /></div>
                  <div><Label htmlFor="hb-components">Components* (e.g., V, S, M (holy water))</Label><Input id="hb-components" name="components" value={homebrewSpellFormData.components} onChange={handleHomebrewFormChange} /></div>
                  
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div><Label htmlFor="hb-duration">Duration*</Label><Input id="hb-duration" name="duration" value={homebrewSpellFormData.duration} onChange={handleHomebrewFormChange} /></div>
                    <div className="flex items-center space-x-2 pt-5">
                        <Switch id="hb-concentration" name="concentration" checked={homebrewSpellFormData.concentration} onCheckedChange={(checked) => { setIsHomebrewFormDirty(true); setHomebrewSpellFormData(prev => ({...prev, concentration: checked})); }}/>
                        <Label htmlFor="hb-concentration">Concentration?</Label>
                    </div>
                  </div>

                  <div><Label htmlFor="hb-desc">Description* (Use \\n\\n for new paragraphs)</Label><Textarea id="hb-desc" name="desc" value={homebrewSpellFormData.desc} onChange={handleHomebrewFormChange} rows={5} /></div>
                  <div><Label htmlFor="hb-higher-level">At Higher Levels (Optional, Use \\n\\n for new paragraphs)</Label><Textarea id="hb-higher-level" name="higher_level" value={homebrewSpellFormData.higher_level || ""} onChange={handleHomebrewFormChange} rows={3} /></div>
                  <div><Label htmlFor="hb-classes">Classes (Optional, comma-separated)</Label><Input id="hb-classes" name="classes" value={homebrewSpellFormData.classes || ""} onChange={handleHomebrewFormChange} /></div>
                  <div><Label htmlFor="hb-subclasses">Subclasses (Optional, comma-separated)</Label><Input id="hb-subclasses" name="subclasses" value={homebrewSpellFormData.subclasses || ""} onChange={handleHomebrewFormChange} /></div>
                  
                  <div className="flex gap-2 mt-4 items-center">
                    <Button onClick={handleSaveHomebrewSpell}>
                        <Save className="mr-2 h-4 w-4"/>{editingHomebrewSpellIndex ? "Update Spell" : "Save New Spell"}
                    </Button>
                    <Button variant="outline" onClick={() => {
                        if (isHomebrewFormDirty) {
                            setIsUnsavedChangesDialogOpen(true);
                            setPendingActionArgs(null); 
                        } else {
                            handleExitCreationMode();
                        }
                    }}>
                        Cancel
                    </Button>
                    {editingHomebrewSpellIndex && ( 
                        <Button variant="destructive" onClick={() => handleOpenDeleteHomebrewConfirm(editingHomebrewSpellIndex)} className="ml-auto">
                            <Trash2 className="mr-2 h-4 w-4"/> Delete
                        </Button>
                    )}
                  </div>
                </div>
              </ScrollArea>
            ) : isLoadingList ? (
              <div className="flex items-center justify-center h-full p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading spells...</p>
              </div>
            ) : error && !isCreatingHomebrewSpell ? (
              <div className="p-4 text-center text-destructive">
                <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                <p>{error}</p>
                <Button onClick={fetchSpellsList} variant="outline" className="mt-2">
                  Retry
                </Button>
              </div>
            ) : filteredSpells.length === 0 && searchTerm && !isCreatingHomebrewSpell ? (
                 <p className="p-4 text-center text-muted-foreground">No spells match "{searchTerm}".</p>
            ): filteredSpells.length === 0 && !isCreatingHomebrewSpell ? (
                 <p className="p-4 text-center text-muted-foreground">{showHomebrewOnly ? "No homebrew spells created yet." : "No spells found."}</p>
            ) : (
              <ScrollArea className="h-full">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full p-2"
                  value={openAccordionItem || ""}
                  onValueChange={handleAccordionChange}
                >
                  {filteredSpells.map((spell) => (
                    <AccordionItem value={(spell as SpellDetail).index || spell.name.toLowerCase().replace(/\s+/g, '-')} key={(spell as SpellDetail).index || spell.name.toLowerCase().replace(/\s+/g, '-') + Math.random()} className="border-b border-border last:border-b-0">
                      <AccordionTrigger className="py-3 hover:bg-accent/50 px-2 rounded-md text-base text-left flex justify-between items-center w-full">
                        <span>{spell.name}</span>
                        {(spell as SpellDetail).isHomebrew && <Badge variant="outline" className="ml-2 text-xs border-amber-500 text-amber-600">Homebrew</Badge>}
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-3 px-2">
                        {isLoadingDetail[(spell as SpellDetail).index] ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2 text-muted-foreground" />
                            <span className="text-muted-foreground">Loading details...</span>
                          </div>
                        ) : (
                          renderSpellDetailContent(spellDetailsCache[(spell as SpellDetail).index] || ((spell as SpellDetail)?.isHomebrew ? (spell as SpellDetail) : undefined))
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            )}
          </div>
        </div>
        
        <button
          onClick={() => {
             if (isCreatingHomebrewSpell && isHomebrewFormDirty) {
                setIsUnsavedChangesDialogOpen(true);
                setPendingActionArgs(null); 
             } else {
                onOpenChange(false); 
                handleExitCreationMode();
             }
          }}
          className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]"
          aria-label="Close Spellbook Drawer"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </SheetContent>
    </Sheet>

    <AlertDialog open={isUnsavedChangesDialogOpen} onOpenChange={setIsUnsavedChangesDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes in the spell form. What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => handleUnsavedChangesDialogAction('cancel')}>Cancel</Button>
          <Button variant="destructive" onClick={() => handleUnsavedChangesDialogAction('discard')}>Discard Changes</Button>
          <Button onClick={() => handleUnsavedChangesDialogAction('save')}>{editingHomebrewSpellIndex ? "Save Changes & Continue" : "Save New Spell & Continue"}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={isDeleteHomebrewConfirmOpen} onOpenChange={setIsDeleteHomebrewConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the homebrew spell "{homebrewSpells.find(s => s.index === spellToDeleteIndex)?.name || 'this spell'}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {setSpellToDeleteIndex(null); setIsDeleteHomebrewConfirmOpen(false);}}>Cancel</AlertDialogCancel>
          <Button onClick={handleConfirmDeleteHomebrew} className={cn(buttonVariants({variant: 'destructive'}))}>Delete Spell</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}


// Helper for buttonVariants if used locally
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

