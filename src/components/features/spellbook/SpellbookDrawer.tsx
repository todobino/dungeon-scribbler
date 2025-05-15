
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, ChevronRight, BookOpen, Search } from "lucide-react";
import type { SpellSummary, SpellDetail } from "@/lib/types"; // Ensure these types are defined

interface SpellbookDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DND5E_API_BASE_URL = "https://www.dnd5eapi.co";

export function SpellbookDrawer({ open, onOpenChange }: SpellbookDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [spells, setSpells] = useState<SpellSummary[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellSummary[]>([]);
  const [spellDetailsCache, setSpellDetailsCache] = useState<Record<string, SpellDetail>>({});
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [openAccordionItem, setOpenAccordionItem] = useState<string | null>(null);

  const fetchSpellsList = useCallback(async () => {
    setIsLoadingList(true);
    setError(null);
    try {
      const response = await fetch(`${DND5E_API_BASE_URL}/api/spells`);
      if (!response.ok) {
        throw new Error(`Failed to fetch spells list: ${response.statusText}`);
      }
      const data = await response.json();
      setSpells(data.results || []);
      setFilteredSpells(data.results || []);
    } catch (err: any) {
      setError(err.message || "Could not load spells list.");
      setSpells([]);
      setFilteredSpells([]);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (open && spells.length === 0 && !isLoadingList) {
      fetchSpellsList();
    }
  }, [open, spells.length, fetchSpellsList, isLoadingList]);
  
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSpells(spells);
    } else {
      setFilteredSpells(
        spells.filter(spell =>
          spell.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, spells]);

  const fetchSpellDetail = async (spellIndex: string) => {
    if (spellDetailsCache[spellIndex]) {
      return; // Already fetched
    }
    setIsLoadingDetail(prev => ({ ...prev, [spellIndex]: true }));
    setError(null);
    try {
      const response = await fetch(`${DND5E_API_BASE_URL}/api/spells/${spellIndex}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch details for ${spellIndex}: ${response.statusText}`);
      }
      const data: SpellDetail = await response.json();
      setSpellDetailsCache(prev => ({ ...prev, [spellIndex]: data }));
    } catch (err: any) {
      setError(err.message || `Could not load details for ${spellIndex}.`);
    } finally {
      setIsLoadingDetail(prev => ({ ...prev, [spellIndex]: false }));
    }
  };

  const handleAccordionChange = (value: string) => {
    setOpenAccordionItem(value || null);
    if (value && !spellDetailsCache[value] && !isLoadingDetail[value]) {
      fetchSpellDetail(value);
    }
  };

  const renderSpellDetail = (detail: SpellDetail | undefined) => {
    if (!detail) return <p className="text-muted-foreground italic">Details not loaded.</p>;
    return (
      <div className="space-y-2 text-xs">
        <p><strong>Level:</strong> {detail.level === 0 ? "Cantrip" : detail.level}</p>
        <p><strong>Casting Time:</strong> {detail.casting_time}</p>
        <p><strong>Range:</strong> {detail.range}</p>
        <p><strong>Components:</strong> {detail.components.join(", ")} {detail.material && `(${detail.material})`}</p>
        <p><strong>Duration:</strong> {detail.duration} {detail.concentration && "(Concentration)"}</p>
        <p><strong>School:</strong> {detail.school.name}</p>
        <div><strong>Description:</strong> {detail.desc.map((d, i) => <p key={i} className="mt-1">{d}</p>)}</div>
        {detail.higher_level && detail.higher_level.length > 0 && (
          <div><strong>At Higher Levels:</strong> {detail.higher_level.map((hl, i) => <p key={i} className="mt-1">{hl}</p>)}</div>
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
        {detail.classes.length > 0 && <p><strong>Classes:</strong> {detail.classes.map(c => c.name).join(", ")}</p>}
        {detail.subclasses && detail.subclasses.length > 0 && <p><strong>Subclasses:</strong> {detail.subclasses.map(sc => sc.name).join(", ")}</p>}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[380px] sm:w-[500px] flex flex-col p-0 overflow-hidden"
        hideCloseButton={true}
      >
        <div className="flex flex-col h-full pr-8"> {/* Make space for custom close bar */}
          <SheetHeader className="p-4 border-b bg-primary text-primary-foreground flex-shrink-0">
            <SheetTitle className="flex items-center text-xl text-primary-foreground">
              <BookOpen className="mr-2 h-6 w-6" /> Spellbook
            </SheetTitle>
          </SheetHeader>

          <div className="p-4 border-b">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search spells..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto">
            {isLoadingList ? (
              <div className="flex items-center justify-center h-full p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading spells...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-destructive">
                <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                <p>{error}</p>
                <Button onClick={fetchSpellsList} variant="outline" className="mt-2">
                  Retry
                </Button>
              </div>
            ) : filteredSpells.length === 0 && searchTerm ? (
                 <p className="p-4 text-center text-muted-foreground">No spells match "{searchTerm}".</p>
            ): filteredSpells.length === 0 && spells.length > 0 ? (
                 <p className="p-4 text-center text-muted-foreground">No spells found.</p> // Should not happen if API call succeeded.
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
                    <AccordionItem value={spell.index} key={spell.index} className="border-b border-border last:border-b-0">
                      <AccordionTrigger className="py-3 hover:bg-accent/50 px-2 rounded-md text-base text-left">
                        {spell.name}
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-3 px-2">
                        {isLoadingDetail[spell.index] ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2 text-muted-foreground" />
                            <span className="text-muted-foreground">Loading details...</span>
                          </div>
                        ) : (
                          renderSpellDetail(spellDetailsCache[spell.index])
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
          onClick={() => onOpenChange(false)}
          className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]"
          aria-label="Close Spellbook Drawer"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </SheetContent>
    </Sheet>
  );
}
