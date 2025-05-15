
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DiceRollerDrawer } from "@/components/features/dice-roller/DiceRollerDrawer";
import { InitiativeTrackerDrawer } from "@/components/features/initiative-tracker/InitiativeTrackerDrawer";
import { MonsterMashDrawer } from "@/components/features/monster-mash/MonsterMashDrawer";
import { TOOLBAR_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Dice5, Swords, Skull, ChevronRight } from "lucide-react"; // Explicitly import icons

export function RightDockedToolbar() {
  const [openDrawer, setOpenDrawer] = useState<string | null>(null);

  const handleToggleDrawer = (drawerId: string) => {
    setOpenDrawer(prev => (prev === drawerId ? null : drawerId));
  };

  return (
    <>
      <TooltipProvider delayDuration={100}>
        <div className="fixed top-1/2 -translate-y-1/2 right-0 flex flex-col gap-2 p-2 bg-card/80 backdrop-blur-sm shadow-lg rounded-l-lg z-50 border border-r-0">
          {TOOLBAR_ITEMS.map(item => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-12 w-12 rounded-md",
                    openDrawer === item.id && "bg-primary/20 text-primary ring-2 ring-primary"
                  )}
                  onClick={() => handleToggleDrawer(item.id)}
                  aria-label={item.label}
                >
                  <item.icon className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" align="center">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      <DiceRollerDrawer 
        open={openDrawer === 'dice-roller'} 
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)} 
      />
      <InitiativeTrackerDrawer 
        open={openDrawer === 'initiative-tracker'} 
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)} 
      />
      <MonsterMashDrawer 
        open={openDrawer === 'monster-mash'} 
        onOpenChange={(isOpen) => !isOpen && setOpenDrawer(null)} 
      />
    </>
  );
}
