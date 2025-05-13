"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, APP_NAME, ADVANCED_NAV_ITEMS, SETTINGS_NAV_ITEMS, type NavItem } from "@/lib/constants";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export function SidebarNav() {
  const pathname = usePathname();

  const renderNavItems = (items: NavItem[], title?: string) => (
    <>
      {title && (
        <SidebarGroupLabel className="px-2 pt-4 pb-1 text-sm font-semibold text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
          {title}
        </SidebarGroupLabel>
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

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
             <Image src="https://picsum.photos/seed/dungeonsidebar/40/40" alt="Logo" width={32} height={32} className="rounded-md" data-ai-hint="fantasy scroll"/>
            <h1 className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden whitespace-nowrap">
              {APP_NAME}
            </h1>
          </Link>
        </SidebarHeader>
        <ScrollArea className="flex-grow">
          <SidebarContent className="p-2">
            {renderNavItems(NAV_ITEMS, "Core Features")}
            <SidebarSeparator className="my-4" />
            {renderNavItems(ADVANCED_NAV_ITEMS, "Advanced Tools")}
          </SidebarContent>
        </ScrollArea>
        <SidebarFooter className="p-2 border-t border-sidebar-border">
          {renderNavItems(SETTINGS_NAV_ITEMS)}
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}

export function MobileSidebarTrigger() {
    return <SidebarTrigger className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm" />;
}
