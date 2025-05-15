
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MonsterMashDrawer } from "@/components/features/monster-mash/MonsterMashDrawer";
import { CombinedToolDrawer } from "@/components/features/shared/CombinedToolDrawer";
import { TOOLBAR_ITEMS, COMBINED_TOOLS_DRAWER_ID, MONSTER_MASH_DRAWER_ID, DICE_ROLLER_TAB_ID, COMBAT_TRACKER_TAB_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Dice5, Swords, Skull, Hexagon, ListOrdered, ChevronRight, VenetianMask } from "lucide-react";

interface LandedDieState {
  x: number;
  y: number;
  finalX: number;
  finalY: number;
  id: string;
  isSettling: boolean; // True if it needs to animate to its finalX, finalY
}

export function RightDockedToolbar() {
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);
  const [activeCombinedTab, setActiveCombinedTab] = useState<string>(DICE_ROLLER_TAB_ID);

  const [isDraggingDie, setIsDraggingDie] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [justFinishedDrag, setJustFinishedDrag] = useState(false);

  const [landedDie, setLandedDie] = useState<LandedDieState | null>(null);
  const [landedDieTimeoutId, setLandedDieTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [settleDieTimeoutId, setSettleDieTimeoutId] = useState<NodeJS.Timeout | null>(null);


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

    if (landedDie) setLandedDie(null);
    if (landedDieTimeoutId) clearTimeout(landedDieTimeoutId);
    if (settleDieTimeoutId) clearTimeout(settleDieTimeoutId);
    
    setLandedDieTimeoutId(null);
    setSettleDieTimeoutId(null);

    setIsDraggingDie(true);
    setDragPosition({ x: event.clientX, y: event.clientY }); 
    document.body.style.cursor = 'grabbing';
    event.preventDefault();
  }, [landedDie, landedDieTimeoutId, settleDieTimeoutId]);

  const handleMouseUpGlobal = useCallback((event: MouseEvent) => {
    if (isDraggingDie) {
        setIsDraggingDie(false);
        document.body.style.cursor = 'default';

        const releaseX = event.clientX;
        const releaseY = event.clientY;
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * 50; 
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;

        const newLandedDieId = Date.now().toString();
        const newLandedDie: LandedDieState = {
            x: releaseX, // Initial position is exact release point
            y: releaseY,
            finalX: releaseX + offsetX, // Store final target
            finalY: releaseY + offsetY,
            id: newLandedDieId,
            isSettling: true, 
        };
        setLandedDie(newLandedDie);
        
        if (landedDieTimeoutId) clearTimeout(landedDieTimeoutId);
        const newVisibilityTimeoutId = setTimeout(() => {
            setLandedDie(prevLandedDie => {
                if (prevLandedDie && prevLandedDie.id === newLandedDieId) {
                    return null;
                }
                return prevLandedDie;
            });
        }, 5050); // 50ms for settle animation + 5000ms visibility
        setLandedDieTimeoutId(newVisibilityTimeoutId);

        setJustFinishedDrag(true);
        setTimeout(() => setJustFinishedDrag(false), 50); 
    }
  }, [isDraggingDie, landedDieTimeoutId]);

  useEffect(() => {
    const handleMouseMoveGlobal = (event: MouseEvent) => {
      if (isDraggingDie) {
        setDragPosition({ x: event.clientX, y: event.clientY });
      }
    };

    if (isDraggingDie) {
      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUpGlobal);
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      document.body.style.cursor = 'default';
    };
  }, [isDraggingDie, handleMouseUpGlobal]);

  useEffect(() => {
    if (landedDie && landedDie.isSettling) {
      if (settleDieTimeoutId) clearTimeout(settleDieTimeoutId); // Clear previous settle timeout
      const newSettleTimeoutId = setTimeout(() => {
        setLandedDie(prev => {
          if (prev && prev.id === landedDie.id && prev.isSettling) { // Check if it's still the same die and needs settling
            return { ...prev, x: prev.finalX, y: prev.finalY, isSettling: false };
          }
          return prev;
        });
      }, 50); // Quick delay before "moving" to final spot
      setSettleDieTimeoutId(newSettleTimeoutId);
    }
     // Cleanup for settleDieTimeoutId when landedDie becomes null or its ID changes
     return () => {
        if (settleDieTimeoutId) {
            clearTimeout(settleDieTimeoutId);
        }
    };
  }, [landedDie]); // Only re-run if landedDie object itself changes

  useEffect(() => {
    return () => { // Cleanup all timeouts on unmount
        if (landedDieTimeoutId) clearTimeout(landedDieTimeoutId);
        if (settleDieTimeoutId) clearTimeout(settleDieTimeoutId);
    };
  }, [landedDieTimeoutId, settleDieTimeoutId]);


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
          <div className="relative h-14 w-14 flex items-center justify-center">
            <Hexagon className="h-14 w-14 text-primary animate-spin" fill="hsl(var(--primary-foreground))" />
            <span
              className="absolute -top-1 -right-2 text-primary font-bold text-sm"
              style={{ userSelect: 'none' }}
            >
              20
            </span>
          </div>
        </div>
      )}

      {landedDie && !isDraggingDie && (
        <div
          style={{
            position: 'fixed',
            left: landedDie.x,
            top: landedDie.y,
            pointerEvents: 'none', 
            zIndex: 1999, 
            transform: 'translate(-50%, -50%)',
            transition: landedDie.isSettling ? 'none' : 'left 0.1s ease-out, top 0.1s ease-out',
          }}
          className={cn(
            "animate-in fade-in", 
            landedDie.isSettling ? "duration-50" : "duration-100" // Faster fade-in for initial land, slightly slower for final settle if needed, but move is main
          )}
        >
          <div className="relative h-14 w-14 flex items-center justify-center">
            <Hexagon className="h-14 w-14 text-primary" fill="hsl(var(--primary)/ 0.3)" />
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
