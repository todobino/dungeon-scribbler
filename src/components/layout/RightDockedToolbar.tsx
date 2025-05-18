
"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CombinedToolDrawer } from "@/components/features/shared/CombinedToolDrawer";
import { MonsterMashDrawer } from "@/components/features/monster-mash/MonsterMashDrawer";
import { StatusConditionsDrawer } from "@/components/features/status-conditions/StatusConditionsDrawer";
import { SpellbookDrawer } from "@/components/features/spellbook/SpellbookDrawer";
import { ItemShopDrawer } from "@/components/features/item-shop/ItemShopDrawer"; // New Import
import { 
  TOOLBAR_ITEMS, 
  COMBINED_TOOLS_DRAWER_ID, 
  MONSTER_MASH_DRAWER_ID, 
  STATUS_CONDITIONS_DRAWER_ID,
  SPELLBOOK_DRAWER_ID,
  ITEM_SHOP_DRAWER_ID, // New Import
  DICE_ROLLER_TAB_ID, 
  COMBAT_TRACKER_TAB_ID 
} from "@/lib/constants";
import type { RollLogEntry, Combatant } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Dice5, Swords, Skull, ShieldQuestion, BookOpen, Store } from "lucide-react"; // New: Store
import { useCampaign } from "@/contexts/campaign-context";

