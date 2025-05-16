
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, ChevronRight, ShieldQuestion } from "lucide-react";
import type { ConditionSummary, ConditionDetail } from "@/lib/types";
import { DND5E_API_BASE_URL } from "@/lib/constants";

interface StatusConditionsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StatusConditionsDrawer({ open, onOpenChange }: StatusConditionsDrawerProps) {
  const [conditions, setConditions] = useState<ConditionSummary[]>([]);
  const [conditionDetails, setConditionDetails] = useState<Record<string, ConditionDetail>>({});
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [openAccordionItem, setOpenAccordionItem] = useState<string | null>(null);

  const fetchConditionsList = useCallback(async () => {
    setIsLoadingList(true);
    setError(null);
    try {
      const response = await fetch(`${DND5E_API_BASE_URL}/api/conditions`);
      if (!response.ok) {
        throw new Error(`Failed to fetch conditions list: ${response.statusText}`);
      }
      const data = await response.json();
      setConditions(data.results || []);
    } catch (err: any) {
      setError(err.message || "Could not load conditions list.");
      setConditions([]);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (open && conditions.length === 0 && !isLoadingList) {
      fetchConditionsList();
    }
  }, [open, conditions.length, fetchConditionsList, isLoadingList]);

  const fetchConditionDetail = async (conditionIndex: string) => {
    if (conditionDetails[conditionIndex]) {
      if (openAccordionItem !== conditionIndex) {
         setOpenAccordionItem(conditionIndex);
      }
      return;
    }
    setIsLoadingDetail(prev => ({ ...prev, [conditionIndex]: true }));
    setError(null);
    try {
      const response = await fetch(`${DND5E_API_BASE_URL}/api/conditions/${conditionIndex}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch details for ${conditionIndex}: ${response.statusText}`);
      }
      const data: ConditionDetail = await response.json();
      setConditionDetails(prev => ({ ...prev, [conditionIndex]: data }));
    } catch (err: any) {
      setError(err.message || `Could not load details for ${conditionIndex}.`);
    } finally {
      setIsLoadingDetail(prev => ({ ...prev, [conditionIndex]: false }));
    }
  };

  const handleAccordionChange = (value: string) => {
    const newOpenItem = value === openAccordionItem ? null : value;
    setOpenAccordionItem(newOpenItem);
    if (newOpenItem && !conditionDetails[newOpenItem] && !isLoadingDetail[newOpenItem]) {
      fetchConditionDetail(newOpenItem);
    }
  };

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
              <ShieldQuestion className="mr-2 h-6 w-6" /> Status Conditions
            </SheetTitle>
          </SheetHeader>

          <div className="flex-grow overflow-y-auto">
            {isLoadingList ? (
              <div className="flex items-center justify-center h-full p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading conditions...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-destructive">
                <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                <p>{error}</p>
                <Button onClick={fetchConditionsList} variant="outline" className="mt-2">
                  Retry
                </Button>
              </div>
            ) : conditions.length === 0 ? (
              <p className="p-4 text-center text-muted-foreground">No conditions found.</p>
            ) : (
              <ScrollArea className="h-full">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full p-2"
                  value={openAccordionItem || ""}
                  onValueChange={handleAccordionChange}
                >
                  {conditions.map((condition) => (
                    <AccordionItem value={condition.index} key={condition.index} className="border-b border-border last:border-b-0">
                      <AccordionTrigger className="py-3 hover:bg-accent/50 px-2 rounded-md text-base">
                        {condition.name}
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-3 px-2 text-sm">
                        {isLoadingDetail[condition.index] ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2 text-muted-foreground" />
                            <span className="text-muted-foreground">Loading details...</span>
                          </div>
                        ) : conditionDetails[condition.index] ? (
                          <ul className="space-y-1 list-disc list-outside pl-4">
                            {conditionDetails[condition.index].desc.map((descLine, idx) => (
                              <li key={idx}>{descLine.replace(/^- /, '')}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground italic">Details not loaded yet.</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            )}
          </div>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]"
          aria-label="Close Status Conditions Drawer"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </SheetContent>
    </Sheet>
  );
}
