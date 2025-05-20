
"use client";

import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Beaker, PanelLeftOpen, PanelLeftClose } from "lucide-react"; 
import { cn } from "@/lib/utils";

interface TestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRIMARY_PANEL_BASE_WIDTH = "w-[380px] sm:w-[500px]";
const SECONDARY_PANEL_WIDTH_CLASS = "w-[250px] sm:w-[300px]";
// Approximate combined widths
const COMBINED_WIDTH_CLASS = "w-[calc(380px+250px)] sm:w-[calc(500px+300px)]"; // More precise calculation for Tailwind JIT

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
          "flex flex-col p-0 overflow-hidden transition-all duration-300 ease-in-out",
          isSecondaryPanelVisible ? COMBINED_WIDTH_CLASS : PRIMARY_PANEL_BASE_WIDTH
        )}
        hideCloseButton={true} 
      >
        {/* Main content wrapper that has padding for the close bar */}
        <div className="flex flex-col h-full pr-8 relative"> {/* pr-8 for the main close bar */}
          <SheetHeader className="p-4 border-b bg-primary text-primary-foreground flex-shrink-0">
            <SheetTitle className="flex items-center text-xl text-primary-foreground">
              <Beaker className="mr-2 h-6 w-6" /> Test Drawer
            </SheetTitle>
          </SheetHeader>

          {/* Flex container for primary and secondary panels */}
          <div className="flex flex-1 min-h-0"> {/* Horizontal layout */}
            
            {/* Secondary Panel (Conditionally Rendered on the Left) */}
            {isSecondaryPanelVisible && (
              <div className={cn(
                "h-full bg-muted/50 border-r p-4 flex flex-col flex-shrink-0",
                SECONDARY_PANEL_WIDTH_CLASS
              )}>
                <h3 className="text-lg font-semibold mb-2 text-primary flex-shrink-0">Secondary Panel</h3>
                <ScrollArea className="flex-1">
                  <p>This is the secondary panel content. It appears to the left of the primary panel.</p>
                  <div className="h-[300px] bg-background/30 my-4 flex items-center justify-center border rounded-md">
                    Secondary Placeholder Content
                  </div>
                   <div className="h-[300px] bg-background/30 my-4 flex items-center justify-center border rounded-md">
                    More Secondary Content
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Primary Panel (Always Visible) */}
            <div className={cn(
              "flex flex-col min-h-0 flex-shrink-0", 
              isSecondaryPanelVisible ? PRIMARY_PANEL_BASE_WIDTH : "flex-1 w-full"
            )}>
              <ScrollArea className="flex-1">
                <div className="p-4"> 
                  <h3 className="text-lg font-semibold mb-2">Primary Panel</h3>
                  <p className="mb-4">This is the primary test drawer content.</p>
                  <Button onClick={handleToggleSecondaryPanel} variant="outline">
                    {isSecondaryPanelVisible ? (
                      <>
                        <PanelLeftClose className="mr-2 h-4 w-4" /> Hide Secondary Panel
                      </>
                    ) : (
                      <>
                        <PanelLeftOpen className="mr-2 h-4 w-4" /> Show Secondary Panel Left
                      </>
                    )}
                  </Button>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Try clicking the button to toggle the secondary panel to the left. The drawer should now expand.
                  </p>
                  <div className="h-[200px] bg-background/30 my-4 flex items-center justify-center border rounded-md">Primary Placeholder Content</div>
                   <div className="h-[200px] bg-background/30 my-4 flex items-center justify-center border rounded-md">More Primary Content</div>
                </div>
              </ScrollArea>
            </div>
          </div>
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
