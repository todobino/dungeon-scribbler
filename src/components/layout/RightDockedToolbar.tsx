
"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CombinedToolDrawer } from "@/components/features/shared/CombinedToolDrawer";
import { MonsterMashDrawer } from "@/components/features/monster-mash/MonsterMashDrawer";
import { StatusConditionsDrawer } from "@/components/features/status-conditions/StatusConditionsDrawer"; // New Import
import { TOOLBAR_ITEMS, COMBINED_TOOLS_DRAWER_ID, MONSTER_MASH_DRAWER_ID, STATUS_CONDITIONS_DRAWER_ID, DICE_ROLLER_TAB_ID, COMBAT_TRACKER_TAB_ID } from "@/lib/constants"; // Added STATUS_CONDITIONS_DRAWER_ID
import type { RollLogEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Dice5, Swords, Skull, ShieldQuestion } from "lucide-react"; // Added ShieldQuestion

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
        const updatedLog = [newEntry, ...prevLog];
        return updatedLog.slice(0, 10);
      }
    });
  }, [getNewRollId]);

  const handleClearRollLog = useCallback(() => {
    setRollLog([]);
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
    } else if (itemId === STATUS_CONDITIONS_DRAWER_ID) {
      setOpenDrawerId(prev => (prev === STATUS_CONDITIONS_DRAWER_ID ? null : STATUS_CONDITIONS_DRAWER_ID));
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
        <div className="fixed top-1/2 -translate-y-1/2 right-0 flex flex-col gap-1 p-1.5 bg-card/80 backdrop-blur-sm shadow-lg rounded-l-lg z-50 border border-r-0">
          {TOOLBAR_ITEMS.map((item) => {
            let IconToRender = item.icon;
            let iconCn = "h-6 w-6"; 
            let buttonBaseCn = "h-10 w-10 rounded-md"; 
            
            let isActiveTool = isCombinedToolActive(item.id) || 
                                (openDrawerId === MONSTER_MASH_DRAWER_ID && item.id === MONSTER_MASH_DRAWER_ID) ||
                                (openDrawerId === STATUS_CONDITIONS_DRAWER_ID && item.id === STATUS_CONDITIONS_DRAWER_ID);
            
            let finalButtonCn = cn(
              buttonBaseCn,
              isActiveTool && "bg-primary/20 text-primary ring-2 ring-primary"
            );
            
            return (
              <React.Fragment key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"ghost"}
                      size="icon"
                      className={finalButtonCn}
                      onClick={() => handleToggleDrawer(item.id)}
                      aria-label={item.label}
                    >
                      <IconToRender className={iconCn} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" align="center">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
                {item.id === COMBAT_TRACKER_TAB_ID && <Separator className="my-0.5 bg-border/70" />}
                 {item.id === STATUS_CONDITIONS_DRAWER_ID && item.id !== TOOLBAR_ITEMS[TOOLBAR_ITEMS.length -1].id && <Separator className="my-0.5 bg-border/70" />}
              </React.Fragment>
            );
          })}
        </div>
      </TooltipProvider>

      <CombinedToolDrawer
        open={openDrawerId === COMBINED_TOOLS_DRAWER_ID}
        onOpenChange={(isOpen) => {
            if(!isOpen) setOpenDrawerId(null);
        }}
        defaultTab={activeCombinedTab}
        rollLog={rollLog}
        onInternalRoll={(data, entryIdToUpdate) => addRollToLog(data, entryIdToUpdate)}
        getNewRollId={getNewRollId}
        onClearRollLog={handleClearRollLog}
      />
      <MonsterMashDrawer
        open={openDrawerId === MONSTER_MASH_DRAWER_ID}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawerId(null)}
      />
      <StatusConditionsDrawer
        open={openDrawerId === STATUS_CONDITIONS_DRAWER_ID}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawerId(null)}
      />
    </>
  );
}
