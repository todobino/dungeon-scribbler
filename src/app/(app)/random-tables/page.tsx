"use client";

import type { RandomTable, RandomTableOption } from "@/lib/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dice5, ListChecks, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for random tables
const MOCK_TABLES: RandomTable[] = [
  {
    id: "weather",
    name: "Weather Conditions",
    description: "Roll for the current weather.",
    options: [
      { id: "w1", value: "Clear skies, gentle breeze." },
      { id: "w2", value: "Light overcast, cool." },
      { id: "w3", value: "Drizzling rain, misty." },
      { id: "w4", value: "Heavy rain, strong winds." },
      { id: "w5", value: "Dense fog, visibility poor." },
      { id: "w6", value: "Thunderstorm approaching." },
    ],
  },
  {
    id: "tavern-event",
    name: "Tavern Events",
    description: "Something interesting happens at the local tavern.",
    options: [
      { id: "t1", value: "A bar brawl erupts over a spilled drink." },
      { id: "t2", value: "A mysterious hooded figure offers a quest." },
      { id: "t3", value: "The local bard starts a surprisingly good (or bad) song." },
      { id: "t4", value: "Guards enter, looking for someone fitting a vague description." },
      { id: "t5", value: "A drinking contest gets out of hand." },
      { id: "t6", value: "Someone tries to pickpocket a player character." },
    ],
  },
  {
    id: "wild-magic",
    name: "Wild Magic Surges",
    description: "Unpredictable magical effects.",
    options: [
      { id: "wm1", value: "You turn blue for 1 minute." },
      { id: "wm2", value: "A unicorn appears for 1 minute." },
      { id: "wm3", value: "You cast Fireball centered on yourself." },
      { id: "wm4", value: "All your hair falls out, but regrows in 24 hours." },
      { id: "wm5", value: "For the next minute, you can only shout when you speak." },
    ],
  }
];

export default function RandomTablesPage() {
  const [tables, setTables] = useState<RandomTable[]>(MOCK_TABLES);
  const [selectedTableId, setSelectedTableId] = useState<string | undefined>(MOCK_TABLES[0]?.id);
  const [rollResult, setRollResult] = useState<RandomTableOption | null>(null);
  const { toast } = useToast();

  // In a real app, tables might be fetched or allow user creation
  // For now, using mock data.

  const handleRoll = () => {
    if (!selectedTableId) {
      toast({ title: "No Table Selected", description: "Please select a table to roll on.", variant: "destructive" });
      return;
    }
    const table = tables.find(t => t.id === selectedTableId);
    if (table && table.options.length > 0) {
      // Simple random roll for now, ignoring weights
      const randomIndex = Math.floor(Math.random() * table.options.length);
      const result = table.options[randomIndex];
      setRollResult(result);
      toast({
        title: `Rolled on "${table.name}"`,
        description: result.value,
      });
    } else {
      toast({ title: "Error Rolling", description: "The selected table has no options or could not be found.", variant: "destructive" });
    }
  };
  
  const selectedTable = tables.find(t => t.id === selectedTableId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Random Tables</h1>
        {/* <Button> <PlusCircle className="mr-2 h-5 w-5" /> Create Custom Table </Button> // Feature for later */}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Roll the Dice</CardTitle>
          <CardDescription>Select a table and see what fate has in store.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="table-select" className="block text-sm font-medium mb-1">Select Table:</label>
            <Select value={selectedTableId} onValueChange={setSelectedTableId}>
              <SelectTrigger id="table-select" className="w-full md:w-[300px]">
                <SelectValue placeholder="Choose a table..." />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.id} value={table.id}>
                    {table.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedTable && (
            <p className="text-sm text-muted-foreground">{selectedTable.description}</p>
          )}

          <Button onClick={handleRoll} disabled={!selectedTableId} className="w-full md:w-auto">
            <Zap className="mr-2 h-5 w-5" /> Roll on Table
          </Button>
        </CardContent>
      </Card>

      {rollResult && selectedTable && (
        <Card className="bg-primary/10 border-primary shadow-md">
          <CardHeader>
            <CardTitle className="text-primary">Result from "{selectedTable.name}":</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{rollResult.value}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary"/>
            <CardTitle>Available Tables</CardTitle>
          </div>
          <CardDescription>Overview of tables you can use. Custom table creation coming soon!</CardDescription>
        </CardHeader>
        <CardContent>
          {tables.length > 0 ? (
            <ul className="space-y-2">
              {tables.map(table => (
                <li key={table.id} className="p-3 rounded-md border hover:bg-muted/50 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{table.name}</h3>
                    <p className="text-xs text-muted-foreground">{table.options.length} options</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTableId(table.id)}>Select</Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">No tables available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
