
"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronRight, Beaker, LayoutPanelLeft, LayoutPanelRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRIMARY_DRAWER_WIDTH = "w-[380px] sm:w-[500px]";
const EXTENDED_DRAWER_WIDTH = "w-[700px] sm:w-[900px]"; // Adjust as needed

export function TestDrawer({ open, onOpenChange }: TestDrawerProps) {
  const [isSecondaryPanelVisible, setIsSecondaryPanelVisible] = useState(false);

  const handleToggleSecondaryPanel = () => {
    setIsSecondaryPanelVisible(!isSecondaryPanelVisible);
  };

  // Ensure secondary panel closes if the main drawer is closed externally
  React.useEffect(() => {
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
          isSecondaryPanelVisible ? EXTENDED_DRAWER_WIDTH : PRIMARY_DRAWER_WIDTH
        )}
        hideCloseButton={true} // We use a custom close bar
      >
        {/* Main content wrapper that has padding for the close bar */}
        <div className="flex flex-col h-full pr-8 relative">
          <SheetHeader className="p-4 border-b bg-primary text-primary-foreground flex-shrink-0">
            <SheetTitle className="flex items-center text-xl text-primary-foreground">
              <Beaker className="mr-2 h-6 w-6" /> Test Drawer
            </SheetTitle>
          </SheetHeader>

          {/* Flex container for primary and secondary panels */}
          <div className="flex flex-1 min-h-0">
            {/* Primary Panel Content */}
            <div className="flex-shrink-0 w-[360px] sm:w-[480px] p-4 overflow-y-auto border-r border-border"> {/* Fixed width for primary panel */}
              <h3 className="text-lg font-semibold mb-2">Primary Panel</h3>
              <p className="mb-4">This is the primary test drawer content.</p>
              <Button onClick={handleToggleSecondaryPanel} variant="outline">
                {isSecondaryPanelVisible ? (
                  <>
                    <LayoutPanelLeft className="mr-2 h-4 w-4" /> Hide Secondary Panel
                  </>
                ) : (
                  <>
                    <LayoutPanelRight className="mr-2 h-4 w-4" /> Show Secondary Panel
                  </>
                )}
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                Try clicking the button to toggle the secondary panel. The drawer will expand or contract.
              </p>
            </div>

            {/* Secondary Panel Content (Conditionally Rendered) */}
            {isSecondaryPanelVisible && (
              <div className="flex-1 p-4 overflow-y-auto bg-muted/30">
                <h3 className="text-lg font-semibold mb-2 text-primary">Secondary Panel</h3>
                <p>This is the secondary panel content that appears when the drawer extends.</p>
                <p className="mt-2">It takes up the remaining space.</p>
              </div>
            )}
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
