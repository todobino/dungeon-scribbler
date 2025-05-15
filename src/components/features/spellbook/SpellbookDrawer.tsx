
"use client";

import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, ChevronRight, BookOpen, Search } from "lucide-react";
// import type { SpellSummary, SpellDetail } from "@/lib/types"; // Future use

interface SpellbookDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DND5E_API_BASE_URL = "https://www.dnd5eapi.co";

export function SpellbookDrawer({ open, onOpenChange }: SpellbookDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  // const [spells, setSpells] = useState<SpellSummary[]>([]); // Future use
  // const [spellDetails, setSpellDetails] = useState<Record<string, SpellDetail>>({}); // Future use
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Placeholder for fetching spell list (would be similar to conditions/monsters)
  useEffect(() => {
    if (open && !isLoading) {
      // Simulate API call or initial setup
      // setIsLoading(true);
      // setTimeout(() => setIsLoading(false), 1000); 
    }
  }, [open, isLoading]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    // Implement search/filtering logic here
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
                onChange={handleSearchChange}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading spells...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-destructive">
                <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                <p>{error}</p>
              </div>
            ) : (
              <ScrollArea className="h-full p-4">
                {/* Placeholder for spell list */}
                <div className="text-center text-muted-foreground py-10">
                  <BookOpen className="mx-auto h-12 w-12 mb-4" />
                  <p className="text-lg font-semibold">Spell List & Details</p>
                  <p className="text-sm">Coming Soon!</p>
                  <p className="text-xs mt-2">Search functionality will filter spells here.</p>
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
        
        {/* Custom Close Button */}
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
