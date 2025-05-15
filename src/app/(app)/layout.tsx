
"use client"; 

import { SidebarNav, MobileSidebarTrigger } from "@/components/layout/sidebar-nav";
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
          <SidebarInset className="flex-1">
            <main className="p-4 sm:p-6 lg:p-8 relative">
              {children}
            </main>
          </SidebarInset>
        </div>
        <RightDockedToolbar /> 
      </SidebarProvider>
    </CampaignProvider>
  );
}
