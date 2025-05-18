
"use client";

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Store, ChevronRight } from "lucide-react";

interface ItemShopDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemShopDrawer({ open, onOpenChange }: ItemShopDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[380px] sm:w-[500px] flex flex-col p-0 overflow-hidden"
        hideCloseButton={true}
      >
        <div className="flex flex-col h-full pr-8">
          <SheetHeader className="p-4 border-b bg-primary text-primary-foreground flex-shrink-0">
            <SheetTitle className="flex items-center text-xl text-primary-foreground">
              <Store className="mr-2 h-6 w-6" /> Item Shop
            </SheetTitle>
          </SheetHeader>

          <div className="flex-grow overflow-y-auto p-4">
            <ScrollArea className="h-full">
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground">
                  Item Shop functionality coming soon!
                </p>
                <p className="text-sm text-muted-foreground">
                  (Search items, manage inventory, generate magic items, etc.)
                </p>
              </div>
            </ScrollArea>
          </div>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]"
          aria-label="Close Item Shop Drawer"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </SheetContent>
    </Sheet>
  );
}
