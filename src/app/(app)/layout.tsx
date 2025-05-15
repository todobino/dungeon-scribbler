
"use client"; 

import { SidebarNav, MobileSidebarTrigger } from "@/components/layout/sidebar-nav";
import { PageHeader } from "@/components/layout/PageHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CampaignProvider } from "@/contexts/campaign-context";
import { RightDockedToolbar } from "@/components/layout/RightDockedToolbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CampaignProvider>
      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen">
          <SidebarNav />
          <MobileSidebarTrigger />
          {/* This div is the main content column next to the sidebar */}
          <div className="flex flex-col flex-1 min-w-0"> {/* Added min-w-0 to prevent content overflow issues with flexbox */}
            <PageHeader /> {/* Sticky header at the top of this column */}
            {/* SidebarInset is the main scrollable content area. Padding is applied here for overall content area. */}
            <SidebarInset className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
              {children}
            </SidebarInset>
          </div>
        </div>
        <RightDockedToolbar /> 
      </SidebarProvider>
    </CampaignProvider>
  );
}