export function RightDockedToolbar() {
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);
  const [activeCombinedTab, setActiveCombinedTab] = useState<string>(DICE_ROLLER_TAB_ID);
  const { notifyEncounterUpdate, notifySavedEncountersUpdate } = useCampaign();

  // State for Dice Roller (lifted)
  const [rollLog, setRollLog] = useState<RollLogEntry[]>([]);
  const getNewRollId = useCallback(() => `${Date.now()}-${Math.random().toString(36).substring(2,7)}`, []);

  const addRollToLog = useCallback((rollData: Omit<RollLogEntry, 'id' | 'isRolling'> & {isRolling?: boolean}, entryIdToUpdate?: string) => {
    const idToUse = entryIdToUpdate || getNewRollId();
    setRollLog(prevLog => {
      const newEntryBase = {
        ...rollData,
        id: idToUse,
        isRolling: rollData.isRolling !== undefined ? rollData.isRolling : false,
      };
      if (entryIdToUpdate && prevLog.find(entry => entry.id === entryIdToUpdate)) {
        return prevLog.map(entry => 
            entry.id === entryIdToUpdate 
            ? newEntryBase 
            : entry
        );
      } else {
        const updatedLog = [newEntryBase, ...prevLog];
        return updatedLog.slice(0, 10); 
      }
    });
  }, [getNewRollId]);

  const handleClearRollLog = useCallback(() => {
    setRollLog([]);
  }, []);

  // State for Combat Tracker (lifted)
  const [combatants, setCombatants] = useState<Combatant[]>([]);

  const handleAddCombatant = useCallback((combatant: Combatant) => {
    setCombatants(prevCombatants => 
        [...prevCombatants, combatant].sort((a, b) => b.initiative - a.initiative || a.name.localeCompare(b.name))
    );
  }, []);

  const handleAddCombatants = useCallback((newCombatants: Combatant[]) => {
    setCombatants(prevCombatants => 
        [...prevCombatants, ...newCombatants].sort((a, b) => b.initiative - a.initiative || a.name.localeCompare(b.name))
    );
  }, []);
  
  const handleRemoveCombatant = useCallback((combatantId: string) => {
    setCombatants(prevCombatants => prevCombatants.filter(c => c.id !== combatantId));
  }, []);

  const handleUpdateCombatantHp = useCallback((combatantId: string, newHp: number) => {
    setCombatants(prevCombatants =>
      prevCombatants.map(c =>
        c.id === combatantId ? { ...c, currentHp: newHp } : c
      )
    );
  }, []);

  const handleEndCombat = useCallback(() => {
    setCombatants([]);
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
    } else if (itemId === MONSTER_MASH_DRAWER_ID || itemId === STATUS_CONDITIONS_DRAWER_ID || itemId === SPELLBOOK_DRAWER_ID || itemId === ITEM_SHOP_DRAWER_ID) {
      setOpenDrawerId(prev => (prev === itemId ? null : itemId));
    }
  };
  
  const isCombinedToolActive = (itemId: string) => {
    return openDrawerId === COMBINED_TOOLS_DRAWER_ID &&
           (itemId === DICE_ROLLER_TAB_ID || itemId === COMBAT_TRACKER_TAB_ID) &&
           activeCombinedTab === itemId;
  };

  const isCombatActive = combatants.length > 0;

  return (
    <>
      <TooltipProvider delayDuration={100}>
        <div className="fixed top-1/2 -translate-y-1/2 right-0 flex flex-col gap-1 p-1.5 bg-card/80 backdrop-blur-sm shadow-lg rounded-l-lg z-50 border border-r-0">
          {TOOLBAR_ITEMS.map((item, index) => {
            let IconToRender = item.icon;
            let iconCn = "h-6 w-6"; 
            let buttonBaseCn = "h-10 w-10 rounded-md"; 
            
            let isActiveTool = isCombinedToolActive(item.id) || 
                                (openDrawerId === MONSTER_MASH_DRAWER_ID && item.id === MONSTER_MASH_DRAWER_ID) ||
                                (openDrawerId === STATUS_CONDITIONS_DRAWER_ID && item.id === STATUS_CONDITIONS_DRAWER_ID) ||
                                (openDrawerId === SPELLBOOK_DRAWER_ID && item.id === SPELLBOOK_DRAWER_ID) ||
                                (openDrawerId === ITEM_SHOP_DRAWER_ID && item.id === ITEM_SHOP_DRAWER_ID);
            
            let isThisCombatTrackerIcon = item.id === COMBAT_TRACKER_TAB_ID;

            let finalButtonCn = cn(
              buttonBaseCn,
              isActiveTool && "bg-primary/20 text-primary ring-2 ring-primary",
              isThisCombatTrackerIcon && isCombatActive && !isActiveTool && "animate-pulse ring-2 ring-destructive bg-destructive/20 text-destructive",
              isThisCombatTrackerIcon && isCombatActive && isActiveTool && "animate-pulse ring-2 ring-destructive" // Keeps pulse if active
            );
            
            const isLastItem = index === TOOLBAR_ITEMS.length - 1;
            const nextItemIsSeparatorTarget = TOOLBAR_ITEMS[index + 1]?.id === MONSTER_MASH_DRAWER_ID || 
                                              TOOLBAR_ITEMS[index + 1]?.id === SPELLBOOK_DRAWER_ID ||
                                              TOOLBAR_ITEMS[index + 1]?.id === ITEM_SHOP_DRAWER_ID; // Added Item Shop

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
                { (item.id === COMBAT_TRACKER_TAB_ID || item.id === MONSTER_MASH_DRAWER_ID || item.id === SPELLBOOK_DRAWER_ID) && !isLastItem && <Separator className="my-0.5 bg-border/70" />}
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
        // Props for Dice Roller
        rollLog={rollLog}
        onInternalRoll={addRollToLog}
        getNewRollId={getNewRollId}
        onClearRollLog={handleClearRollLog}
        // Props for Combat Tracker
        combatants={combatants}
        onAddCombatant={handleAddCombatant}
        onAddCombatants={handleAddCombatants}
        onRemoveCombatant={handleRemoveCombatant}
        onUpdateCombatantHp={handleUpdateCombatantHp}
        onEndCombat={handleEndCombat}
      />
      <MonsterMashDrawer
        open={openDrawerId === MONSTER_MASH_DRAWER_ID}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawerId(null)}
        onEncounterUpdated={notifyEncounterUpdate}
      />
      <StatusConditionsDrawer
        open={openDrawerId === STATUS_CONDITIONS_DRAWER_ID}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawerId(null)}
      />
      <SpellbookDrawer
        open={openDrawerId === SPELLBOOK_DRAWER_ID}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawerId(null)}
      />
      <ItemShopDrawer
        open={openDrawerId === ITEM_SHOP_DRAWER_ID}
        onOpenChange={(isOpen) => !isOpen && setOpenDrawerId(null)}
      />
    </>
  );
}
