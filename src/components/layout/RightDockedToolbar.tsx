
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CombinedToolDrawer } from "@/components/features/shared/CombinedToolDrawer";
import { MonsterMashDrawer } from "@/components/features/monster-mash/MonsterMashDrawer";
import { TOOLBAR_ITEMS, COMBINED_TOOLS_DRAWER_ID, MONSTER_MASH_DRAWER_ID, DICE_ROLLER_TAB_ID, COMBAT_TRACKER_TAB_ID } from "@/lib/constants";
import type { RollLogEntry } from "@/lib/types"; // Make sure RollLogEntry is defined and exported
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Dice5, Swords, Skull, Hexagon, ChevronRight, VenetianMask, ListOrdered } from "lucide-react";
import { rollMultipleDice } from "@/lib/dice-utils";

interface LandedDieState {
  id: string;
  points: { x: number; y: number }[];
  currentPointIndex: number;
  result: number | null;
  isVisible: boolean;
  opacity: number;
  isShrinking: boolean;
}

const QUICK_ROLL_HOLD_TIME_MS = 200;
const QUICK_ROLL_WOBBLE_RADIUS = 75;
const QUICK_ROLL_ANIMATION_STEP_DURATION = 150;
const QUICK_ROLL_RESULT_VISIBILITY_MS = 5000;
const LANDED_DIE_SIZE_CLASS = "h-20 w-20"; // Made slightly larger
const LANDED_DIE_SHRINK_DURATION_MS = 300;

