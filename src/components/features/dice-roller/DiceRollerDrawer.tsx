"use client";

import { useState, useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Dice5, Zap } from "lucide-react";
import { parseDiceNotation, rollMultipleDice, type ParsedDiceNotation } from "@/lib/dice-utils";
import { useToast } from "@/hooks/use-toast";

interface DiceRollerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type RollMode = "normal" | "advantage" | "disadvantage";

interface RollLogEntry {
  id: string;
  inputText: string;
  resultText: string; // e.g., "15"
  detailText: string;  // e.g., "Rolled 1d20+2: [13] + 2"
  isAdvantage?: boolean;
  isDisadvantage?: boolean;
  rolls?: number[];
  chosenRoll?: number;
  discardedRoll?: number;
  modifier?: number;
  sides?: number;
}


export function DiceRollerDrawer({ open, onOpenChange }: DiceRollerDrawerProps) {
  const [inputValue, setInputValue] = useState("");
  const [rollMode, setRollMode] = useState<RollMode>("normal");
  const [rollLog, setRollLog] = useState<RollLogEntry[]>([]);
  const { toast } = useToast();
  const uniqueId = useId();

  const handleRoll = () => {
    const notationToParse = inputValue.trim() === "" ? "1d20" : inputValue.trim();
    const parsed = parseDiceNotation(notationToParse);

    if (parsed.error) {
      toast({ title: "Invalid Dice Notation", description: parsed.error, variant: "destructive" });
      return;
    }

    if (parsed.sides <= 0 || parsed.count <= 0) {
      toast({ title: "Invalid Dice", description: "Dice sides and count must be positive.", variant: "destructive" });
      return;
    }
    
    let finalResult: number;
    let resultRolls: number[] = [];
    let detailText = "";
    let chosen: number | undefined = undefined;
    let discarded: number | undefined = undefined;

    if (rollMode === "normal") {
      const { rolls, sum } = rollMultipleDice(parsed.count, parsed.sides);
      resultRolls = rolls;
      finalResult = sum + parsed.modifier;
      detailText = `Rolled ${parsed.count}d${parsed.sides}${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+" : "") + parsed.modifier : ""}: [${rolls.join(", ")}] ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+ " : "") + Math.abs(parsed.modifier) : ""} = ${finalResult}`;
    } else { // Advantage or Disadvantage
      if (parsed.count !== 1 || parsed.sides !== 20) {
         toast({ title: "Invalid Roll for Mode", description: "Advantage/Disadvantage typically applies to a single d20 roll.", variant: "destructive" });
         // Fallback to normal roll for non-1d20 advantage/disadvantage for simplicity for now
          const { rolls, sum } = rollMultipleDice(parsed.count, parsed.sides);
          resultRolls = rolls;
          finalResult = sum + parsed.modifier;
          detailText = `Rolled ${parsed.count}d${parsed.sides}${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+" : "") + parsed.modifier : ""}: [${rolls.join(", ")}] ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+ " : "") + Math.abs(parsed.modifier) : ""} = ${finalResult} (Mode ignored)`;

      } else {
        const roll1Result = rollMultipleDice(1, 20);
        const roll2Result = rollMultipleDice(1, 20);
        const roll1 = roll1Result.sum;
        const roll2 = roll2Result.sum;

        if (rollMode === "advantage") {
          chosen = Math.max(roll1, roll2);
          discarded = Math.min(roll1, roll2);
        } else { // Disadvantage
          chosen = Math.min(roll1, roll2);
          discarded = Math.max(roll1, roll2);
        }
        finalResult = chosen + parsed.modifier;
        resultRolls = [roll1, roll2]; // Store both for potential display
        
        detailText = `Rolled 1d20 (${rollMode}) ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+" : "") + parsed.modifier : ""}: `;
        detailText += `[${roll1 === chosen ? `**${roll1}**` : roll1}, ${roll2 === chosen ? `**${roll2}**` : roll2}]`;
        detailText += ` ${parsed.modifier !== 0 ? (parsed.modifier > 0 ? "+ " : "") + Math.abs(parsed.modifier) : ""} = ${finalResult}`;
      }
    }

    const newLogEntry: RollLogEntry = {
      id: `${uniqueId}-${Date.now()}`,
      inputText: notationToParse,
      resultText: finalResult.toString(),
      detailText,
      isAdvantage: rollMode === "advantage",
      isDisadvantage: rollMode === "disadvantage",
      rolls: resultRolls,
      chosenRoll: chosen,
      discardedRoll: discarded,
      modifier: parsed.modifier,
      sides: parsed.sides,
    };

    setRollLog(prevLog => [newLogEntry, ...prevLog.slice(0, 49)]); // Keep max 50 entries
  };

  useEffect(() => {
    if (!open) {
      setRollMode("normal"); // Reset mode when drawer closes
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[350px] sm:w-[450px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center"><Dice5 className="mr-2 h-6 w-6 text-primary"/>Dice Roller</SheetTitle>
          <SheetDescription>Make quick dice rolls. Enter notation or leave blank for 1d20.</SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4 flex-grow flex flex-col">
          <div>
            <Label htmlFor="dice-notation">Dice Notation (e.g., 2d6+3, d20)</Label>
            <Input 
              id="dice-notation" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="1d20" 
            />
          </div>
          
          <div>
            <Label>Roll Mode</Label>
            <RadioGroup defaultValue="normal" value={rollMode} onValueChange={(value: string) => setRollMode(value as RollMode)} className="flex space-x-2 pt-1">
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="normal" id="mode-normal" />
                <Label htmlFor="mode-normal" className="font-normal cursor-pointer">Normal</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="advantage" id="mode-advantage" />
                <Label htmlFor="mode-advantage" className="font-normal cursor-pointer">Advantage</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="disadvantage" id="mode-disadvantage" />
                <Label htmlFor="mode-disadvantage" className="font-normal cursor-pointer">Disadvantage</Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleRoll} className="w-full">
            <Zap className="mr-2 h-5 w-5" /> Roll
          </Button>

          <div className="flex-grow flex flex-col min-h-0">
            <Label className="mb-1">Roll Log</Label>
            <ScrollArea className="border rounded-md p-2 flex-grow bg-muted/30 h-full">
              {rollLog.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No rolls yet.</p>}
              <div className="space-y-3">
                {rollLog.map(entry => (
                  <div key={entry.id} className="text-sm p-2 rounded-md bg-background shadow-sm transition-all animate-in slide-in-from-top-2 fade-in duration-300">
                    <p className="text-2xl font-bold text-primary">{entry.resultText}</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap"
                       dangerouslySetInnerHTML={{ __html: entry.detailText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} 
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}