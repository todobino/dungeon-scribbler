
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CombinedToolDrawer } from "@/components/features/shared/CombinedToolDrawer";
import { MonsterMashDrawer } from "@/components/features/monster-mash/MonsterMashDrawer";
import { TOOLBAR_ITEMS, COMBINED_TOOLS_DRAWER_ID, MONSTER_MASH_DRAWER_ID, DICE_ROLLER_TAB_ID, COMBAT_TRACKER_TAB_ID } from "@/lib/constants";
import type { RollLogEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Dice5, Swords, Skull, VenetianMask, ChevronRight, XCircle, Hexagon } from "lucide-react"; 
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
const LANDED_DIE_SIZE_CLASS = "h-20 w-20"; 
const LANDED_DIE_SHRINK_DURATION_MS = 300;

export function RightDockedToolbar() {
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);
  const [activeCombinedTab, setActiveCombinedTab] = useState<string>(DICE_ROLLER_TAB_ID);

  const [rollLog, setRollLog] = useState<RollLogEntry[]>([]);
  const getNewRollId = useCallback(() => `${Date.now()}-${Math.random().toString(36).substring(2,7)}`, []);

  const addRollToLog = useCallback((rollData: Omit<RollLogEntry, 'id' | 'isRolling'> & {isRolling?: boolean}, entryIdToUpdate?: string) => {
    const idToUse = entryIdToUpdate || getNewRollId();
    
    setRollLog(prevLog => {
      if (entryIdToUpdate && prevLog.find(entry => entry.id === entryIdToUpdate)) {
        return prevLog.map(entry => 
            entry.id === entryIdToUpdate 
            ? {...entry, ...rollData, isRolling: false } 
            : entry
        );
      } else {
        const newEntry: RollLogEntry = {
            id: idToUse,
            ...rollData,
            isRolling: rollData.isRolling !== undefined ? rollData.isRolling : false,
        };
        return [newEntry, ...prevLog.slice(0, 49)];
      }
    });
  }, [getNewRollId]);


  const [isDraggingDie, setIsDraggingDie] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [landedDie, setLandedDie] = useState<LandedDieState | null>(null);
  const [isDragOverCancelArea, setIsDragOverCancelArea] = useState(false);

  const diceRollerButtonRef = useRef<HTMLButtonElement>(null);
  const dragStartTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const isDragIntendedRef = useRef(false); 
  
  const animationStepTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shrinkClearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearLandedDieTimeouts = () => {
    if (animationStepTimeoutRef.current) clearTimeout(animationStepTimeoutRef.current);
    if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
    if (shrinkClearTimeoutRef.current) clearTimeout(shrinkClearTimeoutRef.current);
  };
  
  const clearLandedDie = useCallback(() => {
    clearLandedDieTimeouts();
    setLandedDie(null);
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

  const handleMouseDownDiceRoller = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return; 
    
    clearLandedDie(); 
    isDragIntendedRef.current = false; 

    if (dragStartTimeoutIdRef.current) {
      clearTimeout(dragStartTimeoutIdRef.current);
      dragStartTimeoutIdRef.current = null;
    }

    dragStartTimeoutIdRef.current = setTimeout(() => {
      isDragIntendedRef.current = true; 
      setIsDraggingDie(true);
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
  }, [handleToggleDrawer, isDraggingDie]);


  const handleMouseMoveGlobal = useCallback((event: MouseEvent) => {
      if (isDraggingDie) {
        setDragPosition({ x: event.clientX, y: event.clientY });
        if (diceRollerButtonRef.current) {
          const buttonRect = diceRollerButtonRef.current.getBoundingClientRect();
          const currentlyOverCancelArea = 
            event.clientX >= buttonRect.left &&
            event.clientX <= buttonRect.right &&
            event.clientY >= buttonRect.top &&
            event.clientY <= buttonRect.bottom;
          setIsDragOverCancelArea(currentlyOverCancelArea);
        } else {
           setIsDragOverCancelArea(false);
        }
      }
    }, [isDraggingDie]);

  const handleMouseUpGlobal = useCallback((event: MouseEvent) => {
    if (dragStartTimeoutIdRef.current) {
      clearTimeout(dragStartTimeoutIdRef.current);
      dragStartTimeoutIdRef.current = null;
    }

    if (isDraggingDie) {
      document.body.style.cursor = 'default';
      
      const buttonRect = diceRollerButtonRef.current?.getBoundingClientRect();
      const releasedOverCancelArea = buttonRect &&
        event.clientX >= buttonRect.left &&
        event.clientX <= buttonRect.right &&
        event.clientY >= buttonRect.top &&
        event.clientY <= buttonRect.bottom;

      if (releasedOverCancelArea && isDragIntendedRef.current) { // Drag was intended and released on cancel area
        clearLandedDie();
      } else if (isDragIntendedRef.current) { // Drag was intended and released elsewhere
        const releaseX = event.clientX;
        const releaseY = event.clientY;
        
        const points = [
          { x: releaseX, y: releaseY }, 
          { x: releaseX + (Math.random() - 0.5) * 2 * QUICK_ROLL_WOBBLE_RADIUS, y: releaseY + (Math.random() - 0.5) * 2 * QUICK_ROLL_WOBBLE_RADIUS }, 
          { x: releaseX + (Math.random() - 0.5) * 2 * QUICK_ROLL_WOBBLE_RADIUS, y: releaseY + (Math.random() - 0.5) * 2 * QUICK_ROLL_WOBBLE_RADIUS }
        ];
        
        clearLandedDieTimeouts();
        setLandedDie({
          id: `die-${Date.now()}`,
          points: points,
          currentPointIndex: 0,
          result: null,
          isVisible: true,
          opacity: 1,
          isShrinking: false,
        });
      }
      
      setIsDraggingDie(false);
      setIsDragOverCancelArea(false);
    }
    isDragIntendedRef.current = false; 
    document.body.style.cursor = 'default';
  }, [isDraggingDie, clearLandedDie, addRollToLog, getNewRollId]); 
  
  useEffect(() => {
    const currentMouseMove = (e: MouseEvent) => handleMouseMoveGlobal(e);
    const currentMouseUp = (e: MouseEvent) => handleMouseUpGlobal(e);

    if (isDraggingDie) {
      document.body.style.cursor = 'grabbing';
      window.addEventListener('mousemove', currentMouseMove);
      window.addEventListener('mouseup', currentMouseUp);
    } else {
      document.body.style.cursor = 'default';
      window.removeEventListener('mousemove', currentMouseMove);
      window.removeEventListener('mouseup', currentMouseUp);
      setIsDragOverCancelArea(false); 
    }

    return () => {
      document.body.style.cursor = 'default';
      window.removeEventListener('mousemove', currentMouseMove);
      window.removeEventListener('mouseup', currentMouseUp);
      if (dragStartTimeoutIdRef.current) {
        clearTimeout(dragStartTimeoutIdRef.current);
        dragStartTimeoutIdRef.current = null;
      }
    };
  }, [isDraggingDie, handleMouseMoveGlobal, handleMouseUpGlobal]);

  useEffect(() => {
    if (!landedDie || !landedDie.isVisible || landedDie.isShrinking) return;

    clearLandedDieTimeouts(); 

    const animateStep = () => {
      setLandedDie(prevDie => {
        if (!prevDie || !prevDie.isVisible || prevDie.isShrinking || prevDie.id !== landedDie.id) return prevDie;

        const nextPointIndex = prevDie.currentPointIndex + 1;

        if (nextPointIndex < prevDie.points.length) {
          animationStepTimeoutRef.current = setTimeout(animateStep, QUICK_ROLL_ANIMATION_STEP_DURATION);
          return { ...prevDie, currentPointIndex: nextPointIndex };
        } else { 
          if (prevDie.result === null) { 
            const d20Result = rollMultipleDice(1, 20).sum;
            
            addRollToLog({
                inputText: "d20 (Quick Roll)",
                resultText: d20Result.toString(),
                detailText: `Rolled 1d20 (Quick): [${d20Result}] = ${d20Result}`,
                rolls: [d20Result],
                modifier: 0,
                sides: 20,
            });
            
            visibilityTimeoutRef.current = setTimeout(() => {
              setLandedDie(d => d && d.id === prevDie.id ? { ...d, isShrinking: true, opacity: 0 } : null);
              shrinkClearTimeoutRef.current = setTimeout(() => {
                 setLandedDie(d => d && d.id === prevDie.id ? null : d);
              }, LANDED_DIE_SHRINK_DURATION_MS);
            }, QUICK_ROLL_RESULT_VISIBILITY_MS);
            
            return { ...prevDie, result: d20Result };
          }
        }
        return prevDie; 
      });
    };
    
    const initialDelay = landedDie.currentPointIndex === 0 ? 10 : QUICK_ROLL_ANIMATION_STEP_DURATION;
    animationStepTimeoutRef.current = setTimeout(animateStep, initialDelay);

    return () => { 
      clearLandedDieTimeouts(); 
    };
  }, [landedDie?.id, landedDie?.currentPointIndex, landedDie?.isVisible, landedDie?.isShrinking, addRollToLog]); 

  useEffect(() => { 
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
            const isDiceRollerItem = item.id === DICE_ROLLER_TAB_ID;
            let IconToRender = item.icon;
            let iconCn = "h-7 w-7";
            let buttonBaseCn = "h-12 w-12 rounded-md";
            
            const isActiveTool = isCombinedToolActive(item.id) || (openDrawerId === MONSTER_MASH_DRAWER_ID && item.id === MONSTER_MASH_DRAWER_ID);
            
            let finalButtonCn = cn(
              buttonBaseCn,
              isActiveTool && "bg-primary/20 text-primary ring-2 ring-primary"
            );

            if (isDiceRollerItem) {
              finalButtonCn = cn(finalButtonCn, "cursor-grab");
              if (isDraggingDie) {
                IconToRender = XCircle; 
                if (isDragOverCancelArea) {
                  finalButtonCn = cn(buttonBaseCn, "bg-destructive text-destructive-foreground hover:bg-destructive/90");
                  iconCn = cn(iconCn, "text-destructive-foreground"); 
                } else if (isActiveTool) { // Maintain active style if dragging but not over cancel area
                   finalButtonCn = cn(buttonBaseCn, "bg-primary/20 text-primary ring-2 ring-primary");
                }
              }
            }
            
            return (
              <React.Fragment key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      ref={isDiceRollerItem ? diceRollerButtonRef : null}
                      variant={"ghost"}
                      size="icon"
                      className={finalButtonCn}
                      onClick={isDiceRollerItem ? undefined : () => handleToggleDrawer(item.id)}
                      onMouseDown={isDiceRollerItem ? handleMouseDownDiceRoller : undefined}
                      onMouseUp={isDiceRollerItem ? handleMouseUpDiceRoller : undefined}
                      aria-label={item.label}
                    >
                      <IconToRender className={iconCn} />
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
          className={cn(landedDie.currentPointIndex === 0 && "animate-in fade-in duration-50")}
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
        onOpenChange={(isOpen) => {
            if(!isOpen) setOpenDrawerId(null);
        }}
        defaultTab={activeCombinedTab}
        rollLog={rollLog}
        onInternalRoll={(data, entryIdToUpdate) => addRollToLog(data, entryIdToUpdate)}
        getNewRollId={getNewRollId}
        onClearRollLog={() => setRollLog([])}
      />
      <MonsterMashDrawer
        open={openDrawerId === MONSTER_MASH_DRAWER_ID}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawerId(null)}
      />
    </>
  );
}
