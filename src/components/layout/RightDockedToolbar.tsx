
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CombinedToolDrawer } from "@/components/features/shared/CombinedToolDrawer";
import { MonsterMashDrawer } from "@/components/features/monster-mash/MonsterMashDrawer";
import { TOOLBAR_ITEMS, COMBINED_TOOLS_DRAWER_ID, MONSTER_MASH_DRAWER_ID, DICE_ROLLER_TAB_ID, COMBAT_TRACKER_TAB_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Dice5, Swords, Skull, Hexagon, ChevronRight, VenetianMask, ListOrdered } from "lucide-react"; // Ensure all used icons are here
import { useToast } from "@/hooks/use-toast";
import { rollMultipleDice } from "@/lib/dice-utils";

interface LandedDieState {
  id: string;
  points: { x: number; y: number }[]; // Path: initial release, wobble1, wobble2 (final resting)
  currentPointIndex: number; // 0 for initial, 1 for wobble1, 2 for wobble2/final
  result: number | null;
  isVisible: boolean;
  opacity: number;
}

const QUICK_ROLL_HOLD_TIME_MS = 200;
const QUICK_ROLL_WOBBLE_RADIUS = 75;
const QUICK_ROLL_ANIMATION_STEP_DURATION = 150; // ms per wobble step
const QUICK_ROLL_RESULT_VISIBILITY_MS = 5000;
const LANDED_DIE_SIZE_CLASS = "h-16 w-16"; // Centralized size

