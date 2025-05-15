
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MonsterMashDrawer } from "@/components/features/monster-mash/MonsterMashDrawer";
import { CombinedToolDrawer } from "@/components/features/shared/CombinedToolDrawer";
import { TOOLBAR_ITEMS, COMBINED_TOOLS_DRAWER_ID, MONSTER_MASH_DRAWER_ID, DICE_ROLLER_TAB_ID, COMBAT_TRACKER_TAB_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Dice5, Swords, Skull, Hexagon } from "lucide-react"; // Added Hexagon

export function RightDockedToolbar() {
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);
  const [activeCombinedTab, setActiveCombinedTab] = useState<string>(DICE_ROLLER_TAB_ID);

  const [isDraggingDie, setIsDraggingDie] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [justFinishedDrag, setJustFinishedDrag] = useState(false);

  const handleToggleDrawer = (itemId: string) => {
    if (justFinishedDrag) {
      setJustFinishedDrag(false);
      return;
    }
    if (isDraggingDie) return; 

    if (itemId === DICE_ROLLER_TAB_ID || itemId === COMBAT_TRACKER_TAB_ID) {
      const newTab = itemId === DICE_ROLLER_TAB_ID ? DICE_ROLLER_TAB_ID : COMBAT_TRACKER_TAB_ID;
      if (openDrawerId === COMBINED_TOOLS_DRAWER_ID && activeCombinedTab === newTab) {
        setOpenDrawerId(null); 
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

  const handleDragStart = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return; 
    setIsDraggingDie(true);
    setDragPosition({ x: event.clientX, y: event.clientY });
    event.preventDefault();
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setDragPosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseUp = (event: MouseEvent) => {
      setIsDraggingDie(false);
      setJustFinishedDrag(true); 
      // Future: Trigger quick roll logic here
      event.preventDefault();
      setTimeout(() => setJustFinishedDrag(false), 0); // Reset after click event cycle
    };

    if (isDraggingDie) {
      document.body.style.cursor = 'grabbing';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      document.body.style.cursor = 'default';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingDie]);


  return (
    <>
      <TooltipProvider delayDuration={100}>
        <div className="fixed top-1/2 -translate-y-1/2 right-0 flex flex-col gap-1 p-2 bg-card/80 backdrop-blur-sm shadow-lg rounded-l-lg z-50 border border-r-0">
          {TOOLBAR_ITEMS.map((item, index) => {
            const isDiceRollerButton = item.id === DICE_ROLLER_TAB_ID;
            return (
              <React.Fragment key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-12 w-12 rounded-md",
                        (isCombinedToolActive(item.id) || (openDrawerId === MONSTER_MASH_DRAWER_ID && item.id === MONSTER_MASH_DRAWER_ID)) &&
                        "bg-primary/20 text-primary ring-2 ring-primary",
                        isDiceRollerButton && "cursor-grab"
                      )}
                      onClick={() => handleToggleDrawer(item.id)}
                      onMouseDown={isDiceRollerButton ? handleDragStart : undefined}
                      aria-label={item.label}
                    >
                      <item.icon className="h-7 w-7" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" align="center">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
                {item.id === COMBAT_TRACKER_TAB_ID && <Separator className="my-1 bg-border/70" />}
              </React.Fragment>
            );
          })}
        </div>
      </TooltipProvider>

      {isDraggingDie && (
        <div
          style={{
            position: 'fixed',
            left: dragPosition.x, 
            top: dragPosition.y,  
            pointerEvents: 'none', 
            zIndex: 2000, 
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative h-10 w-10 flex items-center justify-center"> {/* Increased size slightly for better visibility */}
            <Hexagon className="h-10 w-10 text-primary animate-spin" fill="hsl(var(--primary-foreground))" /> {/* Fill for better text contrast */}
            <span 
              className="absolute text-primary font-bold text-sm" // Adjusted size and color for visibility
              style={{ userSelect: 'none' }} // Prevent text selection
            >
              20
            </span>
          </div>
        </div>
      )}

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
