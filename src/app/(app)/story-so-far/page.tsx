
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, History, Zap, Brain } from "lucide-react";
import { useState } from "react";

interface PlotPoint {
  id: string;
  timestamp: string;
  text: string;
}

export default function StorySoFarPage() {
  const [plotPoints, setPlotPoints] = useState<PlotPoint[]>([]);
  const [newPlotPoint, setNewPlotPoint] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const handleAddPlotPoint = () => {
    if (newPlotPoint.trim()) {
      setPlotPoints(prev => [...prev, { id: Date.now().toString(), timestamp: new Date().toISOString(), text: newPlotPoint.trim() }]);
      setNewPlotPoint("");
    }
  };

  const handleGenerateFullSummary = async () => {
    setIsGeneratingSummary(true);
    setSummary(null);
    // Placeholder for AI call
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    setSummary("AI Generated Full Story Summary: The brave adventurers started their journey in a small village, uncovered a goblin plot, delved into an ancient ruin, and are now preparing to face the regional BBEG. Many exciting things happened!");
    setIsGeneratingSummary(false);
  };
  
  const handleGenerateUpdateSummary = async () => {
    setIsGeneratingSummary(true);
    setSummary(null);
    // Placeholder for AI call
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    setSummary("AI Generated Update Summary (since last): The party recently cleared the bandit camp at the Whispering Pass and found a mysterious map fragment. They also made an uneasy alliance with the Shadowclaw Guild.");
    setIsGeneratingSummary(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center"><History className="mr-3 h-8 w-8 text-primary"/>The Story So Far</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Plot Point Log & Input */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Major Plot Points</CardTitle>
              <CardDescription>A chronological log of key events in your campaign.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {plotPoints.length === 0 && (
                <p className="text-muted-foreground">No plot points recorded yet. Add the first one below!</p>
              )}
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {plotPoints.map(point => (
                  <div key={point.id} className="p-3 border rounded-md bg-card shadow-sm">
                    <p className="text-sm">{point.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(point.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Plot Point</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="new-plot-point">Event Description</Label>
                <Textarea 
                  id="new-plot-point" 
                  value={newPlotPoint} 
                  onChange={(e) => setNewPlotPoint(e.target.value)}
                  placeholder="e.g., The party discovered the hidden cultist hideout."
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddPlotPoint}><PlusCircle className="mr-2 h-5 w-5"/>Add to Log</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: AI Summaries */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Brain className="mr-2 h-5 w-5 text-primary"/>AI Story Summarizer</CardTitle>
              <CardDescription>Generate summaries of your campaign's progress.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleGenerateFullSummary} className="w-full" disabled={isGeneratingSummary}>
                <Zap className="mr-2 h-4 w-4" />{isGeneratingSummary ? "Generating..." : "Generate Full Summary"}
              </Button>
              <Button onClick={handleGenerateUpdateSummary} className="w-full" variant="outline" disabled={isGeneratingSummary}>
                <Zap className="mr-2 h-4 w-4" />{isGeneratingSummary ? "Generating..." : "Generate Update Summary"}
              </Button>
            </CardContent>
          </Card>

          {isGeneratingSummary && (
            <Card>
                <CardContent className="p-4">
                    <p className="text-muted-foreground animate-pulse">AI is weaving the tale...</p>
                </CardContent>
            </Card>
          )}

          {summary && !isGeneratingSummary && (
            <Card className="bg-primary/10 border-primary">
              <CardHeader>
                <CardTitle className="text-primary">Generated Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{summary}</p>
              </CardContent>
            </Card>
          )}
           <Card className="mt-4">
            <CardHeader>
                <CardTitle className="text-lg">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>1. Log major events as they happen using the "Add New Plot Point" section.</p>
                <p>2. Use the AI summarizer to get a recap of the entire story or just recent events.</p>
                <p>3. "Full Summary" covers everything. "Update Summary" focuses on events since the last major summary (conceptually).</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
