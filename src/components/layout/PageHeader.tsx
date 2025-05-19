
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, PlusCircle, HelpCircle, Users, type LucideIcon } from "lucide-react";
import { useCampaign } from "@/contexts/campaign-context";
import { NAV_ITEMS, STORY_NAV_ITEMS, WORLD_NAV_ITEMS, ADVANCED_NAV_ITEMS, SETTINGS_NAV_ITEMS, APP_NAME } from "@/lib/constants";
import type { NavItem } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import React, { Suspense, lazy } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";


const allNavItemsFlat: NavItem[] = [
  ...NAV_ITEMS,
  ...STORY_NAV_ITEMS,
  ...WORLD_NAV_ITEMS,
  ...ADVANCED_NAV_ITEMS,
  ...SETTINGS_NAV_ITEMS,
];

interface PageInfo {
  title: string;
  icon?: LucideIcon;
}

function getCurrentPageInfo(pathname: string): PageInfo {
  const activeItem = allNavItemsFlat.find(item => item.href === pathname);
  if (pathname === "/campaign-wizard" && !activeItem) {
    return { title: "Campaign Wizard" };
  }
  if (pathname === "/campaign-management" && !activeItem) {
    return { title: "Campaign Management", icon: Users }; 
  }
  return activeItem ? { title: activeItem.label, icon: activeItem.icon } : { title: "" };
}


const AdventureRecapHelpContent = lazy(() =>
  import("@/app/(app)/story-so-far-refactored/page").then((module) => ({
    default: module.AdventureRecapHelpContent,
  }))
);

const NextSessionGoalsHelpContent = lazy(() =>
  import("@/app/(app)/next-session-goals-refactored/page").then((module) => ({
    default: module.NextSessionGoalsHelpContent,
  }))
);


export function PageHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { campaigns, activeCampaign, setActiveCampaignId, isLoadingCampaigns } = useCampaign();

  const { title: currentPageTitle, icon: CurrentPageIcon } = getCurrentPageInfo(pathname);

  const [isHelpDialogOpen, setIsHelpDialogOpen] = React.useState(false);

  const handleCampaignSelect = (campaignId: string) => {
    setActiveCampaignId(campaignId);
  };

  const handleCreateNewCampaign = () => {
    router.push('/campaign-wizard');
  };
  
  const handleGoToCampaignManagement = () => {
    router.push('/campaign-management');
  };

  const showHelpButton = pathname === "/story-so-far-refactored" || pathname === "/next-session-goals-refactored";

  return (
    <div className="w-full flex items-center h-[3.25rem] px-4 sm:px-6 lg:px-8 border-b bg-primary text-primary-foreground sticky top-0 z-30 shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="px-2 py-1 h-auto text-lg text-primary-foreground hover:bg-primary/80 data-[state=open]:bg-primary/80 focus-visible:ring-0 focus-visible:ring-offset-0">
            {isLoadingCampaigns ? "Loading..." : activeCampaign ? activeCampaign.name : "No Campaign"}
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={handleGoToCampaignManagement}>
            Manage Campaigns
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {campaigns.map((campaign) => (
            <DropdownMenuItem
              key={campaign.id}
              onClick={() => handleCampaignSelect(campaign.id)}
              disabled={campaign.id === activeCampaign?.id}
            >
              {campaign.name}
            </DropdownMenuItem>
          ))}
          {campaigns.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem onClick={handleCreateNewCampaign}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Campaign
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {currentPageTitle && (
        <>
          <ChevronRight className="h-4 w-4 mx-2 text-primary-foreground/70 shrink-0" />
          <div className="flex items-center gap-1.5 flex-shrink min-w-0"> {/* Added flex-shrink and min-w-0 for better truncation handling */}
            {CurrentPageIcon && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                     <CurrentPageIcon className="h-5 w-5 text-primary-foreground/90 shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{currentPageTitle}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <span className="text-lg text-primary-foreground truncate">{currentPageTitle}</span>
          </div>
        </>
      )}
      {showHelpButton && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 text-primary-foreground hover:bg-primary/80" onClick={() => setIsHelpDialogOpen(true)}>
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>How to use this page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <DialogContent className="max-w-lg">
            <Suspense fallback={<div>Loading help...</div>}>
              {pathname === "/story-so-far-refactored" && <AdventureRecapHelpContent />}
              {pathname === "/next-session-goals-refactored" && <NextSessionGoalsHelpContent />}
            </Suspense>
        </DialogContent>
      </Dialog>
    </div>
  );
}
