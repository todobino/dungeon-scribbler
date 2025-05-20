
"use client";

import React, { useState, useCallback, useRef, useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CombatTrackerDrawer } from "@/components/features/combat-tracker/CombatTrackerDrawer";
import { MonsterMashDrawer } from "@/components/features/monster-mash/MonsterMashDrawer";
import { StatusConditionsDrawer } from "@/components/features/status-conditions/StatusConditionsDrawer";
import { SpellbookDrawer } from "@/components/features/spellbook/SpellbookDrawer";
import { ItemShopDrawer } from "@/components/features/item-shop/ItemShopDrawer";
import {
  TOOLBAR_ITEMS,
  COMBAT_TRACKER_DRAWER_ID,
  MONSTER_MASH_DRAWER_ID,
  STATUS_CONDITIONS_DRAWER_ID,
  SPELLBOOK_DRAWER_ID,
  ITEM_SHOP_DRAWER_ID,
} from "@/lib/constants";
import type { RollLogEntry, Combatant } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Swords, Skull, ShieldQuestion, BookOpen, Store, UserPlus } from "lucide-react"; // Added Swords, Skull, ShieldQuestion, BookOpen, Store
import { useCampaign } from "@/contexts/campaign-context";


export function RightDockedToolbar() {
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);
  const { activeCampaign, notifyEncounterUpdate, notifySavedEncountersUpdate } = useCampaign();

  // Combatants state and handlers are now managed here
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const combatUniqueId = useId();

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

  const handleUpdateCombatant = useCallback((combatantId: string, updates: Partial<Combatant>) => {
    setCombatants(prevCombatants =>
      prevCombatants.map(c =>
        c.id === combatantId ? { ...c, ...updates } : c
      ).sort((a, b) => b.initiative - a.initiative || a.name.localeCompare(b.name))
    );
  }, []);

  const handleEndCombat = useCallback(() => {
    setCombatants([]);
    // Optionally close the Combat Tracker Drawer if desired
    // if (openDrawerId === COMBAT_TRACKER_DRAWER_ID) {
    //   setOpenDrawerId(null);
    // }
  }, []);


  // Roll Log state and handlers are now managed here
  const [rollLog, setRollLog] = useState<RollLogEntry[]>([]);
  const rollIdCounterRef = useRef(0);

  const getNewRollId = useCallback(() => {
    rollIdCounterRef.current += 1;
    return `${Date.now()}-${rollIdCounterRef.current}`;
  }, []);

  const addRollToLog = useCallback((rollData: Omit<RollLogEntry, 'id' | 'isRolling'> & {isRolling?: boolean}, entryIdToUpdate?: string) => {
    const idToUse = entryIdToUpdate || getNewRollId();
    setRollLog(prevLog => {
      const newEntryBase: RollLogEntry = {
        ...rollData,
        id: idToUse,
        isRolling: rollData.isRolling !== undefined ? rollData.isRolling : false,
      };
      if (entryIdToUpdate && prevLog.some(entry => entry.id === entryIdToUpdate)) {
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


  const handleToggleDrawer = (drawerId: string) => {
    setOpenDrawerId(prevId => (prevId === drawerId ? null : drawerId));
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

            let isActiveTool = openDrawerId === item.id;
            let isThisCombatTrackerIcon = item.id === COMBAT_TRACKER_DRAWER_ID;

            let finalButtonCn = cn(
              buttonBaseCn,
              isActiveTool && "bg-primary/20 text-primary ring-2 ring-primary",
              isThisCombatTrackerIcon && isCombatActive && !isActiveTool && "animate-pulse ring-2 ring-destructive bg-destructive/20 text-destructive",
              isThisCombatTrackerIcon && isCombatActive && isActiveTool && "animate-pulse ring-2 ring-destructive"
            );

            const isLastItem = index === TOOLBAR_ITEMS.length - 1;

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
                 {item.id === COMBAT_TRACKER_DRAWER_ID && !isLastItem && <Separator className="my-0.5 bg-border/70" />}
                 {item.id === MONSTER_MASH_DRAWER_ID && !isLastItem && <Separator className="my-0.5 bg-border/70" />}
                 {item.id === SPELLBOOK_DRAWER_ID && !isLastItem && <Separator className="my-0.5 bg-border/70" />}
              </React.Fragment>
            );
          })}
        </div>
      </TooltipProvider>

      <CombatTrackerDrawer
        open={openDrawerId === COMBAT_TRACKER_DRAWER_ID}
        onOpenChange={(isOpen) => {
            if(!isOpen) setOpenDrawerId(null);
        }}
        activeCampaign={activeCampaign}
        combatants={combatants}
        onAddCombatant={handleAddCombatant}
        onAddCombatants={handleAddCombatants}
        onRemoveCombatant={handleRemoveCombatant}
        onUpdateCombatant={handleUpdateCombatant}
        onEndCombat={handleEndCombat}
        rollLog={rollLog}
        onInternalRoll={addRollToLog}
        onClearRollLog={handleClearRollLog}
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