export function RightDockedToolbar() {
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);
  const [activeCombinedTab, setActiveCombinedTab] = useState<string>(DICE_ROLLER_TAB_ID);

  const [isDraggingDie, setIsDraggingDie] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  
  const [landedDie, setLandedDie] = useState<LandedDieState | null>(null);
  
  const diceRollerButtonRef = useRef<HTMLButtonElement>(null);
  const dragStartTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const isDragIntendedRef = useRef(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  const handleToggleDrawer = (itemId: string) => {
    if (itemId === DICE_ROLLER_TAB_ID || itemId === COMBAT_TRACKER_TAB_ID) {
      const newTab = itemId;
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

  const clearLandedDie = useCallback(() => {
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
    setLandedDie(null);
  }, []);

  const handleMouseDownDiceRoller = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    // event.preventDefault(); // Keep this if you want to prevent text selection, but it can interfere with click for drawer.
    
    clearLandedDie();
    isDragIntendedRef.current = false;

    dragStartTimeoutIdRef.current = setTimeout(() => {
      isDragIntendedRef.current = true;
      setIsDraggingDie(true);
      setDragPosition({ x: event.clientX, y: event.clientY });
      document.body.style.cursor = 'grabbing';
    }, QUICK_ROLL_HOLD_TIME_MS);
  }, [clearLandedDie]);

  const handleMouseUpDiceRoller = useCallback(() => {
    if (dragStartTimeoutIdRef.current) {
      clearTimeout(dragStartTimeoutIdRef.current);
      dragStartTimeoutIdRef.current = null;
    }
    if (!isDragIntendedRef.current && !isDraggingDie) { // This means it was a quick click
      handleToggleDrawer(DICE_ROLLER_TAB_ID);
    }
    // If it was a drag, global mouseup will handle the die landing
  }, [isDraggingDie, handleToggleDrawer]);


  const handleMouseUpGlobal = useCallback((event: MouseEvent) => {
    if (dragStartTimeoutIdRef.current) { // If mouseup happens before timeout, it's a click
      clearTimeout(dragStartTimeoutIdRef.current);
      dragStartTimeoutIdRef.current = null;
      // Potentially handle click logic here if not already handled by button's onMouseUp
    }

    if (isDraggingDie) {
      setIsDraggingDie(false);
      document.body.style.cursor = 'default';

      const releaseX = event.clientX;
      const releaseY = event.clientY;
      
      const newLandedDieId = Date.now().toString();
      const points = [{ x: releaseX, y: releaseY }]; // Point 0: Initial release point
      
      // Point 1: First wobble
      const angle1 = Math.random() * 2 * Math.PI;
      const radius1 = Math.random() * QUICK_ROLL_WOBBLE_RADIUS;
      points.push({
        x: releaseX + Math.cos(angle1) * radius1,
        y: releaseY + Math.sin(angle1) * radius1,
      });

      // Point 2: Second wobble (will also be final resting place)
      const angle2 = Math.random() * 2 * Math.PI;
      const radius2 = Math.random() * QUICK_ROLL_WOBBLE_RADIUS;
      points.push({
        x: releaseX + Math.cos(angle2) * radius2, // Wobble around original release
        y: releaseY + Math.sin(angle2) * radius2,
      });
      
      setLandedDie({
        id: newLandedDieId,
        points: points,
        currentPointIndex: 0, // Start at initial release point
        result: null,
        isVisible: true,
        opacity: 1, // Start fully visible
      });
    }
    isDragIntendedRef.current = false; // Reset for next interaction
  }, [isDraggingDie, toast]);
  
  useEffect(() => {
    const handleMouseMoveGlobal = (event: MouseEvent) => {
      if (isDraggingDie) {
        setDragPosition({ x: event.clientX, y: event.clientY });
      }
    };

    if (isDraggingDie || dragStartTimeoutIdRef.current) {
      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUpGlobal);
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      document.body.style.cursor = 'default';
      if (dragStartTimeoutIdRef.current) {
        clearTimeout(dragStartTimeoutIdRef.current);
      }
    };
  }, [isDraggingDie, handleMouseUpGlobal]);


  useEffect(() => {
    if (!landedDie || !landedDie.isVisible) return;

    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);

    const animateStep = () => {
      setLandedDie(prevDie => {
        if (!prevDie || !prevDie.isVisible) return prevDie;

        const nextPointIndex = prevDie.currentPointIndex + 1;

        if (nextPointIndex < prevDie.points.length) {
          // Move to the next wobble point
          animationTimeoutRef.current = setTimeout(() => {
            animateStep();
          }, QUICK_ROLL_ANIMATION_STEP_DURATION);
          return { ...prevDie, currentPointIndex: nextPointIndex };
        } else {
          // Reached final point, show result
          if (prevDie.result === null) {
            const d20Roll = rollMultipleDice(1, 20).sum;
            // TODO: Add to Dice Roller Log if drawer is open, or use toast
            // toast({ title: "Quick Roll", description: `d20 Result: ${d20Roll} (Quick-Rolled)` });
            
            visibilityTimeoutRef.current = setTimeout(() => {
              setLandedDie(d => d ? { ...d, opacity: 0 } : null);
              setTimeout(() => clearLandedDie(), 500); // Cleanup after fade
            }, QUICK_ROLL_RESULT_VISIBILITY_MS);
            
            return { ...prevDie, result: d20Roll };
          }
        }
        return prevDie; // No change if already at final step with result
      });
    };

    // Start the animation sequence
    if (landedDie.currentPointIndex < landedDie.points.length) {
       // For the very first step (appearing at release point), no delay
       // For subsequent steps, use QUICK_ROLL_ANIMATION_STEP_DURATION
      const delay = landedDie.currentPointIndex === 0 ? 10 : QUICK_ROLL_ANIMATION_STEP_DURATION;
      animationTimeoutRef.current = setTimeout(animateStep, delay);
    }


    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
    };
  }, [landedDie?.id, landedDie?.currentPointIndex, landedDie?.isVisible, toast, clearLandedDie]); // Depend on id and currentPointIndex


  useEffect(() => { // Cleanup on unmount
    return () => {
      clearLandedDie();
      if (dragStartTimeoutIdRef.current) clearTimeout(dragStartTimeoutIdRef.current);
    };
  }, [clearLandedDie]);

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
                      ref={isDiceRollerButton ? diceRollerButtonRef : null}
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-12 w-12 rounded-md",
                        (isCombinedToolActive(item.id) || (openDrawerId === MONSTER_MASH_DRAWER_ID && item.id === MONSTER_MASH_DRAWER_ID)) &&
                        "bg-primary/20 text-primary ring-2 ring-primary",
                        isDiceRollerButton && "cursor-grab"
                      )}
                      onClick={isDiceRollerButton ? undefined : () => handleToggleDrawer(item.id)}
                      onMouseDown={isDiceRollerButton ? handleMouseDownDiceRoller : undefined}
                      onMouseUp={isDiceRollerButton ? handleMouseUpDiceRoller : undefined}
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
          <div className={cn("relative flex items-center justify-center", LANDED_DIE_SIZE_CLASS)}>
            <Hexagon className={cn("animate-spin text-primary", LANDED_DIE_SIZE_CLASS)} fill="hsl(var(--primary-foreground))" />
            <span
              className="absolute -top-1 -right-2 text-primary font-bold text-sm"
              style={{ userSelect: 'none' }}
            >
              20
            </span>
          </div>
        </div>
      )}

      {landedDie && landedDie.isVisible && (
        <div
          style={{
            position: 'fixed',
            left: landedDie.points[landedDie.currentPointIndex].x,
            top: landedDie.points[landedDie.currentPointIndex].y,
            pointerEvents: 'none',
            zIndex: 1999,
            transform: 'translate(-50%, -50%)',
            transition: `left ${QUICK_ROLL_ANIMATION_STEP_DURATION}ms ease-out, top ${QUICK_ROLL_ANIMATION_STEP_DURATION}ms ease-out, opacity 0.5s ease-out`,
            opacity: landedDie.opacity,
          }}
          className={cn("animate-in fade-in duration-100")}
        >
          <div className={cn("relative flex items-center justify-center", LANDED_DIE_SIZE_CLASS)}>
            <Hexagon className={cn("text-primary", LANDED_DIE_SIZE_CLASS)} fill="hsl(var(--primary)/ 0.3)" />
            {landedDie.result !== null && (
              <span 
                className="absolute text-2xl font-bold text-primary-foreground"
                style={{ textShadow: '0 0 5px hsl(var(--primary))' }}
              >
                {landedDie.result}
              </span>
            )}
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
