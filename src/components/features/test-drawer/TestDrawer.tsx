
"use client";

import React, { useState, useEffect } from 'react';
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
// Fixed combined width: 380 + 250 = 630px; 500 + 300 = 800px
const COMBINED_WIDTH_CLASS = "w-[630px] sm:w-[800px]"; 

export function TestDrawer({ open, onOpenChange }: TestDrawerProps) {
  const [isSecondaryPanelVisible, setIsSecondaryPanelVisible] = useState(false);

  const handleToggleSecondaryPanel = () => {
    setIsSecondaryPanelVisible(!isSecondaryPanelVisible);
  };

  // Close secondary panel when the main drawer is closed
  useEffect(() => {
    if (!open) {
      setIsSecondaryPanelVisible(false);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setIsSecondaryPanelVisible(false); 
      }
      onOpenChange(isOpen);
    }}>
      <SheetContent
        side="right"
        className={cn(
          "flex flex-col p-0 overflow-hidden",
          COMBINED_WIDTH_CLASS // Drawer is always the combined width
        )}
        hideCloseButton={true} 
      >
        {/* Main content wrapper that has padding for the close bar */}
        <div className="flex flex-col h-full pr-8 relative"> {/* Added relative for absolute positioning of close bar */}
          <SheetHeader className="p-4 border-b bg-primary text-primary-foreground flex-shrink-0">
            <SheetTitle className="flex items-center text-xl text-primary-foreground">
              <Beaker className="mr-2 h-6 w-6" /> Test Drawer
            </SheetTitle>
          </SheetHeader>

          {/* Flex container for primary and secondary panels */}
          <div className="flex flex-1 min-h-0"> {/* Horizontal layout */}
            
            {/* Secondary Panel (Left) - Always rendered, content visibility toggled */}
            <div className={cn(
                "h-full bg-muted/50 border-r border-border p-4 flex flex-col flex-shrink-0",
                SECONDARY_PANEL_WIDTH_CLASS
            )}>
              {isSecondaryPanelVisible && (
                <>
                  <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-primary">Secondary Panel</h3>
                    <Button onClick={() => setIsSecondaryPanelVisible(false)} variant="ghost" size="sm" className="p-1 h-auto">
                      <PanelLeftClose className="h-4 w-4" />
                       <span className="sr-only">Close Secondary Panel</span>
                    </Button>
                  </div>
                  <ScrollArea className="flex-1">
                    <p>This is the secondary panel content.</p>
                    <div className="h-[150px] bg-background/30 my-2 flex items-center justify-center border rounded-md">
                      Secondary Placeholder
                    </div>
                    <div className="h-[150px] bg-background/30 my-2 flex items-center justify-center border rounded-md">
                      More Secondary Content
                    </div>
                    <div className="h-[150px] bg-background/30 my-2 flex items-center justify-center border rounded-md">
                      And Even More
                    </div>
                  </ScrollArea>
                </>
              )}
              {!isSecondaryPanelVisible && (
                 <div className="flex-1 flex items-center justify-center">
                    {/* Optionally, show a placeholder or keep it blank when secondary is hidden */}
                 </div>
              )}
            </div>

            {/* Primary Panel (Right) */}
            <div className={cn(
              "flex flex-col min-h-0 flex-shrink-0 p-4", 
              PRIMARY_PANEL_BASE_WIDTH // Primary panel always takes its base width
            )}>
              <ScrollArea className="flex-1">
                <div> 
                  <h3 className="text-lg font-semibold mb-2">Primary Panel</h3>
                  <Button onClick={handleToggleSecondaryPanel} variant="outline">
                    {isSecondaryPanelVisible ? (
                      <>
                        <PanelLeftClose className="mr-2 h-4 w-4" /> Hide Secondary Panel
                      </>
                    ) : (
                      <>
                        <PanelLeftOpen className="mr-2 h-4 w-4" /> Show Secondary Panel
                      </>
                    )}
                  </Button>
                  <p className="mt-4 text-sm text-muted-foreground">
                    This drawer has a fixed width. The secondary panel content appears on the left.
                  </p>
                  <div className="h-[100px] bg-background/30 my-2 flex items-center justify-center border rounded-md">Primary Content Block 1</div>
                  <div className="h-[100px] bg-background/30 my-2 flex items-center justify-center border rounded-md">Primary Content Block 2</div>
                  <div className="h-[100px] bg-background/30 my-2 flex items-center justify-center border rounded-md">Primary Content Block 3</div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Custom Vertical Close Bar for the main Sheet */}
        <button
          onClick={() => {
            onOpenChange(false);
            setIsSecondaryPanelVisible(false); // Also ensure secondary is hidden when main drawer closes
          }}
          className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]"
          aria-label="Close Test Drawer"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </SheetContent>
    </Sheet>
  );
}
