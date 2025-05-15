
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MonsterMashDrawer } from "@/components/features/monster-mash/MonsterMashDrawer";
import { CombinedToolDrawer } from "@/components/features/shared/CombinedToolDrawer";
import { TOOLBAR_ITEMS, COMBINED_TOOLS_DRAWER_ID, MONSTER_MASH_DRAWER_ID, DICE_ROLLER_TAB_ID, COMBAT_TRACKER_TAB_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Dice5, Swords, Skull, Hexagon, ListOrdered, ChevronRight } from "lucide-react"; // Added Hexagon

export function RightDockedToolbar() {
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);
  const [activeCombinedTab, setActiveCombinedTab] = useState<string>(DICE_ROLLER_TAB_ID);

  const [isDraggingDie, setIsDraggingDie] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [justFinishedDrag, setJustFinishedDrag] = useState(false);

  // New state for the "landed" die
  const [landedDie, setLandedDie] = useState<{ x: number; y: number; id: string } | null>(null);
  const [landedDieTimeoutId, setLandedDieTimeoutId] = useState<NodeJS.Timeout | null>(null);


  const handleToggleDrawer = (itemId: string) => {
    if (justFinishedDrag) {
      setJustFinishedDrag(false); // Reset flag after one check
      return;
    }
    if (isDraggingDie) return; // Don't open drawer if a drag is in progress

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
    if (event.button !== 0) return; // Only act on left mouse button

    // Clear any existing landed die and its timeout
    if (landedDie) {
        setLandedDie(null);
    }
    if (landedDieTimeoutId) {
        clearTimeout(landedDieTimeoutId);
        setLandedDieTimeoutId(null);
    }

    setIsDraggingDie(true);
    // Initialize dragPosition, though mousemove will update it
    setDragPosition({ x: event.clientX, y: event.clientY }); 
    document.body.style.cursor = 'grabbing';
    event.preventDefault();
  }, [landedDie, landedDieTimeoutId]);


  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (isDraggingDie) {
        setIsDraggingDie(false); // Stop dragging state
        document.body.style.cursor = 'default';

        // Calculate random offset for the "landed" die
        const releaseX = event.clientX;
        const releaseY = event.clientY;
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * 50; // Settle within 50px radius
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;

        const newLandedDie = {
            x: releaseX + offsetX,
            y: releaseY + offsetY,
            id: Date.now().toString(), // Unique ID for this landed die instance
        };

        // Clear any existing timeout for a previous landed die visualization
        if (landedDieTimeoutId) {
            clearTimeout(landedDieTimeoutId);
        }

        setLandedDie(newLandedDie); // Show the landed die

        const newTimeoutId = setTimeout(() => {
            setLandedDie(prevLandedDie => {
                // Only clear if it's the same die that timed out
                if (prevLandedDie && prevLandedDie.id === newLandedDie.id) {
                    return null;
                }
                return prevLandedDie; // Otherwise, keep the current (potentially newer) landed die
            });
            // No need to setLandedDieTimeoutId(null) here, as this specific timeout has fired.
            // It will be nullified if a new drag starts or on unmount.
        }, 5000); // Die disappears after 5 seconds
        setLandedDieTimeoutId(newTimeoutId);

        setJustFinishedDrag(true); // Prevent drawer from opening immediately
        // Short timeout to reset the flag, allowing normal clicks after drag
        setTimeout(() => setJustFinishedDrag(false), 50); 
    }
  }, [isDraggingDie, landedDieTimeoutId]);


  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isDraggingDie) { // Only update if actively dragging
        setDragPosition({ x: event.clientX, y: event.clientY });
      }
    };

    if (isDraggingDie) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      // Ensure cursor is reset if drag ends unexpectedly (e.g., focus loss)
      document.body.style.cursor = 'default';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default'; // Cleanup cursor on component unmount or effect re-run
    };
  }, [isDraggingDie, handleMouseUp]); // handleMouseUp is stable due to useCallback

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
        if (landedDieTimeoutId) {
            clearTimeout(landedDieTimeoutId);
        }
    };
  }, [landedDieTimeoutId]);

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

      {/* Render the dragged icon if dragging */}
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

      {/* Render the landed die if it exists and not currently dragging a new one */}
      {landedDie && !isDraggingDie && (
        <div
          style={{
            position: 'fixed',
            left: landedDie.x,
            top: landedDie.y,
            pointerEvents: 'none', // Allow clicks to pass through to elements underneath if needed
            zIndex: 1999, 
            transform: 'translate(-50%, -50%)',
          }}
          className="animate-in fade-in duration-300" 
        >
          <div className="relative h-14 w-14 flex items-center justify-center">
            {/* Stationary Hexagon, no "20", slightly transparent */}
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
