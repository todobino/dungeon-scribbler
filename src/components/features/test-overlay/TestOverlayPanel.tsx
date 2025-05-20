
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { X, ChevronDown, ChevronUp, PanelBottomOpen, PanelBottomClose } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TestOverlayPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestOverlayPanel({ open, onOpenChange }: TestOverlayPanelProps) {
  const [isSecondaryVisible, setIsSecondaryVisible] = useState(false);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed bottom-16 right-6 z-[60] w-96">
      <Card className="shadow-2xl border-border bg-card text-card-foreground flex flex-col max-h-[calc(100vh-10rem)]">
        <CardHeader className="flex flex-row items-center justify-between p-3 border-b bg-muted/50">
          <CardTitle className="text-lg">Test Overlay Panel</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-7 w-7">
            <X className="h-4 w-4" />
            <span className="sr-only">Close Test Panel</span>
          </Button>
        </CardHeader>
        <ScrollArea className="flex-grow">
        <CardContent className="p-4 space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-primary">Primary Content Area</h4>
            <p className="text-sm text-muted-foreground">This is the main content of the test overlay.</p>
            <div className="h-20 bg-background/30 my-2 flex items-center justify-center border rounded-md">
              Primary Placeholder 1
            </div>
            <div className="h-20 bg-background/30 my-2 flex items-center justify-center border rounded-md">
              Primary Placeholder 2
            </div>
          </div>

          <Collapsible open={isSecondaryVisible} onOpenChange={setIsSecondaryVisible}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full">
                {isSecondaryVisible ? <PanelBottomClose className="mr-2" /> : <PanelBottomOpen className="mr-2" />}
                {isSecondaryVisible ? 'Hide Secondary Section' : 'Show Secondary Section'}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 p-3 border rounded-md bg-background/40 space-y-2 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
              <h4 className="font-semibold text-primary">Secondary Content Area</h4>
              <p className="text-sm text-muted-foreground">This content expands and collapses.</p>
              <div className="h-24 bg-background/30 my-2 flex items-center justify-center border rounded-md">
                Secondary Placeholder
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
