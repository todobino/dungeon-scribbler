
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MonsterMashDrawer } from "@/components/features/monster-mash/MonsterMashDrawer";
import { CombinedToolDrawer } from "@/components/features/shared/CombinedToolDrawer";
import { TOOLBAR_ITEMS, COMBINED_TOOLS_DRAWER_ID, MONSTER_MASH_DRAWER_ID, DICE_ROLLER_TAB_ID, COMBAT_TRACKER_TAB_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Dice5, Swords, Skull } from "lucide-react"; // Explicitly import icons used by TOOLBAR_ITEMS

export function RightDockedToolbar() {
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);
  const [activeCombinedTab, setActiveCombinedTab] = useState<string>(DICE_ROLLER_TAB_ID);

  const handleToggleDrawer = (itemId: string) => {
    if (itemId === DICE_ROLLER_TAB_ID || itemId === COMBAT_TRACKER_TAB_ID) {
      const newTab = itemId === DICE_ROLLER_TAB_ID ? DICE_ROLLER_TAB_ID : COMBAT_TRACKER_TAB_ID;
      if (openDrawerId === COMBINED_TOOLS_DRAWER_ID && activeCombinedTab === newTab) {
        setOpenDrawerId(null); // Close if same tab in combined drawer is clicked again
      } else {
        setOpenDrawerId(COMBINED_TOOLS_DRAWER_ID);
        setActiveCombinedTab(newTab);
      }
    } else if (itemId === MONSTER_MASH_DRAWER_ID) {
      setOpenDrawerId(prev => (prev === MONSTER_MASH_DRAWER_ID ? null : MONSTER_MASH_DRAWER_ID));
    }
  };

  const isCombinedToolActive = (itemId: string) => {
    return openDrawerId === COMBINED_TOOLS_DRAWER_ID && 
           (itemId === DICE_ROLLER_TAB_ID || itemId === COMBAT_TRACKER_TAB_ID) &&
           activeCombinedTab === itemId;
  };


  return (
    <>
      <TooltipProvider delayDuration={100}>
        <div className="fixed top-1/2 -translate-y-1/2 right-0 flex flex-col gap-1 p-2 bg-card/80 backdrop-blur-sm shadow-lg rounded-l-lg z-50 border border-r-0">
          {TOOLBAR_ITEMS.map((item, index) => (
            <React.Fragment key={item.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-12 w-12 rounded-md", // Increased size
                      (isCombinedToolActive(item.id) || openDrawerId === item.id) && 
                      "bg-primary/20 text-primary ring-2 ring-primary"
                    )}
                    onClick={() => handleToggleDrawer(item.id)}
                    aria-label={item.label}
                  >
                    <item.icon className="h-7 w-7" /> {/* Increased size */}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
              {item.id === COMBAT_TRACKER_TAB_ID && <Separator className="my-1 bg-border/70" />}
            </React.Fragment>
          ))}
        </div>
      </TooltipProvider>

      <CombinedToolDrawer
        open={openDrawerId === COMBINED_TOOLS_DRAWER_ID}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawerId(null)}
        defaultTab={activeCombinedTab}
      />
      <MonsterMashDrawer 
        open={openDrawerId === MONSTER_MASH_DRAWER_ID} 
        onOpenChange={(isOpen) => !isOpen && setOpenDrawerId(null)} 
      />
    </>
  );
}
