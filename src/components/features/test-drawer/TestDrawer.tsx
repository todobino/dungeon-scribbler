
"use client";

import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Beaker, PanelBottomOpen, PanelBottomClose } from "lucide-react"; 
import { cn } from "@/lib/utils";

interface TestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DRAWER_WIDTH = "w-[380px] sm:w-[500px]";

export function TestDrawer({ open, onOpenChange }: TestDrawerProps) {
  const [isSecondaryPanelVisible, setIsSecondaryPanelVisible] = useState(false);

  const handleToggleSecondaryPanel = () => {
    setIsSecondaryPanelVisible(!isSecondaryPanelVisible);
  };

  // Ensure secondary panel closes if the main drawer is closed externally
  useEffect(() => {
    if (!open) {
      setIsSecondaryPanelVisible(false);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "flex flex-col p-0 overflow-hidden",
          DRAWER_WIDTH
        )}
        hideCloseButton={true} 
      >
        {/* Main content wrapper that has padding for the close bar */}
        <div className="flex flex-col h-full pr-8 relative">
          <SheetHeader className="p-4 border-b bg-primary text-primary-foreground flex-shrink-0">
            <SheetTitle className="flex items-center text-xl text-primary-foreground">
              <Beaker className="mr-2 h-6 w-6" /> Test Drawer
            </SheetTitle>
          </SheetHeader>

          {/* Flex container for primary and secondary panels */}
          <ScrollArea className="flex-1"> {/* Make the content area scrollable */}
            <div className="p-4"> {/* Primary panel content */}
              <h3 className="text-lg font-semibold mb-2">Primary Panel</h3>
              <p className="mb-4">This is the primary test drawer content.</p>
              <Button onClick={handleToggleSecondaryPanel} variant="outline">
                {isSecondaryPanelVisible ? (
                  <>
                    <PanelBottomClose className="mr-2 h-4 w-4" /> Hide Secondary Panel
                  </>
                ) : (
                  <>
                    <PanelBottomOpen className="mr-2 h-4 w-4" /> Show Secondary Panel Below
                  </>
                )}
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                Try clicking the button to toggle the secondary panel below.
              </p>
              {/* Add more content to primary to test scrolling if needed */}
              <div className="h-[200px] bg-background/30 my-4 flex items-center justify-center border rounded-md">Primary Placeholder Content</div>
            </div>

            {/* Secondary Panel Content (Conditionally Rendered) */}
            {isSecondaryPanelVisible && (
              <div className="p-4 bg-muted/30 border-t"> 
                <h3 className="text-lg font-semibold mb-2 text-primary">Secondary Panel</h3>
                <p>This is the secondary panel content that appears underneath when toggled.</p>
                <p className="mt-2">It will make the content scrollable if both panels are large.</p>
                {/* Add more content to secondary to test scrolling */}
                <div className="h-[300px] bg-background/30 my-4 flex items-center justify-center border rounded-md">Secondary Placeholder Content</div>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Custom Vertical Close Bar */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]"
          aria-label="Close Test Drawer"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </SheetContent>
    </Sheet>
  );
}
