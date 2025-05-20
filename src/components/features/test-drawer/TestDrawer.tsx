
"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronRight, Beaker } from "lucide-react";

interface TestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestDrawer({ open, onOpenChange }: TestDrawerProps) {
  const [isSecondaryDrawerOpen, setIsSecondaryDrawerOpen] = useState(false);

  const handlePrimaryClose = () => {
    setIsSecondaryDrawerOpen(false); // Ensure secondary closes if primary closes
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handlePrimaryClose}>
        <SheetContent
          side="right"
          className="w-[380px] sm:w-[500px] flex flex-col p-0 overflow-hidden"
          hideCloseButton={true}
        >
          <div className="flex flex-col h-full pr-8"> {/* Padding for the close bar */}
            <SheetHeader className="p-4 border-b bg-primary text-primary-foreground flex-shrink-0">
              <SheetTitle className="flex items-center text-xl text-primary-foreground">
                <Beaker className="mr-2 h-6 w-6" /> Primary Test Drawer
              </SheetTitle>
            </SheetHeader>

            <div className="flex-grow p-4 overflow-y-auto">
              <p className="mb-4">This is the primary test drawer.</p>
              <Button onClick={() => setIsSecondaryDrawerOpen(true)}>
                Open Secondary Drawer
              </Button>
            </div>
          </div>
          <button
            onClick={handlePrimaryClose}
            className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]"
            aria-label="Close Primary Test Drawer"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </SheetContent>
      </Sheet>

      {/* Secondary Drawer */}
      <Sheet open={isSecondaryDrawerOpen} onOpenChange={setIsSecondaryDrawerOpen}>
        <SheetContent
          side="right"
          className="w-[350px] sm:w-[450px] flex flex-col p-0 overflow-hidden" // Slightly smaller or styled differently
          hideCloseButton={true}
        >
          <div className="flex flex-col h-full pr-8"> {/* Padding for the close bar */}
            <SheetHeader className="p-4 border-b bg-secondary text-secondary-foreground flex-shrink-0">
              <SheetTitle className="flex items-center text-xl text-secondary-foreground">
                Secondary Drawer
              </SheetTitle>
            </SheetHeader>

            <div className="flex-grow p-4 overflow-y-auto">
              <p>This is the secondary drawer, extending from the right.</p>
              <p>It overlays the primary drawer.</p>
            </div>
          </div>
          <button
            onClick={() => setIsSecondaryDrawerOpen(false)}
            className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]"
            aria-label="Close Secondary Drawer"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </SheetContent>
      </Sheet>
    </>
  );
}
