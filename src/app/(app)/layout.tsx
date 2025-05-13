"use client"; // Required for useState and event handlers

import { useState } from "react";
import { SidebarNav, MobileSidebarTrigger } from "@/components/layout/sidebar-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CampaignProvider } from "@/contexts/campaign-context";
import { Button } from "@/components/ui/button";
import { Dice5, ListOrdered } from "lucide-react";
import { DiceRollerDrawer } from "@/components/features/dice-roller/DiceRollerDrawer";
import { InitiativeTrackerDrawer } from "@/components/features/initiative-tracker/InitiativeTrackerDrawer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState(false);
  const [isInitiativeTrackerOpen, setIsInitiativeTrackerOpen] = useState(false);

  return (
    <CampaignProvider>
      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen">
          <SidebarNav />
          <MobileSidebarTrigger />
          <SidebarInset className="flex-1">
            <main className="p-4 sm:p-6 lg:p-8 relative"> {/* Added relative for FAB positioning context */}
              {children}
            </main>
          </SidebarInset>
        </div>

        {/* Floating Action Buttons Container */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
          <Button 
            size="icon" 
            className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground" 
            onClick={() => setIsDiceRollerOpen(true)}
            aria-label="Open Dice Roller"
          >
            <Dice5 className="h-7 w-7" />
          </Button>
          <Button 
            size="icon" 
            className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground" 
            onClick={() => setIsInitiativeTrackerOpen(true)}
            aria-label="Open Initiative Tracker"
          >
            <ListOrdered className="h-7 w-7" />
          </Button>
        </div>

        <DiceRollerDrawer open={isDiceRollerOpen} onOpenChange={setIsDiceRollerOpen} />
        <InitiativeTrackerDrawer open={isInitiativeTrackerOpen} onOpenChange={setIsInitiativeTrackerOpen} />
        
      </SidebarProvider>
    </CampaignProvider>
  );
}