export function RightDockedToolbar() {
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);
  const [activeCombinedTab, setActiveCombinedTab] = useState<string>(DICE_ROLLER_TAB_ID);

  const [isDraggingDie, setIsDraggingDie] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  
  const [landedDie, setLandedDie] = useState<LandedDieState | null>(null);
  
  const diceRollerButtonRef = useRef<HTMLButtonElement>(null);
  const dragStartTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const isDragIntendedRef = useRef(false);
  
  const animationStepTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shrinkClearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lifted state for Dice Roller Log
  const [rollLog, setRollLog] = useState<RollLogEntry[]>([]);

  const addRollToLog = useCallback((rollData: Omit<RollLogEntry, 'id' | 'isRolling'> & {isRolling?: boolean}) => {
    const newEntry: RollLogEntry = {
      id: `${rollData.inputText.replace(/\s/g, '')}-${Date.now()}`,
      ...rollData,
      isRolling: rollData.isRolling !== undefined ? rollData.isRolling : false,
    };
    setRollLog(prevLog => [newEntry, ...prevLog.slice(0, 49)]);
  }, []);

  const updateRollInLog = useCallback((id: string, updatedData: Partial<Omit<RollLogEntry, 'id'>>) => {
    setRollLog(prevLog => prevLog.map(entry => entry.id === id ? {...entry, ...updatedData, isRolling: false } : entry));
  }, []);


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

  const clearLandedDieTimeouts = () => {
    if (animationStepTimeoutRef.current) clearTimeout(animationStepTimeoutRef.current);
    if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
    if (shrinkClearTimeoutRef.current) clearTimeout(shrinkClearTimeoutRef.current);
  };
  
  const clearLandedDie = useCallback(() => {
    clearLandedDieTimeouts();
    setLandedDie(null);
  }, []);

  const handleMouseDownDiceRoller = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    
    clearLandedDie();
    isDragIntendedRef.current = false; // Reset intention

    if (dragStartTimeoutIdRef.current) clearTimeout(dragStartTimeoutIdRef.current);
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
    if (!isDragIntendedRef.current && !isDraggingDie) { 
      handleToggleDrawer(DICE_ROLLER_TAB_ID);
    }
    // If it was a drag, global mouseup handles the die landing
    // isDragIntendedRef will be reset in handleMouseUpGlobal
  }, [isDraggingDie, handleToggleDrawer]);


  const handleMouseUpGlobal = useCallback((event: MouseEvent) => {
    if (dragStartTimeoutIdRef.current) { 
      clearTimeout(dragStartTimeoutIdRef.current);
      dragStartTimeoutIdRef.current = null;
    }

    if (isDraggingDie) {
      setIsDraggingDie(false);
      document.body.style.cursor = 'default';

      const releaseX = event.clientX;
      const releaseY = event.clientY;
      
      const newLandedDieId = `die-${Date.now()}`;
      const points = [{ x: releaseX, y: releaseY }]; 
      
      for (let i = 0; i < 2; i++) { // Two wobble points
          const angle = Math.random() * 2 * Math.PI;
          const radius = Math.random() * QUICK_ROLL_WOBBLE_RADIUS;
          points.push({
            x: releaseX + Math.cos(angle) * radius,
            y: releaseY + Math.sin(angle) * radius,
          });
      }
      // The last point in 'points' is the final resting spot after wobbles.
      
      clearLandedDieTimeouts(); // Clear any previous timeouts before setting a new die
      setLandedDie({
        id: newLandedDieId,
        points: points,
        currentPointIndex: 0,
        result: null,
        isVisible: true,
        opacity: 1,
        isShrinking: false,
      });
    }
    isDragIntendedRef.current = false; 
  }, [isDraggingDie, addRollToLog]); 
  
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
    if (!landedDie || !landedDie.isVisible || landedDie.isShrinking) return;

    clearLandedDieTimeouts(); // Clear previous timeouts relevant to animation steps or visibility

    const animateStep = () => {
      setLandedDie(prevDie => {
        if (!prevDie || !prevDie.isVisible || prevDie.isShrinking || prevDie.id !== landedDie.id) return prevDie;

        const nextPointIndex = prevDie.currentPointIndex + 1;

        if (nextPointIndex < prevDie.points.length) {
          animationStepTimeoutRef.current = setTimeout(animateStep, QUICK_ROLL_ANIMATION_STEP_DURATION);
          return { ...prevDie, currentPointIndex: nextPointIndex };
        } else { // Reached final point (prevDie.points.length - 1)
          if (prevDie.result === null) { // Roll and display result if not already done
            const d20Result = rollMultipleDice(1, 20).sum;
            
            addRollToLog({
              inputText: "d20 (Quick Roll)",
              resultText: d20Result.toString(),
              detailText: `Rolled 1d20: [${d20Result}] = ${d20Result}`,
              isRolling: false,
            });
            
            // Set visibility timeout AFTER result is displayed
            visibilityTimeoutRef.current = setTimeout(() => {
              setLandedDie(d => d && d.id === prevDie.id ? { ...d, isShrinking: true, opacity: 0 } : null);
              shrinkClearTimeoutRef.current = setTimeout(() => {
                 setLandedDie(d => d && d.id === prevDie.id ? null : d); // Fully remove if it's still this die
              }, LANDED_DIE_SHRINK_DURATION_MS);
            }, QUICK_ROLL_RESULT_VISIBILITY_MS);
            
            return { ...prevDie, result: d20Result };
          }
        }
        return prevDie; 
      });
    };
    
    // Initial placement or start of wobble sequence
    const initialDelay = landedDie.currentPointIndex === 0 ? 10 : QUICK_ROLL_ANIMATION_STEP_DURATION;
    animationStepTimeoutRef.current = setTimeout(animateStep, initialDelay);

    return () => { // Cleanup for this effect instance
      clearLandedDieTimeouts();
    };
  }, [landedDie?.id, landedDie?.currentPointIndex, landedDie?.isVisible, landedDie?.isShrinking, addRollToLog]);


  useEffect(() => { 
    return () => {
      clearLandedDie(); // Clear on unmount
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
                        "h-12 w-12 rounded-md", // Icon size set here
                        (isCombinedToolActive(item.id) || (openDrawerId === MONSTER_MASH_DRAWER_ID && item.id === MONSTER_MASH_DRAWER_ID)) &&
                        "bg-primary/20 text-primary ring-2 ring-primary",
                        isDiceRollerButton && "cursor-grab"
                      )}
                      onClick={isDiceRollerButton ? undefined : () => handleToggleDrawer(item.id)}
                      onMouseDown={isDiceRollerButton ? handleMouseDownDiceRoller : undefined}
                      onMouseUp={isDiceRollerButton ? handleMouseUpDiceRoller : undefined}
                      aria-label={item.label}
                    >
                      <item.icon className="h-7 w-7" /> {/* Icon visual size */}
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
            transform: `translate(-50%, -50%) scale(${landedDie.isShrinking ? 0 : 1})`,
            transition: `left ${QUICK_ROLL_ANIMATION_STEP_DURATION}ms ease-out, top ${QUICK_ROLL_ANIMATION_STEP_DURATION}ms ease-out, opacity ${LANDED_DIE_SHRINK_DURATION_MS}ms ease-out, transform ${LANDED_DIE_SHRINK_DURATION_MS}ms ease-out`,
            opacity: landedDie.opacity,
          }}
          className={cn("animate-in fade-in duration-100")} // Initial fade-in
        >
          <div className={cn("relative flex items-center justify-center", LANDED_DIE_SIZE_CLASS)}>
            <Hexagon className={cn("text-primary", LANDED_DIE_SIZE_CLASS)} fill="hsl(var(--primary)/ 0.3)" />
            {landedDie.result !== null && !landedDie.isShrinking && (
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
        rollLog={rollLog}
        onInternalRoll={(data, idToUpdate) => {
          if (idToUpdate) {
            updateRollInLog(idToUpdate, data);
          } else {
            addRollToLog(data);
          }
        }}
        getNewRollId={() => `${Date.now()}-${Math.random().toString(36).substring(2,7)}`}
        onClearRollLog={() => setRollLog([])}
      />
      <MonsterMashDrawer
        open={openDrawerId === MONSTER_MASH_DRAWER_ID}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawerId(null)}
      />
    </>
  );
}
