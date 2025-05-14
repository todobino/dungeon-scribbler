
"use client";

import type { PlayerCharacter } from "@/lib/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, APP_NAME, ADVANCED_NAV_ITEMS, SETTINGS_NAV_ITEMS, WORLD_NAV_ITEMS, STORY_NAV_ITEMS, type NavItem } from "@/lib/constants";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useCampaign } from "@/contexts/campaign-context";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users, Edit3 } from "lucide-react"; 
import React, { useState } from "react";
import { CharacterDetailsDialog } from "@/components/features/party-manager/character-details-dialog";

export function SidebarNav() {
  const pathname = usePathname();
  const { activeCampaign, activeCampaignParty, isLoadingCampaigns, isLoadingParty } = useCampaign();
  const [isCharacterDetailsDialogOpen, setIsCharacterDetailsDialogOpen] = useState(false);
  const [characterForDetails, setCharacterForDetails] = useState<PlayerCharacter | null>(null);

  const openCharacterDetailsDialog = (character: PlayerCharacter) => {
    setCharacterForDetails(character);
    setIsCharacterDetailsDialogOpen(true);
  };

  const renderNavItems = (items: NavItem[], title?: string) => (
    <>
      {title && (
        <SidebarMenuLabel className="px-2 pt-4 pb-1 text-sm font-semibold text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
          {title}
        </SidebarMenuLabel>
      )}
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Button
              asChild
              variant={pathname === item.href ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === item.href
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
              )}
              disabled={item.disabled}
              title={item.label}
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="ml-3 group-data-[collapsible=icon]:hidden truncate">
                  {item.label}
                </span>
                {item.isGenAI && <Badge variant="outline" className="ml-auto group-data-[collapsible=icon]:hidden bg-primary/20 border-primary text-primary text-xs px-1.5 py-0.5">AI</Badge>}
              </Link>
            </Button>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </>
  );
  
  const SidebarMenuLabel = ({className, children}: {className?: string; children: React.ReactNode}) => (
    <div className={cn("group-data-[collapsible=icon]:hidden", className)}>
        {children}
    </div>
  );


  return (
    <>
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/campaign-management" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Image src="https://picsum.photos/seed/dungeonsidebar/40/40" alt="Logo" width={32} height={32} className="rounded-md" data-ai-hint="fantasy scroll"/>
          <SidebarMenuLabel>
            <h1 className="text-xl font-semibold text-sidebar-foreground whitespace-nowrap">
              {APP_NAME}
            </h1>
          </SidebarMenuLabel>
        </Link>
      </SidebarHeader>
      <ScrollArea className="flex-grow">
        <SidebarContent className="p-2">
          {/* Active Campaign Info and Party List */}
          <div className="mb-2 group-data-[collapsible=icon]:hidden">
            <SidebarMenuLabel className="px-2 pt-2 pb-1 text-xs font-medium text-sidebar-foreground/60">
              ACTIVE CAMPAIGN
            </SidebarMenuLabel>
            <Button 
              asChild 
              variant={pathname === '/campaign-management' ? 'secondary' : 'ghost'}
              className="w-full justify-start text-sm py-2 px-2 mb-1 h-auto group-data-[collapsible=icon]:hidden"
              title={activeCampaign ? activeCampaign.name : "No Active Campaign"}
            >
                <Link href="/campaign-management" className="truncate">
                   {isLoadingCampaigns ? "Loading..." : activeCampaign ? activeCampaign.name : "No Campaign Selected"}
                </Link>
            </Button>

            {activeCampaign && (
              <Accordion type="single" collapsible className="w-full text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                <AccordionItem value="party-list" className="border-none">
                  <div className="flex items-center justify-between py-1 px-2 hover:bg-sidebar-accent rounded-md group-data-[collapsible=icon]:hidden">
                    <AccordionTrigger className="flex-grow p-0 text-left hover:no-underline data-[state=open]:bg-transparent hover:bg-transparent">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-sidebar-foreground/80" />
                        <span>Current Party ({activeCampaignParty.length})</span>
                      </div>
                    </AccordionTrigger>
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-sidebar-foreground/80 hover:text-sidebar-foreground focus-visible:ring-0 focus-visible:ring-offset-0 shrink-0"
                        aria-label="Edit Party"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href="/party-manager">
                          <Edit3 className="h-4 w-4" />
                        </Link>
                      </Button>
                  </div>
                  <AccordionContent className="pt-1 pb-0 pl-1 pr-1 text-xs">
                    {isLoadingParty ? (
                      <p className="text-sidebar-foreground/70 py-1 px-1">Loading party...</p>
                    ) : activeCampaignParty.length === 0 ? (
                      <p className="text-sidebar-foreground/70 py-1 px-1">No characters in party.</p>
                    ) : (
                      <ul className="space-y-1 max-h-64 overflow-y-auto"> {/* Adjusted max-h */}
                        {activeCampaignParty.map(char => (
                          <li 
                            key={char.id} 
                            className="relative p-1.5 pl-3 rounded hover:bg-sidebar-accent/80 text-sidebar-foreground/90 cursor-pointer"
                            onClick={() => openCharacterDetailsDialog(char)}
                            title={`View ${char.name} details`}
                          >
                            <div 
                              className="absolute left-0 top-0 bottom-0 w-1 rounded-l" 
                              style={{ backgroundColor: char.color || 'hsl(var(--sidebar-border))' }}
                            />
                            <div className="font-medium truncate">{char.name}</div>
                            <div className="text-xs text-sidebar-foreground/70 truncate">Lvl {char.level} {char.class} - AC: {char.armorClass}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
          
          <SidebarSeparator className="my-1 group-data-[collapsible=icon]:hidden" />
          
          {renderNavItems(STORY_NAV_ITEMS, "Story Tools")}
          <SidebarSeparator className="my-2" />

          {renderNavItems(WORLD_NAV_ITEMS, "World Management")}
          <SidebarSeparator className="my-2" />
          
          {renderNavItems(NAV_ITEMS.filter(item => item.href !== '/campaign-management'), "Core Features")}
          <SidebarSeparator className="my-2" />
          {renderNavItems(ADVANCED_NAV_ITEMS, "Advanced Tools")}
        </SidebarContent>
      </ScrollArea>
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        {renderNavItems(SETTINGS_NAV_ITEMS)}
      </SidebarFooter>
    </Sidebar>
    <CharacterDetailsDialog
        character={characterForDetails}
        isOpen={isCharacterDetailsDialogOpen}
        onOpenChange={setIsCharacterDetailsDialogOpen}
    />
    </>
  );
}

export function MobileSidebarTrigger() {
    return <SidebarTrigger className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm" />;
}

