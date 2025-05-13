
"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface LevelDiscrepancyDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  partyLevels: number[]; // Array of unique, current levels in the party
  onConfirmSync: (selectedLevel: number) => void;
  onCancel: () => void; 
}

export function LevelDiscrepancyDialog({
  isOpen,
  onOpenChange,
  partyLevels,
  onConfirmSync,
  onCancel,
}: LevelDiscrepancyDialogProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>(
    partyLevels.length > 0 ? partyLevels[0] : undefined
  );

  const handleConfirm = () => {
    if (selectedLevel !== undefined) {
      onConfirmSync(selectedLevel);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) { // If dialog is closed (e.g. by clicking outside or X)
      onCancel(); // Treat as cancellation
    }
    onOpenChange(open);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleDialogClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Party Level Discrepancy</AlertDialogTitle>
          <AlertDialogDescription>
            "Link Party Level" is enabled, but your party members have different levels.
            Please choose a level to synchronize all characters to.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <Label className="mb-2 block">Select Target Level:</Label>
          <RadioGroup 
            value={selectedLevel?.toString()} 
            onValueChange={(value) => setSelectedLevel(parseInt(value))}
            className="space-y-2"
          >
            {partyLevels.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <RadioGroupItem value={level.toString()} id={`level-${level}`} />
                <Label htmlFor={`level-${level}`} className="font-normal">
                  Level {level}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => { onCancel(); onOpenChange(false); }}>
            Cancel Linking
          </Button>
          <Button onClick={handleConfirm} disabled={selectedLevel === undefined}>
            Sync to Level {selectedLevel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
