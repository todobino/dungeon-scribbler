
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, History, Zap, Brain, ChevronRightSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


interface PlotPoint {
  id: string;
  sessionNumber: number;
  timestamp: string;
  text: string;
}

type SummaryDetailLevel = "brief" | "normal" | "detailed";

export default function StorySoFarPage() {
  const [plotPoints, setPlotPoints] = useState<PlotPoint[]>([]);
  const [newPlotPoint, setNewPlotPoint] = useState("");
  const [currentSessionNumber, setCurrentSessionNumber] = useState(1);
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryDetailLevel, setSummaryDetailLevel] = useState<SummaryDetailLevel>("normal");
  const [isConfirmSessionAdvanceOpen, setIsConfirmSessionAdvanceOpen] = useState(false);


  useEffect(() => {
    // Load plot points from localStorage if needed
    const storedPlotPoints = localStorage.getItem("dungeonScribblerPlotPoints");
    if (storedPlotPoints) {
      setPlotPoints(JSON.parse(storedPlotPoints));
    }
    const storedSessionNumber = localStorage.getItem("dungeonScribblerCurrentSession");
    if (storedSessionNumber) {
      setCurrentSessionNumber(parseInt(storedSessionNumber, 10) || 1);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dungeonScribblerPlotPoints", JSON.stringify(plotPoints));
  }, [plotPoints]);

  useEffect(() => {
    localStorage.setItem("dungeonScribblerCurrentSession", currentSessionNumber.toString());
  }, [currentSessionNumber]);


  const handleAddPlotPoint = () => {
    if (newPlotPoint.trim()) {
      setPlotPoints(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          sessionNumber: currentSessionNumber, 
          timestamp: new Date().toISOString(), 
          text: newPlotPoint.trim() 
        }
      ]);
      setNewPlotPoint("");
    }
  };

  const handleGenerateFullSummary = async () => {
    setIsGeneratingSummary(true);
    setSummary(null);
    // Placeholder for AI call
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    setSummary(`AI Generated Full Story Summary (Detail: ${summaryDetailLevel}): Based on all plot points, the brave adventurers started their journey in session ${plotPoints[0]?.sessionNumber || 1}, uncovered a goblin plot, delved into an ancient ruin, and are now preparing to face the regional BBEG. Many exciting things happened!`);
    setIsGeneratingSummary(false);
  };
  
  const handleGenerateUpdateSummary = async (sessionNumberParam?: number) => {
    setIsGeneratingSummary(true);
    setSummary(null);
    const sessionToSummarize = sessionNumberParam !== undefined ? sessionNumberParam : currentSessionNumber;
    
    const relevantPlotPoints = plotPoints.filter(p => p.sessionNumber === sessionToSummarize);
    if (relevantPlotPoints.length === 0 && sessionNumberParam !== undefined) { // Only show this if specifically summarizing a session (not generic current)
        setSummary(`No plot points recorded for Session ${sessionToSummarize} to generate an update.`);
        setIsGeneratingSummary(false);
        return;
    }
    
    // Placeholder for AI call
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    setSummary(`AI Generated Update Summary for Session ${sessionToSummarize} (Detail: ${summaryDetailLevel}): The party recently cleared the bandit camp at the Whispering Pass and found a mysterious map fragment. They also made an uneasy alliance with the Shadowclaw Guild. This is based on the latest events for Session ${sessionToSummarize}.`);
    setIsGeneratingSummary(false);
  };

  const handleStartNextSession = async () => {
    const currentSessionPlotPoints = plotPoints.filter(p => p.sessionNumber === currentSessionNumber);
    if (currentSessionPlotPoints.length === 0) {
      setIsConfirmSessionAdvanceOpen(true);
    } else {
      // Generate summary for the current session first
      await handleGenerateUpdateSummary(currentSessionNumber);
      // Then advance
      setCurrentSessionNumber(prev => prev + 1);
    }
  };

  const handleConfirmAndAdvanceEmptySession = () => {
    // No summary is generated for an empty session that's being advanced via confirmation.
    setCurrentSessionNumber(prev => prev + 1);
    setIsConfirmSessionAdvanceOpen(false);
  };


  const groupedPlotPoints = plotPoints.reduce((acc, point) => {
    (acc[point.sessionNumber] = acc[point.sessionNumber] || []).push(point);
    return acc;
  }, {} as Record<number, PlotPoint[]>);

  const sortedSessionNumbers = Object.keys(groupedPlotPoints).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center"><History className="mr-3 h-8 w-8 text-primary"/>The Story So Far</h1>
        <Button onClick={handleStartNextSession} variant="outline">
          <ChevronRightSquare className="mr-2 h-5 w-5"/> Start Next Session ({currentSessionNumber + 1})
        </Button>
      </div>
      <p className="text-muted-foreground">Currently logging events for: <span className="font-semibold text-primary">Session {currentSessionNumber}</span></p>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Plot Point Log & Input */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Major Plot Points</CardTitle>
              <CardDescription>A chronological log of key events in your campaign, grouped by session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {plotPoints.length === 0 && (
                <p className="text-muted-foreground">No plot points recorded yet. Add the first one below!</p>
              )}
              <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-2">
                {sortedSessionNumbers.map(sessionNum => (
                  <div key={`session-${sessionNum}`}>
                    <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-card py-1 z-10 border-b">Session {sessionNum}</h3>
                    <div className="space-y-3">
                      {groupedPlotPoints[sessionNum]
                        .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                        .map(point => (
                        <div key={point.id} className="p-3 border rounded-md bg-muted/30 shadow-sm">
                          <p className="text-sm">{point.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(point.timestamp).toLocaleString()}</p>
                        </div>
                      ))}
                       {groupedPlotPoints[sessionNum].length === 0 && (
                            <p className="text-sm text-muted-foreground italic px-1">No plot points recorded for this session.</p>
                        )}
                    </div>
                  </div>
                ))}
                {plotPoints.length > 0 && sortedSessionNumbers.length === 0 && ( // Should not happen if plotPoints has items, but as a fallback
                     <p className="text-muted-foreground">No plot points recorded yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Plot Point for Session {currentSessionNumber}</CardTitle>
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
              <Button onClick={handleAddPlotPoint}><PlusCircle className="mr-2 h-5 w-5"/>Add to Log (Session {currentSessionNumber})</Button>
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
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="summary-detail-level">Summary Detail Level</Label>
                <Select value={summaryDetailLevel} onValueChange={(value) => setSummaryDetailLevel(value as SummaryDetailLevel)}>
                  <SelectTrigger id="summary-detail-level">
                    <SelectValue placeholder="Select detail level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brief">Brief</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGenerateFullSummary} className="w-full" disabled={isGeneratingSummary || plotPoints.length === 0}>
                <Zap className="mr-2 h-4 w-4" />{isGeneratingSummary ? "Generating..." : "Generate Full Summary"}
              </Button>
              <Button onClick={() => handleGenerateUpdateSummary()} className="w-full" variant="outline" disabled={isGeneratingSummary || plotPoints.filter(p => p.sessionNumber === currentSessionNumber).length === 0}>
                <Zap className="mr-2 h-4 w-4" />{isGeneratingSummary ? "Generating..." : `Session ${currentSessionNumber} Update`}
              </Button>
            </CardContent>
          </Card>

          {isGeneratingSummary && (
            <Card>
                <CardContent className="p-4">
                    <p className="text-muted-foreground animate-pulse">AI is weaving the tale with {summaryDetailLevel} detail...</p>
                </CardContent>
            </Card>
          )}

          {summary && !isGeneratingSummary && (
            <Card className="bg-primary/10 border-primary">
              <CardHeader>
                <CardTitle className="text-primary">Generated Summary</CardTitle>
                <CardDescription>Detail Level: {summaryDetailLevel}</CardDescription>
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
                <p>1. Log major events as they happen. Use "Start Next Session" to organize by play session.</p>
                <p>2. Advancing to the next session automatically summarizes the completed one if it has plot points.</p>
                <p>3. Select your desired "Summary Detail Level" for manual summaries.</p>
                <p>4. Use the AI summarizer to get a recap of the entire story or just the current session's update.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isConfirmSessionAdvanceOpen} onOpenChange={setIsConfirmSessionAdvanceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Session Advance</AlertDialogTitle>
            <AlertDialogDescription>
              You haven't added any plot points for Session {currentSessionNumber}. 
              Are you sure you want to start Session {currentSessionNumber + 1}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmSessionAdvanceOpen(false)}>Stay on Session {currentSessionNumber}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAndAdvanceEmptySession}>Yes, Start Session {currentSessionNumber + 1}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

