
"use client";

import React, { useState } from 'react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronRight, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define content widths for the panels
const PRIMARY_PANEL_CONTENT_WIDTH_VAL = 380;
const SECONDARY_PANEL_CONTENT_WIDTH_VAL = 380; 

// Define Tailwind classes for the content width of each panel
const PRIMARY_PANEL_CLASS = `w-[${PRIMARY_PANEL_CONTENT_WIDTH_VAL}px]`;
const SECONDARY_PANEL_CLASS = `w-[${SECONDARY_PANEL_CONTENT_WIDTH_VAL}px]`;

// Define Tailwind classes for the SheetContent's overall content width (excluding close bar padding)
const PRIMARY_SHEET_CONTENT_WIDTH_CLASS = `w-[${PRIMARY_PANEL_CONTENT_WIDTH_VAL}px]`; // e.g. w-[380px]
const COMBINED_SHEET_CONTENT_WIDTH_CLASS = `w-[${PRIMARY_PANEL_CONTENT_WIDTH_VAL + SECONDARY_PANEL_CONTENT_WIDTH_VAL}px]`; // e.g. w-[760px]


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
          "flex flex-col p-0 pr-8 overflow-hidden sm:max-w-none", // p-0 and pr-8 for close bar
          isSecondaryPanelVisible ? COMBINED_SHEET_CONTENT_WIDTH_CLASS : PRIMARY_SHEET_CONTENT_WIDTH_CLASS
        )}
        hideCloseButton={true} 
      >
        {/* Horizontal layout for primary and (optional) secondary panels */}
        {/* This div will fill the space defined by SheetContent's width class (before its pr-8) */}
        <div className="flex flex-row h-full">
          
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
                Secondary panel content. Its width is fixed at {SECONDARY_PANEL_CONTENT_WIDTH_VAL}px.
              </p>
              <Button onClick={() => setIsSecondaryPanelVisible(false)} variant="outline" size="sm" className="mt-auto">
                Close Secondary
              </Button>
            </div>
          )}

          {/* Primary Panel (Right side, or full width if secondary is hidden) */}
          <div
            className={cn(
              "h-full p-4 flex flex-col overflow-y-auto flex-shrink-0", // Always has padding and flex-shrink-0
              isSecondaryPanelVisible ? PRIMARY_PANEL_CLASS : "flex-1 w-full" // Takes fixed width if secondary is visible, else fills
            )}
          >
            <h3 className="text-lg font-semibold mb-2 text-foreground">Primary Panel Content</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Main content of the Test Drawer. Its content area width should be {PRIMARY_PANEL_CONTENT_WIDTH_VAL}px.
            </p>
            <Button onClick={() => setIsSecondaryPanelVisible(prev => !prev)} className="mb-4 self-start"> {/* self-start to prevent stretching if parent is flex */}
                {isSecondaryPanelVisible ? (
                    <PanelLeftClose className="mr-2" />
                ) : (
                    <PanelLeftOpen className="mr-2" />
                )}
                {isSecondaryPanelVisible ? "Hide Secondary Panel" : "Show Secondary Panel Left"}
            </Button>
            <div className="mt-auto">
                <p className="text-xs text-muted-foreground">
                    Sheet Effective Content Width: {isSecondaryPanelVisible ? COMBINED_SHEET_CONTENT_WIDTH_CLASS : PRIMARY_SHEET_CONTENT_WIDTH_CLASS}
                    <br />
                    Primary Panel Content Width Class: {PRIMARY_PANEL_CLASS}
                    <br />
                    {isSecondaryPanelVisible && `Secondary Panel Content Width Class: ${SECONDARY_PANEL_CLASS}`}
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
      </SheetContent>
    </Sheet>
  );
}
