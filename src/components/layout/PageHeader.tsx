
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, PlusCircle } from "lucide-react";
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

const allNavItems: NavItem[] = [
  ...NAV_ITEMS,
  ...STORY_NAV_ITEMS,
  ...WORLD_NAV_ITEMS,
  ...ADVANCED_NAV_ITEMS,
  ...SETTINGS_NAV_ITEMS,
];

function getCurrentPageTitle(pathname: string): string {
  const activeItem = allNavItems.find(item => item.href === pathname);
  // Handle campaign wizard page title explicitly if not in nav items
  if (pathname === "/campaign-wizard" && !activeItem) {
    return "Campaign Wizard";
  }
  if (pathname === "/campaign-management" && !activeItem) {
    // For campaign management, it might be better to not show a page title if activeCampaign name is already there.
    // Or, show "Manage Campaigns" if no campaign is active in the dropdown.
    return ""; 
  }
  return activeItem ? activeItem.label : "";
}

export function PageHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { campaigns, activeCampaign, setActiveCampaignId, isLoadingCampaigns } = useCampaign();

  const currentPageTitle = getCurrentPageTitle(pathname);

  const handleCampaignSelect = (campaignId: string) => {
    setActiveCampaignId(campaignId);
  };

  const handleCreateNewCampaign = () => {
    router.push('/campaign-wizard');
  };

  return (
    <div className="flex items-center h-[3.25rem] px-4 sm:px-6 lg:px-8 border-b bg-card text-card-foreground sticky top-0 z-30 shrink-0">
      {/* Removed APP_NAME and initial ChevronRight */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="px-2 py-1 h-auto text-lg hover:bg-muted/50 data-[state=open]:bg-muted/50">
            {isLoadingCampaigns ? "Loading..." : activeCampaign ? activeCampaign.name : "No Campaign"}
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Select Campaign</DropdownMenuLabel>
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
          <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
          <span className="text-lg text-muted-foreground truncate">{currentPageTitle}</span>
        </>
      )}
    </div>
  );
}
