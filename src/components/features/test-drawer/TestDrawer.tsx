
"use client";

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronRight, Beaker, PanelLeftOpen, PanelLeftClose } from "lucide-react"; // Reverted PanelRight to PanelLeftClose for consistency
import { cn } from "@/lib/utils";

interface TestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define widths for clarity
const PRIMARY_PANEL_BASE_WIDTH = "w-[380px]";
const SECONDARY_PANEL_WIDTH_CLASS = "w-[300px]";
const COMBINED_WIDTH_CLASS = "w-[680px]"; // 380px (primary) + 300px (secondary)

export function TestDrawer({ open, onOpenChange }: TestDrawerProps) {
  const [isSecondaryPanelVisible, setIsSecondaryPanelVisible] = useState(false);

  const handlePrimaryClose = () => {
    setIsSecondaryPanelVisible(false); // Also close secondary when primary closes
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handlePrimaryClose}>
      <SheetContent
        side="right"
        className={cn(
          "flex flex-col p-0 overflow-hidden sm:max-w-none", // Added sm:max-w-none
          isSecondaryPanelVisible ? COMBINED_WIDTH_CLASS : PRIMARY_PANEL_BASE_WIDTH
        )}
        hideCloseButton={true} // Hide default X, we use the vertical bar
      >
        {/* Main wrapper for content + close bar */}
        <div className="flex flex-col h-full relative">
          <SheetHeader className="p-4 border-b bg-primary text-primary-foreground flex-shrink-0 pr-8"> {/* Added pr-8 for close bar */}
            <SheetTitle className="flex items-center text-xl text-primary-foreground">
              <Beaker className="mr-2 h-6 w-6" />
              Primary Test Drawer
            </SheetTitle>
          </SheetHeader>

          {/* Horizontal layout for primary and secondary panels */}
          <div className="flex flex-row flex-1 min-h-0 pr-8"> {/* Added pr-8 for close bar */}
            {/* Secondary Panel (Left side when visible) */}
            {isSecondaryPanelVisible && (
              <div
                className={cn(
                  SECONDARY_PANEL_WIDTH_CLASS,
                  "h-full bg-muted border-r border-border p-4 flex flex-col overflow-y-auto flex-shrink-0"
                )}
              >
                <h3 className="text-lg font-semibold mb-2">Secondary Panel</h3>
                <p className="text-sm text-muted-foreground flex-grow">
                  This is the secondary panel content. It appears to the left of the primary content.
                </p>
                <Button
                  onClick={() => setIsSecondaryPanelVisible(false)}
                  variant="outline"
                  size="sm"
                  className="mt-auto"
                >
                  Close Secondary
                </Button>
              </div>
            )}

            {/* Primary Panel (Right side, or full width) */}
            <div
              className={cn(
                "h-full p-4 flex flex-col overflow-y-auto flex-shrink-0",
                isSecondaryPanelVisible ? PRIMARY_PANEL_BASE_WIDTH : "flex-1 w-full"
              )}
            >
              <h3 className="text-lg font-semibold mb-2">Primary Panel Content</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This is the main content of the Test Drawer.
              </p>
              <Button onClick={() => setIsSecondaryPanelVisible(prev => !prev)}>
                {isSecondaryPanelVisible ? (
                  <PanelLeftClose className="mr-2 h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="mr-2 h-4 w-4" />
                )}
                {isSecondaryPanelVisible ? "Hide Secondary Panel" : "Show Secondary Panel Left"}
              </Button>
              <div className="mt-auto">
                <p className="text-xs text-muted-foreground">
                  Drawer Width: {isSecondaryPanelVisible ? COMBINED_WIDTH_CLASS : PRIMARY_PANEL_BASE_WIDTH}
                </p>
              </div>
            </div>
          </div>

          {/* Vertical Close Bar for the entire Sheet */}
          <button
            onClick={handlePrimaryClose}
            className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]"
            aria-label="Close Test Drawer"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
