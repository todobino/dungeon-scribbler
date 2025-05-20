
"use client";

import React, { useState } from 'react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronRight, Beaker, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define base widths for the content areas of the panels
const PRIMARY_PANEL_CONTENT_WIDTH_VAL = 380;
const SECONDARY_PANEL_CONTENT_WIDTH_VAL = 380;
const CLOSE_BAR_WIDTH_VAL = 32; // Corresponds to w-8 (2rem)

// Tailwind classes for panel content areas
const PRIMARY_PANEL_CLASS = `w-[${PRIMARY_PANEL_CONTENT_WIDTH_VAL}px]`;
const SECONDARY_PANEL_CLASS = `w-[${SECONDARY_PANEL_CONTENT_WIDTH_VAL}px]`;

// Tailwind classes for the overall SheetContent width
// These widths include the space for the panels AND the close bar
const PRIMARY_SHEET_WIDTH_CLASS = `w-[${PRIMARY_PANEL_CONTENT_WIDTH_VAL + CLOSE_BAR_WIDTH_VAL}px]`;
const COMBINED_SHEET_WIDTH_CLASS = `w-[${PRIMARY_PANEL_CONTENT_WIDTH_VAL + SECONDARY_PANEL_CONTENT_WIDTH_VAL + CLOSE_BAR_WIDTH_VAL}px]`;


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
          "flex flex-col p-0 overflow-hidden sm:max-w-none", // Base classes, p-0 to manage padding internally
          isSecondaryPanelVisible ? COMBINED_SHEET_WIDTH_CLASS : PRIMARY_SHEET_WIDTH_CLASS
        )}
        hideCloseButton={true} // We use a custom vertical bar
      >
        {/* Main wrapper for all content INCLUDING the space for the close bar */}
        <div className="flex flex-col h-full relative pr-8"> {/* pr-8 for the w-8 close bar */}
          {/* No SheetHeader as per request */}
          
          {/* Horizontal layout for primary and (optional) secondary panels */}
          <div className="flex flex-row flex-1 min-h-0">
            {/* Secondary Panel (Left side when visible) */}
            {isSecondaryPanelVisible && (
              <div
                className={cn(
                  SECONDARY_PANEL_CLASS,
                  "h-full bg-muted border-r border-border p-4 flex flex-col overflow-y-auto flex-shrink-0"
                )}
              >
                <h3 className="text-lg font-semibold mb-2 text-foreground">Secondary Panel</h3>
                <p className="text-sm text-muted-foreground flex-grow">
                  This is the secondary panel content. It appears to the left of the primary content.
                  Its width is fixed.
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

            {/* Primary Panel (Right side, or full width of the padded area) */}
            <div
              className={cn(
                "h-full p-4 flex flex-col overflow-y-auto",
                isSecondaryPanelVisible ? PRIMARY_PANEL_CLASS : "flex-1 w-full", // Takes fixed width if secondary is visible, else fills
                isSecondaryPanelVisible && "flex-shrink-0" // Prevent shrinking if secondary is visible
              )}
            >
              <h3 className="text-lg font-semibold mb-2 text-foreground">Primary Panel Content</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Main content of the Test Drawer. Its width adjusts.
              </p>
              <Button onClick={() => setIsSecondaryPanelVisible(prev => !prev)} className="mb-4">
                {isSecondaryPanelVisible ? (
                  <PanelLeftClose className="mr-2" />
                ) : (
                  <PanelLeftOpen className="mr-2" />
                )}
                {isSecondaryPanelVisible ? "Hide Secondary Panel" : "Show Secondary Panel Left"}
              </Button>
              <div className="mt-auto">
                <p className="text-xs text-muted-foreground">
                  SheetContent Width Class: {isSecondaryPanelVisible ? COMBINED_SHEET_WIDTH_CLASS : PRIMARY_SHEET_WIDTH_CLASS}
                  <br />
                  Primary Panel Class: {isSecondaryPanelVisible ? PRIMARY_PANEL_CLASS : "flex-1 w-full"}
                  <br />
                  {isSecondaryPanelVisible && `Secondary Panel Class: ${SECONDARY_PANEL_CLASS}`}
                </p>
              </div>
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
      </SheetContent>
    </Sheet>
  );
}
